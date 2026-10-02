/* Correos de la web, enviados desde info@noucabanyal.es por el servidor SMTP de IONOS.
   Sin dependencias: habla SMTP directamente (TLS en el puerto 465).

   Variables de entorno (en Netlify):
   - SMTP_PASS     contraseña del buzón info@noucabanyal.es  (OBLIGATORIA: sin ella no se envía nada)
   - SMTP_USER     buzón que envía (por defecto info@noucabanyal.es)
   - SMTP_HOST     servidor (por defecto smtp.ionos.es; la cuenta es española, NO usar el .com)
   - SMTP_PORT     puerto (por defecto 465)
   - AVISOS_EMAIL  a quién llegan los avisos internos (por defecto info@noucabanyal.es,
                   que se reenvía al Gmail de Jaime)

   Si falta SMTP_PASS, las funciones no fallan: simplemente no envían y lo dejan en el log. */
"use strict";

const tls = require("tls");
const net = require("net");
const crypto = require("crypto");

/* Datos del alojamiento que salen en los correos. Son los mismos de assets/js/data.js:
   si cambian allí, cámbialos también aquí. */
const ALOJAMIENTO = {
  nombre: "Aparthotel Cabanyal",
  web: "https://noucabanyal.es",
  direccion: "Carrer de Vicent Brull, 73, 46011 València",
  mapa: "https://www.google.com/maps/search/?api=1&query=39.4659008,-0.3327226",
  telefono: "+34 671 44 92 74",
  whatsapp: "34671449274",
  entrada: "16:00",
  salida: "11:00",
  diasCancelacion: 5,
};

function config() {
  return {
    host: process.env.SMTP_HOST || "smtp.ionos.es",
    port: Number(process.env.SMTP_PORT) || 465,
    user: process.env.SMTP_USER || "info@noucabanyal.es",
    pass: process.env.SMTP_PASS || "",
    avisos: process.env.AVISOS_EMAIL || process.env.SMTP_USER || "info@noucabanyal.es",
    inseguro: process.env.SMTP_INSEGURO === "1",     // solo para pruebas locales
  };
}
function configurado() { return Boolean(config().pass); }

/* ---------- Cliente SMTP mínimo ---------- */
function enviarSMTP({ desde, para, mensaje }) {
  const c = config();
  return new Promise((resolve, reject) => {
    const sock = c.inseguro ? net.connect(c.port, c.host) : tls.connect({ host: c.host, port: c.port, servername: c.host });
    sock.setEncoding("utf8");
    sock.setTimeout(20000, () => { sock.destroy(); reject(new Error("SMTP: tiempo agotado")); });
    sock.on("error", (e) => reject(new Error("SMTP: " + e.message)));

    let buffer = "", esperando = null;
    sock.on("data", (d) => {
      buffer += d;
      // Una respuesta termina en una línea "NNN texto" (con espacio tras el código)
      const lineas = buffer.split("\r\n");
      for (let i = 0; i < lineas.length - 1; i++) {
        if (/^\d{3} /.test(lineas[i]) || /^\d{3}$/.test(lineas[i])) {
          const resp = lineas.slice(0, i + 1).join("\n");
          buffer = lineas.slice(i + 1).join("\r\n");
          const cb = esperando; esperando = null;
          if (cb) cb(resp);
          return;
        }
      }
    });
    const leer = () => new Promise((ok) => { esperando = ok; });
    const cmd = async (linea, codigos) => {
      if (linea !== null) sock.write(linea + "\r\n");
      const r = await leer();
      const code = Number(r.slice(0, 3));
      if (!codigos.includes(code)) {
        const visible = linea && linea.startsWith("AUTH") ? "AUTH" : (linea || "saludo");
        throw new Error(`SMTP ${visible} → ${r.replace(/\s+/g, " ").slice(0, 160)}`);
      }
      return r;
    };

    (async () => {
      await cmd(null, [220]);
      await cmd("EHLO noucabanyal.es", [250]);
      await cmd("AUTH LOGIN", [334]);
      await cmd(Buffer.from(c.user).toString("base64"), [334]);
      await cmd(Buffer.from(c.pass).toString("base64"), [235]);
      await cmd(`MAIL FROM:<${desde}>`, [250]);
      for (const p of para) await cmd(`RCPT TO:<${p}>`, [250, 251]);
      await cmd("DATA", [354]);
      // "Dot-stuffing": una línea que empieza por punto se dobla
      const cuerpo = mensaje.replace(/\r?\n/g, "\r\n").replace(/^\./gm, "..");
      await cmd(cuerpo + "\r\n.", [250]);
      sock.write("QUIT\r\n");
      sock.end();
      resolve(true);
    })().catch((e) => { sock.destroy(); reject(e); });
  });
}

