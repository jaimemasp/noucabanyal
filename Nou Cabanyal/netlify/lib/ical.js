/* Lectura y escritura de calendarios iCal (.ics) para sincronizar con Booking y Airbnb. */
"use strict";

function aFecha(valor) {
  // 20261014  ó  20261014T150000Z  ->  2026-10-14
  const m = /^(\d{4})(\d{2})(\d{2})/.exec(valor || "");
  return m ? `${m[1]}-${m[2]}-${m[3]}` : null;
}

function sumarDia(s) {
  const d = new Date(`${s}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

/* Devuelve [{ inicio, fin }] (fin = día de salida, no incluido) */
function parsear(texto) {
  const lineas = String(texto).replace(/\r\n[ \t]/g, "").replace(/\n[ \t]/g, "").split(/\r?\n/);
  const eventos = [];
  let ev = null;
  for (const l of lineas) {
    if (l.startsWith("BEGIN:VEVENT")) ev = {};
    else if (l.startsWith("END:VEVENT")) {
      if (ev && ev.inicio) eventos.push({ inicio: ev.inicio, fin: ev.fin && ev.fin > ev.inicio ? ev.fin : sumarDia(ev.inicio) });
      ev = null;
    } else if (ev) {
      const i = l.indexOf(":");
      if (i < 0) continue;
      const nombre = l.slice(0, i).split(";")[0].toUpperCase();
      const valor = l.slice(i + 1).trim();
      if (nombre === "DTSTART") ev.inicio = aFecha(valor);
      else if (nombre === "DTEND") ev.fin = aFecha(valor);
    }
  }
  return eventos;
}

async function descargar(url, timeoutMs) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs || 8000);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { "User-Agent": "NouCabanyal-Web/1.0" } });
    if (!res.ok) throw new Error(`iCal ${res.status}`);
    return parsear(await res.text());
  } finally {
    clearTimeout(t);
  }
}

function sinGuiones(s) { return s.replace(/-/g, ""); }

function escapar(s) { return String(s).replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\n/g, "\\n"); }

/* Genera un .ics con las reservas directas: [{ id, entrada, salida, resumen }] */
function generar(nombreCalendario, reservas) {
  const ahora = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const l = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Aparhotel Cabanyal//Reservas directas//ES", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapar(nombreCalendario)}`,
  ];
  for (const r of reservas) {
    l.push(
      "BEGIN:VEVENT",
      `UID:${r.id}@noucabanyal`,
      `DTSTAMP:${ahora}`,
      `DTSTART;VALUE=DATE:${sinGuiones(r.entrada)}`,
      `DTEND;VALUE=DATE:${sinGuiones(r.salida)}`,
      `SUMMARY:${escapar(r.resumen || "Reserva directa")}`,
      "END:VEVENT"
    );
  }
  l.push("END:VCALENDAR");
  return l.join("\r\n") + "\r\n";
}

module.exports = { parsear, descargar, generar };
