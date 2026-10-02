/* Gestión de reservas por el propio huésped: ver, cancelar, cambiar fechas o huéspedes y
   actualizar sus datos. Solo para reservas hechas en ESTA web (las de Booking y Airbnb se
   gestionan en su plataforma).

   Dónde vive cada cosa:
   - La reserva es el PaymentIntent "principal" de Stripe (metadata.origen = "web"). Sus metadatos
     son la fuente de verdad del estado actual: fechas, huéspedes, total, cancelada...
   - Si un cambio cuesta más, se cobra la diferencia con un pago aparte ("suplemento",
     metadata.tipo = "suplemento") que lleva el mismo código de reserva.
   - Todo se encuentra por el código de reserva (metadata.codigo) con la búsqueda de Stripe,
     y solo se enseña si el email coincide con el de la reserva.

   Política (la misma que se enseña antes de pagar):
   - Cancelación gratuita hasta 5 días antes de la llegada (ese día incluido): reembolso completo.
   - Después: se puede cancelar, pero no se devuelve nada. Las noches se liberan.
   - Un cambio hecho ya dentro de esos 5 días deja la reserva como no reembolsable, para que no
     se pueda mover a otra fecha lejana y cancelarla después con reembolso. */
"use strict";

const crypto = require("crypto");
const R = require("../../assets/js/reservas.js");
const { stripe } = require("./stripe.js");
const lodgify = require("./lodgify.js");
const tarifas = require("./tarifas.js");
const { nochesBloqueadas } = require("./ocupacion.js");

const ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";   // sin 0/O ni 1/I para que no se confundan
const RE_CODIGO = /^NC[A-HJ-NP-Z2-9]{8}$/;

function nuevoCodigo() {
  const b = crypto.randomBytes(8);
  let s = "NC";
  for (let i = 0; i < 8; i++) s += ALFABETO[b[i] % 32];
  return s;
}
function normalizarCodigo(v) { return String(v || "").toUpperCase().replace(/[^A-Z0-9]/g, ""); }
function codigoVisible(c) { return c && c.length === 10 ? `${c.slice(0, 2)}-${c.slice(2, 6)}-${c.slice(6)}` : c; }
function centimos(e) { return Math.round(Number(e) * 100); }
function euros(c) { return Math.round(Number(c)) / 100; }

function fallo(codigo, dato) { const e = new Error(codigo); e.codigo = codigo; e.dato = dato; return e; }

/* ---------- Política ---------- */
function diasCancelacion() { return R.precios.cancelacionGratisDias; }
function limiteCancelacion(entrada) { return R.addDays(entrada, -diasCancelacion()); }
function dentroDePlazo(entrada, hoy) { return (hoy || R.hoy()) <= limiteCancelacion(entrada); }

/* ---------- Cargar una reserva ---------- */
async function buscarPagos(codigo) {
  const r = await stripe("GET", "/payment_intents/search", {
    query: `metadata['codigo']:'${codigo}'`,
    expand: ["data.latest_charge"],
    limit: 50,
  });
  // La búsqueda de Stripe puede ir un minuto por detrás: releemos cada pago directamente
  // para trabajar siempre con su estado real (reembolsos, cancelación, fechas actuales).
  const ids = ((r && r.data) || []).map((p) => p.id);
  return Promise.all(ids.map((id) => stripe("GET", `/payment_intents/${id}`, { expand: ["latest_charge"] })));
}

