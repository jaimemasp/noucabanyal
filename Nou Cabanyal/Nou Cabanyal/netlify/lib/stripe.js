/* Cliente mínimo de la API de Stripe (sin dependencias).
   Usa la clave secreta de la variable de entorno STRIPE_SECRET_KEY. */
"use strict";

const API = process.env.STRIPE_API_BASE || "https://api.stripe.com/v1";

function encode(obj, prefix, out) {
  out = out || [];
  Object.keys(obj).forEach((k) => {
    const v = obj[k];
    if (v === undefined || v === null) return;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (Array.isArray(v)) {
      v.forEach((item, i) => {
        if (item !== null && typeof item === "object") encode(item, `${key}[${i}]`, out);
        else out.push(`${encodeURIComponent(`${key}[]`)}=${encodeURIComponent(String(item))}`);
      });
    } else if (typeof v === "object") {
      encode(v, key, out);
    } else {
      out.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`);
    }
  });
  return out;
}

function configurado() { return Boolean(process.env.STRIPE_SECRET_KEY); }

async function stripe(method, path, params) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) { const e = new Error("Stripe no está configurado"); e.code = "stripe_no_configurado"; throw e; }
  const body = params ? encode(params).join("&") : "";
  const url = API + path + (method === "GET" && body ? `?${body}` : "");
  const res = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: method === "GET" ? undefined : body,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const e = new Error((json.error && json.error.message) || `Stripe ${res.status}`);
    e.code = "stripe_error"; e.status = res.status;
    throw e;
  }
  return json;
}

/* Recorre todas las páginas de un listado (máx. 2.000 elementos) */
async function listarTodo(path, params) {
  const out = [];
  let starting_after;
  for (let i = 0; i < 20; i++) {
    const page = await stripe("GET", path, Object.assign({ limit: 100 }, params, starting_after ? { starting_after } : {}));
    out.push(...page.data);
    if (!page.has_more || !page.data.length) break;
    starting_after = page.data[page.data.length - 1].id;
  }
  return out;
}

module.exports = { stripe, listarTodo, configurado, encode };
