/* GET /api/lodgify-debug?token=XXX&crear_prueba=1  ->  diagnóstico temporal de Lodgify (protegido por ICAL_EXPORT_TOKEN) */
"use strict";
const { crearReserva, configurado } = require("../lib/lodgify.js");
const { json } = require("../lib/http.js");

exports.handler = async (event) => {
  const q = event.queryStringParameters || {};
  const token = q.token || "";
  if (!process.env.ICAL_EXPORT_TOKEN || token !== process.env.ICAL_EXPORT_TOKEN) return json(403, { error: "token" });
  if (!configurado()) return json(503, { error: "lodgify_no_configurado" });

  if (q.crear_prueba !== "1") return json(200, { info: "añade &crear_prueba=1 para lanzar la reserva de prueba" });

  try {
    const r = await crearReserva({
      casa: 1,
      entrada: "2028-01-15",
      salida: "2028-01-16",
      huespedes: 1,
      nombre: "PRUEBA CLAUDE — BORRAR",
      email: undefined,
      telefono: undefined,
      total: 1,
      moneda: "EUR",
      referencia: "TEST-" + Date.now(),
    });
    return json(200, { ok: true, reserva: r });
  } catch (e) {
    return json(200, { ok: false, error: { message: e.message, status: e.status, body: e.body } });
  }
};