function estadoDe(codigo, pagos) {
  const cobrados = pagos.filter((p) => p.status === "succeeded");
  const principal = cobrados.find((p) => (p.metadata || {}).origen === "web" && (p.metadata || {}).tipo !== "suplemento");
  if (!principal) return null;
  const m = principal.metadata || {};
  const suplementos = cobrados.filter((p) => (p.metadata || {}).tipo === "suplemento");

  let pagado = 0, devuelto = 0;
  const recibos = [];
  const lineas = [principal].concat(suplementos).map((p) => {
    const ch = p.latest_charge && typeof p.latest_charge === "object" ? p.latest_charge : null;
    const dev = ch ? ch.amount_refunded || 0 : 0;
    pagado += p.amount_received || 0;
    devuelto += dev;
    if (ch && ch.receipt_url) recibos.push({ url: ch.receipt_url, importe: euros(p.amount_received || 0), fecha: new Date(p.created * 1000).toISOString().slice(0, 10) });
    return { id: p.id, cobrado: p.amount_received || 0, devuelto: dev, created: p.created };
  });

  const hoy = R.hoy();
  const cancelada = String(m.cancelada || "").toLowerCase() === "si" || Boolean(m.lodgify_cancelada) ||
    Boolean(principal.latest_charge && principal.latest_charge.refunded);
  const noReembolsable = m.no_reembolsable === "1";
  const pendienteCambio = suplementos.some((p) => !(p.metadata || {}).aplicado && !(p.metadata || {}).fallido);
  const ultimo = suplementos.slice().sort((x, y) => y.created - x.created)[0];
  const ultimoSuplemento = !ultimo ? "" : (ultimo.metadata || {}).fallido ? "fallido" : (ultimo.metadata || {}).aplicado ? "aplicado" : "pendiente";

  return {
    codigo, piId: principal.id, lineas,
    email: String(principal.receipt_email || "").toLowerCase(),
    nombre: m.nombre || "", telefono: m.telefono || "", hora: m.hora_llegada || "", idioma: m.idioma || "es",
    casa: Number(m.casa), entrada: m.entrada, salida: m.salida, noches: R.diffDays(m.entrada, m.salida),
    huespedes: Number(m.huespedes) || 1,
    total: Number(m.total) || euros(principal.amount_received || 0),
    pagado: euros(pagado), devuelto: euros(devuelto), neto: euros(pagado - devuelto),
    lodgifyId: m.lodgify_booking_id || "", cambios: Number(m.cambios) || 0,
    cancelada, noReembolsable, pendienteCambio, ultimoSuplemento,
    empezada: hoy >= m.entrada,
    limite: limiteCancelacion(m.entrada),
    reembolsable: !cancelada && !noReembolsable && dentroDePlazo(m.entrada, hoy),
    recibos,
  };
}

/* Carga la reserva y comprueba el email. Si algo no cuadra, siempre el mismo error: no damos pistas. */
async function cargar(codigoBruto, emailBruto) {
  const codigo = normalizarCodigo(codigoBruto);
  const email = String(emailBruto || "").trim().toLowerCase();
  if (!RE_CODIGO.test(codigo) || !email) throw fallo("no_encontrada");
  const b = estadoDe(codigo, await buscarPagos(codigo));
  if (!b || !b.email || b.email !== email) throw fallo("no_encontrada");
  return b;
}

/* Lo que se enseña al huésped (sin ids internos) */
function publico(b) {
  return {
    codigo: codigoVisible(b.codigo), casa: b.casa, entrada: b.entrada, salida: b.salida, noches: b.noches,
    huespedes: b.huespedes, capacidad: R.capacidad(b.casa), nombre: b.nombre, telefono: b.telefono, hora: b.hora,
    total: b.total, pagado: b.pagado, devuelto: b.devuelto, neto: b.neto,
    cancelada: b.cancelada, empezada: b.empezada, reembolsable: b.reembolsable, noReembolsable: b.noReembolsable,
    limite: b.limite, diasCancelacion: diasCancelacion(), pendienteCambio: b.pendienteCambio, ultimoSuplemento: b.ultimoSuplemento,
    recibos: b.recibos,
  };
}

/* ---------- Reembolsos ---------- */
/* Devuelve `importe` céntimos empezando por los pagos más recientes (suplementos primero).
   Así el pago principal solo se devuelve entero si se cancela la reserva. */
async function devolver(b, importe, motivo) {
  let falta = Math.round(importe);
  const orden = b.lineas.slice().sort((x, y) => y.created - x.created);
  for (const l of orden) {
    if (falta <= 0) break;
    const disponible = l.cobrado - l.devuelto;
    if (disponible <= 0) continue;
    const parte = Math.min(disponible, falta);
    await stripe("POST", "/refunds", { payment_intent: l.id, amount: parte, metadata: { codigo: b.codigo, motivo } });
    falta -= parte;
  }
  return importe - falta;
}

