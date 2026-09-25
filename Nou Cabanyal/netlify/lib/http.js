"use strict";
const CABECERAS = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" };
function json(status, data, extra) { return { statusCode: status, headers: Object.assign({}, CABECERAS, extra || {}), body: JSON.stringify(data) }; }
function sitio(event) {
  const env = process.env.SITE_URL || process.env.URL;
  if (env) return env.replace(/\/$/, "");
  const h = (event && event.headers) || {};
  const host = h["x-forwarded-host"] || h.host;
  return host ? `https://${host}` : "";
}
function casaValida(v) { const n = parseInt(v, 10); return n >= 1 && n <= 8 ? n : null; }
module.exports = { json, sitio, casaValida };
