/* GET /api/precios?casa=N  ->  tarifas en vivo de la casa (las mismas de Booking/Airbnb vía Lodgify).
   La web las usa para pintar el calendario y calcular el total, de modo que el precio que ve el
   huésped es exactamente el mismo que vería en Booking o Airbnb. */
"use strict";
const { tarifas } = require("../lib/tarifas.js");
const { json, casaValida } = require("../lib/http.js");

exports.handler = async (event) => {
  const casa = casaValida(event.queryStringParameters && event.queryStringParameters.casa);
  if (!casa) return json(400, { error: "casa" });
  try {
    const t = await tarifas(casa);
    if (!t) return json(200, { casa, disponible: false }, { "Cache-Control": "public, max-age=300" });
    return json(200, {
      casa, disponible: true,
      inicio: t.inicio, dias: t.dias, limpieza: t.limpieza,
      minStay: t.minStay, moneda: t.moneda, promociones: t.promociones,
    }, { "Cache-Control": "public, max-age=300" });
  } catch (e) {
    console.error("Tarifas Lodgify:", e.message);
    return json(200, { casa, disponible: false, error: "tarifas_no_disponibles" });
  }
};