/* ---------- Cancelar ---------- */
function vistaCancelacion(b) {
  if (b.cancelada) throw fallo("ya_cancelada");
  if (b.empezada) throw fallo("empezada");
  if (b.pendienteCambio) throw fallo("cambio_en_curso");
  return { reembolso: b.reembolsable ? b.neto : 0, limite: b.limite };
}

async function cancelar(b) {
  const v = vistaCancelacion(b);
  // 1) Primero se libera en Lodgify. Si falla, no se toca el dinero: mejor que nos escriba.
  if (b.lodgifyId) {
    try {
      await lodgify.cancelarReserva(b.lodgifyId);
    } catch (e) {
      if (e.status !== 404) { console.error("Gestión: no se pudo cancelar en Lodgify", b.codigo, e.message); throw fallo("lodgify"); }
    }
  } else {
    console.error("Gestión: cancelación sin reserva en Lodgify, revisar a mano", b.codigo);
  }
  // 2) Marca en Stripe (libera también las noches en la web y evita que el webhook repita nada)
  await stripe("POST", `/payment_intents/${b.piId}`, {
    metadata: { cancelada: "si", lodgify_cancelada: "1", cancelada_en: new Date().toISOString().slice(0, 16), cancelada_por: "huesped_web" },
  });
  // 3) Reembolso si está dentro de plazo
  let devueltoAhora = 0;
  if (v.reembolso > 0) devueltoAhora = euros(await devolver(b, centimos(v.reembolso), "cancelacion_web"));
  console.log("Gestión: reserva cancelada por el huésped", b.codigo, "reembolso", devueltoAhora);
  return { reembolso: devueltoAhora };
}

/* ---------- Cambiar fechas o huéspedes ---------- */
async function cotizar(b, d) {
  if (b.cancelada) throw fallo("ya_cancelada");
  if (b.empezada) throw fallo("empezada");
  if (b.pendienteCambio) throw fallo("cambio_en_curso");
  const nuevo = { casa: b.casa, entrada: String(d.entrada || b.entrada), salida: String(d.salida || b.salida), huespedes: Number(d.huespedes) || b.huespedes };
  if (nuevo.entrada === b.entrada && nuevo.salida === b.salida && nuevo.huespedes === b.huespedes) throw fallo("sin_cambios");

  try { const t = await tarifas.tarifas(b.casa); if (t) R.aplicarTarifas(b.casa, t); } catch (e) { console.error("Tarifas Lodgify:", e.message); }
  const q = R.presupuesto(nuevo);
  if (!q.ok) throw fallo(q.error, q.dato);

  // Disponibilidad al momento, sin contar las noches que ya son de esta reserva
  const occ = await nochesBloqueadas(b.casa, { fresco: true });
  if (occ.parcial) throw fallo("sin_comprobar");
  const propias = new Set(R.noches(b.entrada, b.salida));
  const ocupadas = new Set([...occ.bloqueadas].filter((n) => !propias.has(n)));
  const choque = R.conflicto(q.entrada, q.salida, ocupadas);
  if (choque) throw fallo("ocupado", choque);

  let desglose = null;
  try { desglose = await tarifas.presupuesto({ casa: b.casa, entrada: q.entrada, salida: q.salida, huespedes: q.huespedes }); }
  catch (e) { console.error("Presupuesto Lodgify:", e.message); }
  if (!desglose || !(desglose.total > 0)) throw fallo("precio_no_disponible");
  if (Math.abs(desglose.total - q.total) > Math.max(5, q.total * 0.1)) {
    console.error(`Gestión: divergencia de precio ${b.codigo}: web ${q.total} vs Lodgify ${desglose.total}`);
    throw fallo("precio_no_disponible");
  }

  const nuevoTotal = desglose.total;
  const diferencia = euros(centimos(nuevoTotal) - centimos(b.neto));
  const enPlazo = !b.noReembolsable && dentroDePlazo(b.entrada);
  let accion = "igual", importe = 0;
  if (diferencia > 0) { accion = "pagar"; importe = diferencia; }
  else if (diferencia < 0) { accion = enPlazo ? "devolver" : "sin_devolucion"; importe = enPlazo ? -diferencia : 0; }

  return {
    entrada: q.entrada, salida: q.salida, huespedes: q.huespedes, noches: q.noches,
    nuevoTotal, diferencia, accion, importe,
    quedaNoReembolsable: !enPlazo,
  };
}