/* ---------- Construcción del mensaje (MIME) ---------- */
function cabecera(texto) { return /^[\x20-\x7e]*$/.test(texto) ? texto : `=?UTF-8?B?${Buffer.from(texto).toString("base64")}?=`; }
function b64(texto) { return Buffer.from(texto, "utf8").toString("base64").replace(/.{1,76}/g, "$&\r\n").trim(); }

function componer({ desde, para, responderA, asunto, texto, html }) {
  const frontera = "nc-" + crypto.randomBytes(12).toString("hex");
  return [
    `From: ${cabecera(ALOJAMIENTO.nombre)} <${desde}>`,
    `To: ${para.join(", ")}`,
    responderA ? `Reply-To: ${responderA}` : null,
    `Subject: ${cabecera(asunto)}`,
    `Date: ${new Date().toUTCString().replace("GMT", "+0000")}`,
    `Message-ID: <${crypto.randomBytes(12).toString("hex")}@noucabanyal.es>`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${frontera}"`,
    "",
    `--${frontera}`,
    "Content-Type: text/plain; charset=utf-8",
    "Content-Transfer-Encoding: base64",
    "",
    b64(texto),
    `--${frontera}`,
    "Content-Type: text/html; charset=utf-8",
    "Content-Transfer-Encoding: base64",
    "",
    b64(html),
    `--${frontera}--`,
    "",
  ].filter((l) => l !== null).join("\r\n");
}

async function enviar({ para, asunto, texto, html, responderA }) {
  const c = config();
  const destinos = [].concat(para).filter(Boolean);
  if (!destinos.length) return { ok: false, motivo: "sin_destinatario" };
  if (!c.pass) { console.log("Correo no enviado (falta SMTP_PASS):", asunto, "→", destinos.join(", ")); return { ok: false, motivo: "no_configurado" }; }
  const mensaje = componer({ desde: c.user, para: destinos, responderA: responderA || c.user, asunto, texto, html });
  await enviarSMTP({ desde: c.user, para: destinos, mensaje });
  console.log("Correo enviado:", asunto, "→", destinos.join(", "));
  return { ok: true };
}

