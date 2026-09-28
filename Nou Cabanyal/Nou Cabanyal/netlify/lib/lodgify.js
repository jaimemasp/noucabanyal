/* Cliente mínimo de la API de Lodgify (sin dependencias).
   Usa la clave de la variable de entorno LODGIFY_API_KEY. */
"use strict";

const API = "https://api.lodgify.com";

/* Casa (1-8, la que usa esta web) <-> ID de alojamiento en Lodgify */
const CASA_A_PROPIEDAD = {
  1: 777339,
  2: 777338,
  3: 777337,
  4: 777336,
  5: 777333,
  6: 777332,
  7: 777335,
  8: 777334,
};
const PROPIEDAD_A_CASA = Object.fromEntries(Object.entries(CASA_A_PROPIEDAD).map(([c, p]) => [p, Number(c)]));

function configurado() { return Boolean(process.env.LODGIFY_API_KEY); }
function propiedadDeCasa(casa) { return CASA_A_PROPIEDAD[Number(casa)] || null; }
function casaDePropiedad(propId) { return PROPIEDAD_A_CASA[Number(propId)] || null; }

async function lodgify(method, path, body) {
  const key = process.env.LODGIFY_API_KEY;
  if (!key) { const e = new Error("Lodgify no está configurado"); e.code = "lodgify_no_configurado"; throw e; }
  const res = await fetch(API + path, {
    method,
    headers: {
      "X-ApiKey": key,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = {};
  try { json = text ? JSON.parse(text) : {}; } catch (e) { json = { raw: text }; }
  if (!res.ok) {
    const e = new Error((json && (json.message || json.error)) || `Lodgify ${res.status}`);
    e.code = "lodgify_error"; e.status = res.status; e.body = json;
    throw e;
  }
  return json;
}

module.exports = { lodgify, configurado, CASA_A_PROPIEDAD, PROPIEDAD_A_CASA, propiedadDeCasa, casaDePropiedad };