/* Aplica unas fechas/huéspedes nuevos en Lodgify y en Stripe. Lo usan el cambio sin pago
   (desde la web) y el webhook cuando se ha pagado la diferencia. */
async function aplicarCambio(b, c) {
  const datos = {
    casa: b.casa, entrada: c.entrada, salida: c.salida, huespedes: c.huespedes,
    nombre: b.nombre || "Reserva web", email: b.email, telefono: b.telefono,
    total: c.nuevoTotal, moneda: "EUR", referencia: `${b.codigo} · ${b.piId}`,
  };
  let nuevoId = b.lodgifyId;
  if (b.lodgifyId) {
    try {
      nuevoId = await lodgify.modificarReserva(b.lodgifyId, datos, { anterior: { entrada: b.entrada, salida: b.salida, huespedes: b.huespedes, total: b.total } });
    } catch (e) {
      // La reserva antigua se ha rehecho con otro id, o se ha perdido: que quede apuntado en Stripe
      const meta = e.code === "cambio_no_aplicado" ? { lodgify_booking_id: String(e.idRestaurado || "") } : { revisar: "lodgify_sin_reserva" };
      await stripe("POST", `/payment_intents/${b.piId}`, { metadata: meta }).catch(() => {});
      if (!e.idRestaurado) console.error("Gestión: GRAVE, reserva sin bloqueo en Lodgify, revisar a mano", b.codigo);
      throw fallo("lodgify");
    }
  } else {
    const r = await lodgify.crearReserva(datos);
    nuevoId = r && typeof r === "object" && r.id ? r.id : r;
  }
  const meta = {
    entrada: c.entrada, salida: c.salida, noches: String(R.diffDays(c.entrada, c.salida)), huespedes: String(c.huespedes),
    total: String(c.nuevoTotal), lodgify_booking_id: String(nuevoId || ""),
    cambios: String(b.cambios + 1), ultimo_cambio: new Date().toISOString().slice(0, 16),
  };
  if (c.quedaNoReembolsable) meta.no_reembolsable = "1";
  await stripe("POST", `/payment_intents/${b.piId}`, { metadata: meta });
  console.log("Gestión: cambio aplicado", b.codigo, `${b.entrada}→${b.salida} ahora ${c.entrada}→${c.salida}`, "Lodgify", nuevoId);
  return nuevoId;
}

/* Cambio confirmado por el huésped. Si hay que pagar, devuelve la URL de pago; si no, lo aplica ya. */
async function confirmarCambio(b, d, { base }) {
  const c = await cotizar(b, d);
  // El precio se recalcula siempre aquí. Si no es el que vio, se le enseña el nuevo.
  if (typeof d.importe === "number" && Math.abs(d.importe - c.importe) > 0.009) throw fallo("precio_cambiado", c);

  if (c.accion === "pagar") {
    const meta = {
      origen: "cambio", tipo: "suplemento", codigo: b.codigo, pi_principal: b.piId, casa: String(b.casa),
      entrada: c.entrada, salida: c.salida, huespedes: String(c.huespedes), nuevo_total: String(c.nuevoTotal),
      no_reembolsable: c.quedaNoReembolsable ? "1" : "",
    };
    const es = b.idioma !== "en";
    const s = await stripe("POST", "/checkout/sessions", {
      mode: "payment", locale: es ? "es" : "en", customer_email: b.email,
      line_items: [{
        quantity: 1,
        price_data: {
          currency: "eur", unit_amount: centimos(c.importe),
          product_data: {
            name: es ? `Cambio de reserva ${codigoVisible(b.codigo)} · Casa ${b.casa}` : `Booking change ${codigoVisible(b.codigo)} · House ${b.casa}`,
            description: es ? `Nuevas fechas: ${c.entrada} → ${c.salida} · ${c.huespedes} huésped(es)` : `New dates: ${c.entrada} → ${c.salida} · ${c.huespedes} guest(s)`,
          },
        },
      }],
      metadata: meta,
      payment_intent_data: { description: `Cambio reserva ${codigoVisible(b.codigo)} Casa ${b.casa} ${c.entrada} → ${c.salida}`, metadata: meta, receipt_email: b.email },
      expires_at: Math.floor(Date.now() / 1000) + 31 * 60,
      success_url: `${base}/gestionar.html?c=${b.codigo}&pago={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/gestionar.html?c=${b.codigo}`,
    });
    return { accion: "pagar", url: s.url, cambio: c };
  }

  await aplicarCambio(b, c);
  let devueltoAhora = 0;
  if (c.accion === "devolver" && c.importe > 0) devueltoAhora = euros(await devolver(b, centimos(c.importe), "cambio_web"));
  return { accion: c.accion, reembolso: devueltoAhora, cambio: c };
}

