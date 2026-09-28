/* Tarifas en vivo de Lodgify, cacheadas.
   Son las MISMAS tarifas que Lodgify publica en Booking.com y Airbnb, así que usándolas
   la web queda siempre en paridad de precios con los dos canales. */
"use strict";

const R = require("../../assets/js/reservas.js");
const lodgify = require("./lodgify.js");

const TTL = 10 * 60 * 1000;        // 10 minutos: las tarifas cambian despacio
const cache = new Map();

function cacheado(clave, ttlMs, fn) {
  const c = cache.get(clave);
  if (c && Date.now() - c.t < ttlMs) return c.p;
  const p = fn().catch((e) => { cache.delete(clave); throw e; });
  cache.set(clave, { t: Date.now(), p });
  return p;
}

/* Tarifas de una casa -> { inicio, dias:[precio|null], limpieza, minStay, moneda, promociones } o null */
async function tarifas(casa, { fresco } = {}) {
  if (!lodgify.configurado()) return null;
  return cacheado(`tarifas:${casa}`, fresco ? 0 : TTL, () => {
    const hoy = R.hoy();
    const hasta = R.addDays(hoy, R.precios.horizonte + R.precios.estanciaMaxima);
    return lodgify.tarifasLodgify(casa, R, { desde: hoy, hasta });
  });
}

/* Presupuesto exacto de Lodgify (sin caché: es el importe que se va a cobrar) */
function presupuesto(datos) {
  if (!lodgify.configurado()) return Promise.resolve(null);
  return lodgify.presupuestoLodgify(datos);
}

module.exports = { tarifas, presupuesto };