/* ---------- Plantillas ---------- */
function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
function fecha(ds, idioma) {
  try { return new Intl.DateTimeFormat(idioma === "en" ? "en-GB" : "es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(ds + "T00:00:00Z")); }
  catch (e) { return ds; }
}
function euros(n, idioma) { return Number(n).toLocaleString(idioma === "en" ? "en-GB" : "es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €"; }
function codigoVisible(c) { return c && c.length === 10 ? `${c.slice(0, 2)}-${c.slice(2, 6)}-${c.slice(6)}` : c; }
function enlaceGestion(codigo) { return `${ALOJAMIENTO.web}/gestionar?c=${encodeURIComponent(codigoVisible(codigo))}`; }
function limite(entrada) { const d = new Date(entrada + "T00:00:00Z"); d.setUTCDate(d.getUTCDate() - ALOJAMIENTO.diasCancelacion); return d.toISOString().slice(0, 10); }

/* Esqueleto común: { titulo, intro, filas:[[etiqueta, valor]], boton:{texto,url}, parrafos:[] } */
function plantilla({ idioma, titulo, intro, filas, boton, parrafos, pie }) {
  const en = idioma === "en";
  const filasHtml = (filas || []).map(([k, v]) =>
    `<tr><td style="padding:6px 12px 6px 0;color:#6a767d;vertical-align:top;white-space:nowrap">${esc(k)}</td><td style="padding:6px 0;color:#1c2830;font-weight:600">${esc(v)}</td></tr>`).join("");
  const html = `<!doctype html><html><body style="margin:0;background:#f6f1e8;font-family:Helvetica,Arial,sans-serif;color:#1c2830">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f1e8;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fffdf9;border-radius:16px;padding:28px">
<tr><td style="font-family:Georgia,serif;font-size:22px;color:#1d4f63;padding-bottom:18px">${esc(ALOJAMIENTO.nombre)}</td></tr>
<tr><td style="font-family:Georgia,serif;font-size:26px;line-height:1.25;padding-bottom:10px">${esc(titulo)}</td></tr>
<tr><td style="font-size:16px;line-height:1.55;padding-bottom:16px">${esc(intro)}</td></tr>
${filasHtml ? `<tr><td style="border-top:1px solid #e2d8c6;border-bottom:1px solid #e2d8c6;padding:10px 0"><table role="presentation" cellpadding="0" cellspacing="0" style="font-size:15px">${filasHtml}</table></td></tr>` : ""}
${boton ? `<tr><td style="padding:22px 0 6px"><a href="${esc(boton.url)}" style="display:inline-block;background:#c8603b;color:#fff;text-decoration:none;font-weight:600;padding:13px 22px;border-radius:999px">${esc(boton.texto)}</a></td></tr>` : ""}
${(parrafos || []).map((p) => `<tr><td style="font-size:15px;line-height:1.55;color:#3d4a52;padding-top:12px">${esc(p)}</td></tr>`).join("")}
<tr><td style="font-size:13px;line-height:1.5;color:#6a767d;padding-top:26px;border-top:1px solid #e2d8c6;margin-top:20px">
${esc(ALOJAMIENTO.nombre)} · ${esc(ALOJAMIENTO.direccion)}<br>
${en ? "Questions? Reply to this email or WhatsApp us" : "¿Dudas? Responde a este correo o escríbenos por WhatsApp"}: <a href="https://wa.me/${ALOJAMIENTO.whatsapp}" style="color:#1d4f63">${esc(ALOJAMIENTO.telefono)}</a>
${pie ? `<br>${esc(pie)}` : ""}</td></tr>
</table></td></tr></table></body></html>`;
  const texto = [ALOJAMIENTO.nombre, "", titulo, "", intro, "",
    ...(filas || []).map(([k, v]) => `${k}: ${v}`), "",
    boton ? `${boton.texto}: ${boton.url}` : null, "",
    ...(parrafos || []), "",
    "—", `${ALOJAMIENTO.nombre} · ${ALOJAMIENTO.direccion}`, `WhatsApp: ${ALOJAMIENTO.telefono}`, pie || null,
  ].filter((l) => l !== null).join("\n");
  return { html, texto };
}

function filasReserva(r, idioma) {
  const en = idioma === "en";
  const n = Number(r.noches) || 0;
  return [
    [en ? "Booking code" : "Código de reserva", codigoVisible(r.codigo)],
    [en ? "Apartment" : "Apartamento", `${en ? "House" : "Casa"} ${r.casa}`],
    [en ? "Check-in" : "Entrada", `${fecha(r.entrada, idioma)} · ${en ? "from" : "desde las"} ${ALOJAMIENTO.entrada}`],
    [en ? "Check-out" : "Salida", `${fecha(r.salida, idioma)} · ${en ? "by" : "antes de las"} ${ALOJAMIENTO.salida}`],
    [en ? "Nights" : "Noches", String(n)],
    [en ? "Guests" : "Huéspedes", String(r.huespedes)],
  ];
}

/* 1) Confirmación de una reserva nueva (al huésped) */
function confirmacion(r) {
  const en = r.idioma === "en";
  const lim = limite(r.entrada);
  const p = plantilla({
    idioma: r.idioma,
    titulo: en ? "Your booking is confirmed" : "Tu reserva está confirmada",
    intro: en ? `Thank you, ${r.nombre}. We’ve received your payment and your apartment is waiting for you.`
      : `Gracias, ${r.nombre}. Hemos recibido tu pago y tu apartamento te está esperando.`,
    filas: filasReserva(r, r.idioma).concat([
      [en ? "Total paid" : "Total pagado", euros(r.total, r.idioma)],
      [en ? "Cancellation" : "Cancelación", en ? `Free until ${fecha(lim, "en")} (inclusive)` : `Gratuita hasta el ${fecha(lim, "es")} (incluido)`],
    ]),
    boton: { texto: en ? "Manage my booking" : "Gestionar mi reserva", url: enlaceGestion(r.codigo) },
    parrafos: [
      en ? "With your booking code and this email address you can change dates, cancel or update your arrival time on our website."
        : "Con tu código de reserva y este email puedes cambiar fechas, cancelar o actualizar tu hora de llegada en nuestra web.",
      en ? `Address: ${ALOJAMIENTO.direccion}. Self check-in with a smart lock: 48 hours before arrival you’ll receive the access codes for the building and your apartment.`
        : `Dirección: ${ALOJAMIENTO.direccion}. La entrada es autónoma, con cerradura inteligente: 48 horas antes de tu llegada recibirás los códigos de acceso al edificio y a tu apartamento.`,
      en ? "Before arrival we’ll ask for your travellers’ details, as guest registration is a legal requirement in Spain."
        : "Antes de llegar te pediremos los datos de los viajeros, porque el registro es obligatorio por ley.",
    ],
    pie: en ? `Map: ${ALOJAMIENTO.mapa}` : `Mapa: ${ALOJAMIENTO.mapa}`,
  });
  return { asunto: en ? `Booking confirmed · ${codigoVisible(r.codigo)} · ${ALOJAMIENTO.nombre}` : `Reserva confirmada · ${codigoVisible(r.codigo)} · ${ALOJAMIENTO.nombre}`, ...p };
}

/* 2) Cambio de fechas/huéspedes (al huésped) */
function cambio(r, extra) {
  const en = r.idioma === "en";
  const parrafos = [];
  if (extra && extra.pagado > 0) parrafos.push(en ? `We charged ${euros(extra.pagado, "en")} for the difference.` : `Hemos cobrado ${euros(extra.pagado, "es")} de diferencia.`);
  if (extra && extra.reembolso > 0) parrafos.push(en ? `We’ve refunded ${euros(extra.reembolso, "en")} to your card (5–10 days).` : `Te hemos devuelto ${euros(extra.reembolso, "es")} a tu tarjeta (tarda de 5 a 10 días).`);
  if (r.noReembolsable) parrafos.push(en ? "As the change was made within the last days before arrival, the booking is now non-refundable." : "Como el cambio se hizo en los últimos días antes de la llegada, la reserva ya no es reembolsable.");
  const p = plantilla({
    idioma: r.idioma,
    titulo: en ? "Your booking has been changed" : "Tu reserva ha cambiado",
    intro: en ? "These are the new details of your stay:" : "Estos son los nuevos datos de tu estancia:",
    filas: filasReserva(r, r.idioma).concat([[en ? "Price of the stay" : "Precio de la estancia", euros(r.total, r.idioma)]]),
    boton: { texto: en ? "Manage my booking" : "Gestionar mi reserva", url: enlaceGestion(r.codigo) },
    parrafos,
  });
  return { asunto: en ? `Booking changed · ${codigoVisible(r.codigo)}` : `Reserva modificada · ${codigoVisible(r.codigo)}`, ...p };
}

/* 3) Cancelación (al huésped) */
function cancelacion(r, reembolso) {
  const en = r.idioma === "en";
  const p = plantilla({
    idioma: r.idioma,
    titulo: en ? "Your booking has been cancelled" : "Tu reserva está cancelada",
    intro: reembolso > 0
      ? (en ? `We’ve refunded ${euros(reembolso, "en")} to the card you paid with. It usually takes 5 to 10 days to show.` : `Te hemos devuelto ${euros(reembolso, "es")} a la tarjeta con la que pagaste. Suele tardar entre 5 y 10 días en aparecer.`)
      : (en ? "As it was outside the free cancellation period, there is no refund." : "Como estaba fuera del plazo de cancelación gratuita, no hay reembolso."),
    filas: filasReserva(r, r.idioma),
    boton: { texto: en ? "Book again" : "Volver a reservar", url: ALOJAMIENTO.web },
    parrafos: [en ? "We hope to welcome you another time." : "Esperamos recibirte en otra ocasión."],
  });
  return { asunto: en ? `Booking cancelled · ${codigoVisible(r.codigo)}` : `Reserva cancelada · ${codigoVisible(r.codigo)}`, ...p };
}

/* 4) "¿No tienes el código?" (al huésped) */
function recordatorio(reservas, idioma) {
  const en = idioma === "en";
  const lineas = reservas.map((r) => `${codigoVisible(r.codigo)} · ${en ? "House" : "Casa"} ${r.casa} · ${r.entrada} → ${r.salida}`);
  const p = plantilla({
    idioma,
    titulo: en ? "Your booking code" : "Tu código de reserva",
    intro: en ? "You asked us for your booking code. Here it is:" : "Nos has pedido tu código de reserva. Aquí lo tienes:",
    filas: reservas.map((r) => [codigoVisible(r.codigo), `${en ? "House" : "Casa"} ${r.casa} · ${fecha(r.entrada, idioma)} → ${fecha(r.salida, idioma)}`]),
    boton: reservas.length === 1 ? { texto: en ? "Manage my booking" : "Gestionar mi reserva", url: enlaceGestion(reservas[0].codigo) } : { texto: en ? "Manage my booking" : "Gestionar mi reserva", url: `${ALOJAMIENTO.web}/gestionar` },
    parrafos: [en ? "If you didn’t ask for this, you can ignore this email." : "Si no lo has pedido tú, puedes ignorar este correo."],
  });
  p.texto += "\n\n" + lineas.join("\n");
  return { asunto: en ? "Your booking code · Aparthotel Cabanyal" : "Tu código de reserva · Aparthotel Cabanyal", ...p };
}

/* 5) Avisos internos (para Jaime), siempre en castellano */
function aviso(tipo, r, detalles) {
  const titulos = {
    nueva: "Nueva reserva en la web",
    cambio: "Un huésped ha cambiado su reserva",
    cancelacion: "Un huésped ha cancelado su reserva",
    datos: "Un huésped ha actualizado sus datos",
    conflicto: "ATENCIÓN: pago cobrado pero las fechas ya estaban ocupadas",
    suplemento_devuelto: "Cambio pagado que no se pudo aplicar (se ha devuelto el pago)",
  };
  const filas = [
    ["Código", codigoVisible(r.codigo) || "—"], ["Casa", String(r.casa)], ["Entrada", r.entrada], ["Salida", r.salida],
    ["Huéspedes", String(r.huespedes)], ["Nombre", r.nombre || "—"], ["Email", r.email || "—"], ["Teléfono", r.telefono || "—"],
    ["Hora de llegada", r.hora || "—"], ["Total estancia", r.total != null ? euros(r.total, "es") : "—"],
  ].concat((detalles || []).map((d) => [d[0], String(d[1])]));
  const parrafos = [];
  if (tipo === "conflicto") parrafos.push("La reserva NO se ha creado en Lodgify porque alguna de esas noches ya estaba ocupada por otro canal. Hay que contactar con el huésped y devolverle el dinero (o buscarle alternativa) desde el panel de Stripe.");
  if (r.mensaje) parrafos.push(`Mensaje del huésped: ${r.mensaje}`);
  const p = plantilla({ idioma: "es", titulo: titulos[tipo] || tipo, intro: "Detalles:", filas, parrafos });
  return { asunto: `${tipo === "conflicto" ? "⚠️ " : ""}${titulos[tipo] || tipo} · Casa ${r.casa} · ${r.entrada}`, ...p };
}

/* ---------- Envíos de alto nivel (nunca rompen el flujo de quien los llama) ---------- */
async function seguro(nombre, fn) {
  try { return await fn(); } catch (e) { console.error(`Correo (${nombre}) falló:`, e.message); return { ok: false, motivo: "error", error: e.message }; }
}
function aDueno(m) { return enviar({ para: config().avisos, asunto: m.asunto, texto: m.texto, html: m.html }); }
function aHuesped(email, m) { return enviar({ para: email, asunto: m.asunto, texto: m.texto, html: m.html }); }

module.exports = {
  ALOJAMIENTO, configurado, enviar, enviarSMTP, componer,
  confirmacion, cambio, cancelacion, recordatorio, aviso,
  seguro, aDueno, aHuesped, codigoVisible,
};
