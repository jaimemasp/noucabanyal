/* POST /api/gestionar  ->  el asistente "Gestionar reserva" de la web.
   Cada petición lleva el código de reserva y el email: no hay sesiones ni cuentas.
   Acciones: ver · ver_cancelacion · cancelar · cotizar · cambiar · datos */
"use strict";
const { json, sitio } = require("../lib/http.js");
const { configurado } = require("../lib/stripe.js");
const G = require("../lib/gestion.js");

/* Freno sencillo contra quien pruebe códigos al azar (por instancia de la función) */
const intentos = new Map();
function frenado(ip) {
  const ahora = Date.now();
  const v = (intentos.get(ip) || []).filter((t) => ahora - t < 15 * 60 * 1000);
  intentos.set(ip, v);
  return v.length >= 12;
}
function apuntarFallo(ip) { (intentos.get(ip) || intentos.set(ip, []).get(ip)).push(Date.now()); }

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "metodo" });
  if (!configurado()) return json(503, { error: "pagos_no_configurados" });
  let d;
  try { d = JSON.parse(event.body || "{}"); } catch (e) { return json(400, { error: "json" }); }

  const h = event.headers || {};
  const ip = String(h["x-nf-client-connection-ip"] || h["x-forwarded-for"] || "?").split(",")[0].trim();
  if (frenado(ip)) return json(429, { error: "demasiados_intentos" });

  let b;
  try {
    b = await G.cargar(d.codigo, d.email);
  } catch (e) {
    if (e.codigo === "no_encontrada") { apuntarFallo(ip); return json(404, { error: "no_encontrada" }); }
    console.error("Gestión (cargar):", e.message);
    return json(502, { error: "servicio" });
  }

  try {
    switch (d.accion) {
      case "ver":
        return json(200, { reserva: G.publico(b) });
      case "ver_cancelacion":
        return json(200, { reserva: G.publico(b), cancelacion: G.vistaCancelacion(b) });
      case "cancelar": {
        const r = await G.cancelar(b);
        return json(200, { ok: true, reembolso: r.reembolso, reserva: G.publico(await G.cargar(d.codigo, d.email)) });
      }
      case "cotizar":
        return json(200, { cambio: await G.cotizar(b, d) });
      case "cambiar": {
        const r = await G.confirmarCambio(b, d, { base: sitio(event) });
        if (r.accion === "pagar") return json(200, { pagar: true, url: r.url });
        return json(200, { ok: true, accion: r.accion, reembolso: r.reembolso, reserva: G.publico(await G.cargar(d.codigo, d.email)) });
      }
      case "datos":
        await G.actualizarDatos(b, d);
        return json(200, { ok: true, reserva: G.publico(await G.cargar(d.codigo, d.email)) });
      default:
        return json(400, { error: "accion" });
    }
  } catch (e) {
    if (e.codigo) return json(e.codigo === "precio_cambiado" ? 409 : 400, { error: e.codigo, dato: e.dato });
    console.error("Gestión:", d.accion, b && b.codigo, e.message);
    return json(502, { error: "servicio" });
  }
};
