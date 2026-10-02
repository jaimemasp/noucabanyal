/* Ocupación de cada casa: calendarios de Booking/Airbnb (iCal) + reservas directas pagadas en Stripe + disponibilidad en vivo de Lodgify. */
"use strict";

const R = require("../../assets/js/reservas.js");
const ical = require("./ical.js");
const { listarTodo, configurado } = require("./stripe.js");
const lodgify = require("./lodgify.js");

const RETENCION_MIN = 35;          // minutos que una reserva a medio pagar bloquea las fechas
const cache = new Map();           // caché breve mientras la función está "caliente"

function cacheado(clave, ttlMs, fn) {
  const c = cache.get(clave);
  if (c && Date.now() - c.t < ttlMs) return c.p;
  const p = fn().catch((e) => { cache.delete(clave); throw e; });
  cache.set(clave, { t: Date.now(), p });
  return p;
}

/* URLs iCal de una casa: variable ICAL_CASA_1, ICAL_CASA_2... (varias separadas por comas o espacios) */
function fuentesIcal(casa) {
  return String(process.env[`ICAL_CASA_${casa}`] || "").split(/[\s,]+/).filter((u) => /^https?:\/\//.test(u));
}

function cancelada(pi) {
  if (!pi || typeof pi !== "object") return false;
  if (pi.metadata && String(pi.metadata.cancelada || "").toLowerCase() === "si") return true;
  const ch = pi.latest_charge;
  return Boolean(ch && typeof ch === "object" && ch.refunded);
}

/* Reservas directas de Stripe: pagadas (y no canceladas) + retenidas (pago en curso) */
async function reservasDirectas({ fresco } = {}) {
  if (!configurado()) return [];
  return cacheado("stripe", fresco ? 0 : 60000, async () => {
    const desde = Math.floor(Date.now() / 1000) - 400 * 86400;
    const [pagadas, abiertas] = await Promise.all([
      listarTodo("/checkout/sessions", { status: "complete", created: { gte: desde }, expand: ["data.payment_intent.latest_charge"] }),
      listarTodo("/checkout/sessions", { status: "open", created: { gte: Math.floor(Date.now() / 1000) - RETENCION_MIN * 60 } }),
    ]);
    const out = [];
    for (const s of pagadas) {
      const m = s.metadata || {};
      if (m.origen !== "web" || s.payment_status !== "paid" || cancelada(s.payment_intent)) continue;
      // Si el huésped ha cambiado las fechas, las buenas están en el PaymentIntent
      const actual = (s.payment_intent && typeof s.payment_intent === "object" && s.payment_intent.metadata) || {};
      out.push({ id: s.id, casa: String(m.casa), entrada: actual.entrada || m.entrada, salida: actual.salida || m.salida, estado: "pagada" });
    }
    for (const s of abiertas) {
      const m = s.metadata || {};
      if (m.origen !== "web") continue;
      out.push({ id: s.id, casa: String(m.casa), entrada: m.entrada, salida: m.salida, estado: "retenida" });
    }
    return out.filter((r) => R.parse(r.entrada) && R.parse(r.salida));
  });
}

/* Noches bloqueadas de una casa -> { bloqueadas: Set, parcial: bool, errores: [] } */
async function nochesBloqueadas(casa, { fresco } = {}) {
  const set = new Set();
  const errores = [];
  const fuentes = fuentesIcal(casa);
  await Promise.all(fuentes.map(async (url, i) => {
    try {
      const eventos = await cacheado(`ical:${url}`, fresco ? 0 : 120000, () => ical.descargar(url));
      for (const ev of eventos) for (const n of R.noches(ev.inicio, ev.fin)) set.add(n);
    } catch (e) {
      errores.push(`calendario ${i + 1}: ${e.message}`);
    }
  }));
  try {
    const directas = await reservasDirectas({ fresco });
    for (const r of directas) if (r.casa === String(casa)) for (const n of R.noches(r.entrada, r.salida)) set.add(n);
  } catch (e) {
    errores.push(`stripe: ${e.message}`);
  }
  if (lodgify.configurado()) {
    try {
      const bloqueadasLodgify = await cacheado(`lodgify:${casa}`, fresco ? 0 : 120000, () => lodgify.disponibilidadLodgify(casa, R));
      for (const n of bloqueadasLodgify) set.add(n);
    } catch (e) {
      errores.push(`lodgify: ${e.message}`);
    }
  }
  return { bloqueadas: set, parcial: errores.length > 0, errores, sincronizado: fuentes.length > 0 || lodgify.configurado() };
}

module.exports = { nochesBloqueadas, reservasDirectas, fuentesIcal };
