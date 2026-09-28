/* GET /api/lodgify-debug?token=XXX  ->  diagnóstico temporal de la API de Lodgify (protegido por ICAL_EXPORT_TOKEN) */
"use strict";
const { lodgify, configurado, CASA_A_PROPIEDAD } = require("../lib/lodgify.js");
const { json } = require("../lib/http.js");

exports.handler = async (event) => {
  const token = (event.queryStringParameters && event.queryStringParameters.token) || "";
  if (!process.env.ICAL_EXPORT_TOKEN || token !== process.env.ICAL_EXPORT_TOKEN) return json(403, { error: "token" });
  if (!configurado()) return json(503, { error: "lodgify_no_configurado" });

  const out = [];
  for (const [casa, propId] of Object.entries(CASA_A_PROPIEDAD)) {
    const item = { casa: Number(casa), property_id: propId };
    try {
      const p = await lodgify("GET", `/v2/properties/${propId}`);
      item.nombre = p.name;
      item.room_types = (p.rooms || p.room_types || []).map((r) => ({ id: r.id, nombre: r.name }));
    } catch (e) {
      item.error_properties = { message: e.message, status: e.status, body: e.body };
    }
    out.push(item);
  }

  // --- SOLO para depurar el formato real de la disponibilidad (sin tocar datos de otras propiedades) ---
  const debug = {};
  try {
    debug.availability = await lodgify("GET", "/v2/availability/777339?start=2026-09-28&end=2026-12-31");
  } catch (e) {
    debug.availability_error = { message: e.message, status: e.status, body: e.body };
  }

  return json(200, { propiedades: out, debug });
};