/* Webhook: se ha pagado la diferencia de un cambio. Se aplica una sola vez.
   Si las fechas ya no están libres o Lodgify falla, se devuelve el suplemento entero. */
async function aplicarSuplementoPagado(s) {
  const m = (s && s.metadata) || {};
  const pi = s && s.payment_intent;
  if (m.origen !== "cambio" || s.payment_status !== "paid" || !pi || typeof pi !== "object") return { ok: false, motivo: "no_aplica" };
  if ((pi.metadata || {}).aplicado || (pi.metadata || {}).fallido) return { ok: true, motivo: "ya_procesado" };

  const pagos = await buscarPagos(m.codigo);
  // La búsqueda de Stripe tarda unos segundos en ver pagos nuevos: añadimos este a mano si no está
  if (!pagos.some((p) => p.id === pi.id)) pagos.push(Object.assign({}, pi, { status: "succeeded" }));
  const b = estadoDe(m.codigo, pagos);

  const devolverSuplemento = async (motivo) => {
    await stripe("POST", "/refunds", { payment_intent: pi.id, metadata: { codigo: m.codigo, motivo } });
    await stripe("POST", `/payment_intents/${pi.id}`, { metadata: { fallido: motivo } });
    console.error("Gestión: suplemento devuelto", m.codigo, motivo);
    return { ok: false, motivo };
  };

  if (!b || b.piId !== m.pi_principal) return devolverSuplemento("reserva_no_encontrada");
  if (b.cancelada) return devolverSuplemento("reserva_cancelada");

  const c = { entrada: m.entrada, salida: m.salida, huespedes: Number(m.huespedes), nuevoTotal: Number(m.nuevo_total), quedaNoReembolsable: m.no_reembolsable === "1" };
  const occ = await nochesBloqueadas(b.casa, { fresco: true });
  if (occ.parcial) throw new Error("No se pudo comprobar la disponibilidad; Stripe reintentará");
  const propias = new Set(R.noches(b.entrada, b.salida));
  const ocupadas = new Set([...occ.bloqueadas].filter((n) => !propias.has(n)));
  if (R.conflicto(c.entrada, c.salida, ocupadas)) return devolverSuplemento("fechas_ocupadas");

  try {
    await aplicarCambio(b, c);
  } catch (e) {
    console.error("Gestión: fallo aplicando cambio pagado", m.codigo, e.message);
    return devolverSuplemento("error_lodgify");
  }
  await stripe("POST", `/payment_intents/${pi.id}`, { metadata: { aplicado: "1" } });
  return { ok: true };
}

/* ---------- Datos del huésped ---------- */
async function actualizarDatos(b, d) {
  if (b.cancelada) throw fallo("ya_cancelada");
  const limpio = (v, max) => String(v == null ? "" : v).replace(/[\u0000-\u001f]+/g, " ").trim().slice(0, max);
  const meta = {};
  if (d.hora !== undefined) meta.hora_llegada = limpio(d.hora, 20);
  if (d.telefono !== undefined) {
    const tel = limpio(d.telefono, 30);
    if (tel.replace(/\D/g, "").length < 6) throw fallo("telefono");
    meta.telefono = tel;
  }
  if (!Object.keys(meta).length) throw fallo("sin_cambios");
  await stripe("POST", `/payment_intents/${b.piId}`, { metadata: meta });
  return meta;
}

module.exports = {
  nuevoCodigo, normalizarCodigo, codigoVisible, RE_CODIGO,
  cargar, publico, vistaCancelacion, cancelar, cotizar, confirmarCambio, aplicarSuplementoPagado, actualizarDatos,
  dentroDePlazo, limiteCancelacion,
};
