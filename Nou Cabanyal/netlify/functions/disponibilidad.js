/* GET /api/disponibilidad?casa=N  ->  noches ocupadas de la casa (para el calendario de la web) */
"use strict";
const R = require("../../assets/js/reservas.js");
const { nochesBloqueadas } = require("../lib/ocupacion.js");
const { json, casaValida } = require("../lib/http.js");

exports.handler = async (event) => {
  const casa = casaValida(event.queryStringParameters && event.queryStringParameters.casa);
  if (!casa) return json(400, { error: "casa" });
  const hoy = R.hoy();
  const hasta = R.addDays(hoy, R.precios.horizonte + R.precios.estanciaMaxima);
  const { bloqueadas, parcial, sincronizado } = await nochesBloqueadas(casa);
  const lista = [...bloqueadas].filter((d) => d >= hoy && d <= hasta).sort();
  return json(200, { casa, desde: hoy, hasta, bloqueadas: lista, parcial, sincronizado }, { "Cache-Control": "public, max-age=60" });
};
