/* Empuja a Lodgify una reserva ya pagada en Stripe. Una sola vez (la marca queda en el
   PaymentIntent) y solo si las fechas siguen libres. Lo usan la página de confirmación
   y el webhook de Stripe, para que ambos caminos hagan exactamente lo mismo. */
"use strict";

const R = require("../../assets/js/reservas.js");
const { stripe } = require("./stripe.js");
const lodgify = require("./lodgify.js");

async function empujarALodgify(s) {
  const m = (s && s.metadata) || {};
  const pi = s && s.payment_intent;

  if (m.origen !== "web") return { ok: false, motivo: "no_es_web" };
  if (s.payment_status !== "paid") return { ok: false, motivo: "no_pagada" };
  if (!pi || typeof pi !== "object") return { ok: false, motivo: "sin_payment_intent" };
  if (pi.metadata && pi.metadata.lodgify_booking_id) {
    return { ok: true, motivo: "ya_empujada", id: pi.metadata.lodgify_booking_id };
  }
  if (!lodgify.configurado()) return { ok: false, motivo: "lodgify_no_configurado" };

  const casa = Number(m.casa);

  // Última comprobación: que otra reserva de otro canal no haya ocupado las fechas mientras pagaba.
  const bloqueadas = await lodgify.disponibilidadLodgify(casa, R);
  const choque = R.conflicto(m.entrada, m.salida, bloqueadas);
  if (choque) {
    console.error(`Lodgify: conflicto el ${choque} para la sesión ${s.id} — requiere revisión manual, no se crea la reserva.`);
    return { ok: false, motivo: "conflicto", dato: choque };
  }

  const r = await lodgify.crearReserva({
    casa,
    entrada: m.entrada,
    salida: m.salida,
    huespedes: Number(m.huespedes) || 1,
    nombre: m.nombre || (s.customer_details && s.customer_details.name) || "Reserva web",
    email: s.customer_details && s.customer_details.email,
    telefono: m.telefono,
    total: (s.amount_total || 0) / 100,
    moneda: (s.currency || "eur").toUpperCase(),
    referencia: s.id,
  });
  const bookingId = r && typeof r === "object" && r.id ? r.id : r;

  // Marca para no duplicar si vuelven a cargar la confirmación o Stripe reintenta el webhook.
  await stripe("POST", `/payment_intents/${pi.id}`, { metadata: { lodgify_booking_id: String(bookingId) } });
  return { ok: true, id: bookingId };
}

module.exports = { empujarALodgify };
