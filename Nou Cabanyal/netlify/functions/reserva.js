/* GET /api/reserva?session_id=cs_...  ->  datos de una reserva para la página de confirmación */
"use strict";
const { stripe, configurado } = require("../lib/stripe.js");
const { json } = require("../lib/http.js");

exports.handler = async (event) => {
  const id = (event.queryStringParameters && event.queryStringParameters.session_id) || "";
  if (!/^cs_[A-Za-z0-9_]+$/.test(id)) return json(400, { error: "id" });
  if (!configurado()) return json(503, { error: "pagos_no_configurados" });
  try {
    const s = await stripe("GET", `/checkout/sessions/${id}`);
    const m = s.metadata || {};
    if (m.origen !== "web") return json(404, { error: "no_encontrada" });
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
