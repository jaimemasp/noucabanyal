/* GET /api/calendario?casa=N&token=XXX  ->  calendario .ics con las reservas directas pagadas.
   Esta dirección se pega en Booking y Airbnb ("importar calendario") para que bloqueen esas fechas. */
"use strict";
const ical = require("../lib/ical.js");
const { reservasDirectas } = require("../lib/ocupacion.js");
const { casaValida } = require("../lib/http.js");

exports.handler = async (event) => {
  const q = event.queryStringParameters || {};
  const token = process.env.ICAL_EXPORT_TOKEN;
  if (!token || q.token !== token) return { statusCode: 403, body: "Acceso denegado" };
  const casa = casaValida(q.casa);
  if (!casa) return { statusCode: 400, body: "Casa no válida" };
  let reservas = [];
  try {
    reservas = (await reservasDirectas({ fresco: true })).filter((r) => r.casa === String(casa) && r.estado === "pagada");
  } catch (e) {
    return { statusCode: 502, body: "No se pudo leer Stripe" };
  }
  const cuerpo = ical.generar(`Aparhotel Cabanyal · Casa ${casa} (web)`,
    reservas.map((r) => ({ id: r.id, entrada: r.entrada, salida: r.salida, resumen: "Reserva directa web" })));
  return { statusCode: 200, headers: { "Content-Type": "text/calendar; charset=utf-8", "Cache-Control": "no-store" }, body: cuerpo };
};
