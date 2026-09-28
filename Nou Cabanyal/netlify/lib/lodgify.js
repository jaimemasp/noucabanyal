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

/* Casa (1-8) <-> ID del "room type" de esa casa en Lodgify (hay uno por casa) */
const CASA_A_TIPO_HABITACION = {
  1: 844481,
  2: 844480,
  3: 844479,
  4: 844478,
  5: 844475,
  6: 844474,
  7: 844477,
  8: 844476,
};

function configurado() { return Boolean(process.env.LODGIFY_API_KEY); }
function propiedadDeCasa(casa) { return CASA_A_PROPIEDAD[Number(casa)] || null; }
function casaDePropiedad(propId) { return PROPIEDAD_A_CASA[Number(propId)] || null; }
function tipoHabitacionDeCasa(casa) { return CASA_A_TIPO_HABITACION[Number(casa)] || null; }

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

/* Disponibilidad en vivo de una casa -> Set de noches "bloqueadas" (YYYY-MM-DD, noche de entrada)
   OJO: en Lodgify, el "end" de un periodo es el ULTIMO DIA OCUPADO (inclusive), no la fecha de salida.
   Por eso sumamos un día antes de pasarlo a R.noches(), que excluye el día final. */
async function disponibilidadLodgify(casa, R, { desde, hasta } = {}) {
  const propId = propiedadDeCasa(casa);
  if (!propId) return new Set();
  const hoy = desde || new Date().toISOString().slice(0, 10);
  const fin = hasta || new Date(Date.now() + 400 * 86400000).toISOString().slice(0, 10);
  const resp = await lodgify("GET", `/v2/availability/${propId}?start=${hoy}&end=${fin}`);
  const set = new Set();
  for (const habitacion of resp || []) {
    for (const p of habitacion.periods || []) {
      if (p.available === 0) for (const n of R.noches(p.start, R.addDays(p.end, 1))) set.add(n);
    }
  }
  return set;
}

/* Crea una reserva real en Lodgify (bloquea esas fechas en todos los canales).
   Formato confirmado con la documentación oficial de Lodgify (POST /v1/reservation/booking). */
async function crearReserva({ casa, entrada, salida, huespedes, nombre, email, telefono, total, moneda, referencia }) {
  const propId = propiedadDeCasa(casa);
  const roomTypeId = tipoHabitacionDeCasa(casa);
  if (!propId || !roomTypeId) { const e = new Error("Casa sin mapear en Lodgify"); e.code = "casa_no_mapeada"; throw e; }
  const payload = {
    guest: { name: nombre, email: email || undefined, phone: telefono || undefined },
    status: "Booked",
    property_id: propId,
    arrival: entrada,
    departure: salida,
    bookability: "InstantBooking",
    origin: "manual",
    total: total,
    currency_code: moneda || "EUR",
    source_text: `Reserva web Aparthotel Cabanyal · ${referencia}`,
    rooms: [{ room_type_id: roomTypeId, people: huespedes || 1, key_code: "" }],
  };
  return lodgify("POST", "/v1/reservation/booking", payload);
}

module.exports = {
  lodgify, configurado, CASA_A_PROPIEDAD, PROPIEDAD_A_CASA, CASA_A_TIPO_HABITACION,
  propiedadDeCasa, casaDePropiedad, tipoHabitacionDeCasa, disponibilidadLodgify, crearReserva,
};
