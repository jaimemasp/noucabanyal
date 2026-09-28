/* GET /api/lodgify-debug?token=XXX  ->  info no sensible de cada casa en Lodgify
   (nombre y "room type id"), para configurar la integración una sola vez.
   No devuelve la clave de la API en ningún momento. Usa el mismo token que /api/calendario. */
"use strict";
const { lodgify, configurado, CASA_A_PROPIEDAD } = require("../lib/lodgify.js");
const { json } = require("../lib/http.js");

exports.handler = async (event) => {
  const q = event.queryStringParameters || {};
  const token = process.env.ICAL_EXPORT_TOKEN;
  if (!token || q.token !== token) return { statusCode: 403, body: "Acceso denegado" };
  if (!configurado()) return json(503, { error: "lodgify_no_configurado" });

  const resultado = [];
  for (const [casa, propId] of Object.entries(CASA_A_PROPIEDAD)) {
    try {
      const p = await lodgify("GET", `/v2/properties/${propId}`);
      resultado.push({
        casa: Number(casa),
        property_id: propId,
        nombre: p.name,
        room_types: (p.rooms || p.room_types || []).map((r) => ({ id: r.id, nombre: r.name })),
      });
    } catch (e) {
      resultado.push({ casa: Number(casa), property_id: propId, error: e.message, detalle: e.body || null });
    }
  }
  return json(200, resultado);
};
