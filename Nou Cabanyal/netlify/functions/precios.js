/* GET /api/precios?casa=N  ->  tarifas en vivo de la casa (las mismas de Booking/Airbnb vía Lodgify).
   La web las usa para pintar el calendario y calcular el total, de modo que el precio que ve el
   huésped es exactamente el mismo que vería en Booking o Airbnb. */
"use strict";
const { tarifas } = require("../lib/tarifas.js");
const { json, casaValida } = require("../lib/http.js");

/* Precio mínimo por noche de una casa en los próximos N días ("desde X €") */
function desdeDe(t, dias) {
  if (!t || !t.dias) return null;
  let min = Infinity;
  for (let i = 0; i < Math.min(t.dias.length, dias); i++) {
    const p = t.dias[i];
    if (typeof p === "number" && p > 0 && p < min) min = p;
  }
  return min === Infinity ? null : min;
}

exports.handler = async (event) => {
  const q = event.queryStringParameters || {};

  // ?resumen=1 -> precio "desde" de todas las casas, para las tarjetas de la portada
  if (q.resumen === "1") {
    const casas = {};
    await Promise.all([1, 2, 3, 4, 5, 6, 7, 8].map(async (n) => {
      try {
        const t = await tarifas(n);
        const d = desdeDe(t, 60);
        if (d) casas[n] = { desde: d };
      } catch (e) { /* esa casa se queda con el precio de respaldo */ }
    }));
    return json(200, { casas }, { "Cache-Control": "public, max-age=300" });
  }

  const casa = casaValida(q.casa);
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
