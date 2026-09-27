/* POST /api/reservar  ->  comprueba precio y disponibilidad y crea el pago en Stripe Checkout.
   El precio SIEMPRE se calcula aquí, nunca se fía del que manda el navegador. */
"use strict";
const R = require("../../assets/js/reservas.js");
const { nochesBloqueadas } = require("../lib/ocupacion.js");
const { stripe, configurado } = require("../lib/stripe.js");
const { json, sitio, casaValida } = require("../lib/http.js");

const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
function limpio(v, max) { return String(v == null ? "" : v).replace(/[\u0000-\u001f]+/g, " ").trim().slice(0, max); }

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "metodo" });
  if (!configurado()) return json(503, { error: "pagos_no_configurados" });

  let d;
  try { d = JSON.parse(event.body || "{}"); } catch (e) { return json(400, { error: "json" }); }

  const casa = casaValida(d.casa);
  const idioma = d.idioma === "en" ? "en" : "es";
  const huesped = {
    nombre: limpio(d.nombre, 80), email: limpio(d.email, 120).toLowerCase(), telefono: limpio(d.telefono, 30),
    pais: limpio(d.pais, 56), hora: limpio(d.hora, 20), mensaje: limpio(d.mensaje, 450),
  };
  if (!casa) return json(400, { error: "casa" });
  if (huesped.nombre.length < 2) return json(400, { error: "nombre" });
  if (!RE_EMAIL.test(huesped.email)) return json(400, { error: "email" });
  if (huesped.telefono.replace(/\D/g, "").length < 6) return json(400, { error: "telefono" });
  if (d.acepta !== true) return json(400, { error: "condiciones" });

  const q = R.presupuesto({ casa, entrada: d.entrada, salida: d.salida, huespedes: d.huespedes });
  if (!q.ok) return json(400, { error: q.error, dato: q.dato });

  // Disponibilidad al momento (sin caché). Si algún calendario falla, no se arriesga la venta.
  const occ = await nochesBloqueadas(casa, { fresco: true });
  if (occ.parcial) return json(503, { error: "sin_comprobar" });
  const choque = R.conflicto(q.entrada, q.salida, occ.bloqueadas);
  if (choque) return json(409, { error: "ocupado", dato: choque });

  const base = sitio(event);
  const nombreCasa = `Casa ${casa} · Aparthotel Cabanyal`;
  const desc = idioma === "es"
    ? `${q.noches} noches · entrada ${q.entrada} · salida ${q.salida} · ${q.huespedes} huésped${q.huespedes > 1 ? "es" : ""}`
    : `${q.noches} nights · check-in ${q.entrada} · check-out ${q.salida} · ${q.huespedes} guest${q.huespedes > 1 ? "s" : ""}`;
  const metadata = {
    origen: "web", casa: String(casa), entrada: q.entrada, salida: q.salida, noches: String(q.noches),
    huespedes: String(q.huespedes), total: String(q.total), nombre: huesped.nombre, telefono: huesped.telefono,
    pais: huesped.pais, hora_llegada: huesped.hora, mensaje: huesped.mensaje, idioma,
  };

  try {
    const s = await stripe("POST", "/checkout/sessions", {
      mode: "payment",
      locale: idioma,
      customer_email: huesped.email,
      line_items: [{
        quantity: 1,
        price_data: { currency: "eur", unit_amount: q.totalCentimos, product_data: { name: nombreCasa, description: desc } },
      }],
      metadata,
      payment_intent_data: { description: `Reserva ${nombreCasa} ${q.entrada} → ${q.salida}`, metadata, receipt_email: huesped.email },
      expires_at: Math.floor(Date.now() / 1000) + 31 * 60,
      success_url: `${base}/reserva-confirmada.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/casa.html?n=${casa}&cancelado=1#reservar`,
    });
    return json(200, { url: s.url, total: q.total });
  } catch (e) {
    console.error("Stripe:", e.message);
    return json(502, { error: "stripe" });
  }
};
