/* GET /api/reserva?session_id=cs_...  ->  datos de una reserva para la página de confirmación.
   Si el pago está confirmado, empuja la reserva a Lodgify (una sola vez) para que las fechas
   queden bloqueadas también en Booking.com y Airbnb. El webhook de Stripe hace exactamente lo
   mismo por su cuenta, así que da igual si el huésped nunca llega a ver esta página. */
"use strict";
const { stripe, configurado } = require("../lib/stripe.js");
const { json } = require("../lib/http.js");
const { empujarALodgify } = require("../lib/empujar.js");
const { codigoVisible } = require("../lib/gestion.js");

exports.handler = async (event) => {
  const id = (event.queryStringParameters && event.queryStringParameters.session_id) || "";
  if (!/^cs_[A-Za-z0-9_]+$/.test(id)) return json(400, { error: "id" });
  if (!configurado()) return json(503, { error: "pagos_no_configurados" });
  try {
    const s = await stripe("GET", `/checkout/sessions/${id}`, { expand: ["payment_intent"] });
    const m = s.metadata || {};
    if (m.origen !== "web") return json(404, { error: "no_encontrada" });

    if (s.payment_status === "paid") {
      // Si Lodgify falla no rompemos la página: el huésped ya ha pagado y el webhook reintentará.
      try {
        await empujarALodgify(s);
      } catch (e) {
        console.error("Lodgify (empujar reserva):", e.message);
      }
    }

    return json(200, {
      pagada: s.payment_status === "paid",
      casa: Number(m.casa), entrada: m.entrada, salida: m.salida, noches: Number(m.noches),
      huespedes: Number(m.huespedes), total: (s.amount_total || 0) / 100, nombre: m.nombre,
      email: s.customer_details && s.customer_details.email, idioma: m.idioma,
      codigo: m.codigo ? codigoVisible(m.codigo) : null,
    });
  } catch (e) {
    return json(404, { error: "no_encontrada" });
  }
};
