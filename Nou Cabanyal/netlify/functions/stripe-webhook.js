/* POST /api/stripe-webhook  ->  Stripe avisa aquí de cada pago completado y de cada reembolso.
   Sirve de red de seguridad: si el huésped cierra el navegador justo después de pagar y nunca
   llega a la página de confirmación, la reserva se empuja igualmente a Lodgify desde aquí, así que
   las fechas quedan bloqueadas en Booking y Airbnb pase lo que pase con su navegador.

   También escucha charge.refunded: si devuelves el importe ENTERO de una reserva, la reserva se
   cancela sola en Lodgify y esas noches vuelven a venderse en los tres sitios. Los reembolsos
   parciales no la tocan, porque ahí el huésped sigue viniendo.

   Necesita la variable STRIPE_WEBHOOK_SECRET (el "signing secret" del endpoint en Stripe).
   Sin ella no acepta nada: más vale no procesar que procesar algo sin verificar. */
"use strict";
const crypto = require("crypto");
const { stripe } = require("../lib/stripe.js");
const { empujarALodgify, cancelarPorReembolso } = require("../lib/empujar.js");

const TOLERANCIA_S = 300;   // margen de reloj: se rechazan eventos de hace más de 5 minutos

/* Verifica la cabecera stripe-signature sin depender del SDK de Stripe */
function firmaValida(cuerpo, cabecera, secreto) {
  let t = null;
  const v1 = [];
  String(cabecera || "").split(",").forEach((trozo) => {
    const i = trozo.indexOf("=");
    if (i < 0) return;
    const clave = trozo.slice(0, i).trim();
    const valor = trozo.slice(i + 1).trim();
    if (clave === "t") t = valor;
    else if (clave === "v1") v1.push(valor);
  });
  if (!t || !v1.length) return false;

  const ahora = Math.floor(Date.now() / 1000);
  if (Math.abs(ahora - Number(t)) > TOLERANCIA_S) return false;

  const esperado = crypto.createHmac("sha256", secreto).update(`${t}.${cuerpo}`, "utf8").digest("hex");
  const a = Buffer.from(esperado, "utf8");
  return v1.some((v) => {
    const b = Buffer.from(v, "utf8");
    return b.length === a.length && crypto.timingSafeEqual(a, b);
  });
}

exports.handler = async (event) => {
  const secreto = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secreto) return { statusCode: 503, body: "webhook no configurado" };
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "metodo" };

  const cuerpo = event.isBase64Encoded
    ? Buffer.from(event.body || "", "base64").toString("utf8")
    : (event.body || "");

  const cab = event.headers || {};
  const firma = cab["stripe-signature"] || cab["Stripe-Signature"];
  if (!firmaValida(cuerpo, firma, secreto)) return { statusCode: 400, body: "firma no valida" };

  let evt;
  try { evt = JSON.parse(cuerpo); } catch (e) { return { statusCode: 400, body: "json" }; }

  const obj = evt.data && evt.data.object;
  const id = obj && obj.id;
  if (!id) return { statusCode: 200, body: "sin id" };

  if (evt.type === "checkout.session.completed") {
    try {
      // El evento no trae el payment_intent expandido: lo pedimos para poder marcar la reserva.
      const s = await stripe("GET", `/checkout/sessions/${id}`, { expand: ["payment_intent"] });
      const res = await empujarALodgify(s);
      console.log("Webhook Stripe (pago):", id, JSON.stringify(res));
    } catch (e) {
      // Devolvemos 500 a propósito: Stripe reintentará el aviso más tarde.
      console.error("Webhook Stripe (pago):", id, e.message);
      return { statusCode: 500, body: "error" };
    }
    return { statusCode: 200, body: "ok" };
  }

  if (evt.type === "charge.refunded") {
    try {
      const res = await cancelarPorReembolso(obj);
      console.log("Webhook Stripe (reembolso):", id, JSON.stringify(res));
    } catch (e) {
      console.error("Webhook Stripe (reembolso):", id, e.message);
      return { statusCode: 500, body: "error" };
    }
    return { statusCode: 200, body: "ok" };
  }

  return { statusCode: 200, body: "ignorado" };
};
