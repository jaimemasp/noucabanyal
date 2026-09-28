/* GET /api/reserva?session_id=cs_...  ->  datos de una reserva para la página de confirmación.
   Si el pago está confirmado, empuja la reserva a Lodgify (una sola vez, usando la metadata del
   PaymentIntent como marca) para que las fechas también queden bloqueadas en Booking.com/Airbnb. */
"use strict";
const { stripe, configurado } = require("../lib/stripe.js");
const { json } = require("../lib/http.js");
const lodgify = require("../lib/lodgify.js");

async function empujarALodgify(s, m) {
  const pi = s.payment_intent;
  if (!pi || typeof pi !== "object") return; // no expandido, o pago sin payment intent (no debería pasar)
  if (pi.metadata && pi.metadata.lodgify_booking_id) return; // ya se empujó antes: no duplicar
  if (!lodgify.configurado()) return;
  try {
    const r = await lodgify.crearReserva({
      casa: Number(m.casa),
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
    await stripe("POST", `/payment_intents/${pi.id}`, { metadata: { lodgify_booking_id: String(bookingId) } });
  } catch (e) {
    // No rompemos la página de confirmación si Lodgify falla: el huésped ya ha pagado.
    // Queda sin marcar en el PaymentIntent, así que se puede reintentar más tarde (manual o recargando la página).
    console.error("Lodgify (empujar reserva):", e.message);
  }
}

exports.handler = async (event) => {
  const id = (event.queryStringParameters && event.queryStringParameters.session_id) || "";
  if (!/^cs_[A-Za-z0-9_]+$/.test(id)) return json(400, { error: "id" });
  if (!configurado()) return json(503, { error: "pagos_no_configurados" });
  try {
    const s = await stripe("GET", `/checkout/sessions/${id}`, { expand: ["payment_intent"] });
    const m = s.metadata || {};
    if (m.origen !== "web") return json(404, { error: "no_encontrada" });
    if (s.payment_status === "paid") {
      await empujarALodgify(s, m);
    }
    return json(200, {
      pagada: s.payment_status === "paid",
      casa: Number(m.casa), entrada: m.entrada, salida: m.salida, noches: Number(m.noches),
      huespedes: Number(m.huespedes), total: (s.amount_total || 0) / 100, nombre: m.nombre,
      email: s.customer_details && s.customer_details.email, idioma: m.idioma,
    });
  } catch (e) {
    return json(404, { error: "no_encontrada" });
  }
};
