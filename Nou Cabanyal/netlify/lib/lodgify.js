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
function datosReserva({ casa, entrada, salida, huespedes, nombre, email, telefono, total, moneda, referencia }) {
  const propId = propiedadDeCasa(casa);
  const roomTypeId = tipoHabitacionDeCasa(casa);
  if (!propId || !roomTypeId) { const e = new Error("Casa sin mapear en Lodgify"); e.code = "casa_no_mapeada"; throw e; }
  return {
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
}
async function crearReserva(datos) {
  return lodgify("POST", "/v1/reservation/booking", datosReserva(datos));
}

function idDe(r) { return r && typeof r === "object" && r.id ? r.id : r; }

/* Cambia fechas/huéspedes de una reserva existente. Devuelve el id de la reserva (el mismo, o
   uno nuevo si hubo que rehacerla).
   1) Intenta modificarla tal cual (PUT /v1/reservation/booking/{id}).
   2) Si Lodgify no lo acepta, la cancela y crea otra con las fechas nuevas. Si esa creación
      falla, vuelve a crear la reserva con las fechas antiguas para que el huésped no se quede
      sin nada, y da error. */
async function modificarReserva(bookingId, datos, { anterior } = {}) {
  const id = String(bookingId || "").trim();
  if (!id) { const e = new Error("Falta el id de la reserva"); e.code = "sin_booking_id"; throw e; }
  try {
    await lodgify("PUT", `/v1/reservation/booking/${encodeURIComponent(id)}`, datosReserva(datos));
    return id;
  } catch (e) {
    console.error("Lodgify: la modificación directa no funcionó, se rehace la reserva:", e.status, e.message);
  }
  await cancelarReserva(id);
  try {
    return idDe(await crearReserva(datos));
  } catch (e) {
    console.error("Lodgify: no se pudo crear la reserva con las fechas nuevas:", e.message);
    if (anterior) {
      try {
        const r = await crearReserva(Object.assign({}, datos, anterior));
        const err = new Error("cambio_no_aplicado"); err.code = "cambio_no_aplicado"; err.idRestaurado = idDe(r); throw err;
      } catch (e2) {
        if (e2.code === "cambio_no_aplicado") throw e2;
        console.error("Lodgify: GRAVE, no se pudo restaurar la reserva original:", e2.message);
      }
    }
    throw e;
  }
}

/* Cancela una reserva en Lodgify (libera esas noches en Booking, Airbnb y la web).
   OJO: la ruta buena es la de v1. La equivalente en v2 devuelve 405. */
async function cancelarReserva(bookingId) {
  const id = String(bookingId || "").trim();
  if (!id) { const e = new Error("Falta el id de la reserva"); e.code = "sin_booking_id"; throw e; }
  return lodgify("DELETE", `/v1/reservation/booking/${encodeURIComponent(id)}`);
}

/* Tarifas diarias en vivo de una casa (las mismas que Lodgify publica en Booking y Airbnb).
   Devuelve { inicio, dias:[precio|null], limpieza, minStay, moneda, promociones, checkIn, checkOut }. */
async function tarifasLodgify(casa, R, { desde, hasta } = {}) {
  const propId = propiedadDeCasa(casa);
  const roomId = tipoHabitacionDeCasa(casa);
  if (!propId || !roomId) return null;
  const inicio = desde || new Date().toISOString().slice(0, 10);
  const fin = hasta || new Date(Date.now() + 400 * 86400000).toISOString().slice(0, 10);
  const r = await lodgify("GET", `/v2/rates/calendar?RoomTypeId=${roomId}&HouseId=${propId}&StartDate=${inicio}&EndDate=${fin}`);

  const porFecha = new Map();
  let minStay = 0;
  for (const it of (r && r.calendar_items) || []) {
    const pr = (it.prices || [])[0];
    if (!it.date || !pr) continue;
    const fecha = String(it.date).slice(0, 10);
    if (typeof pr.price_per_day === "number" && pr.price_per_day > 0) porFecha.set(fecha, pr.price_per_day);
    if (typeof pr.min_stay === "number" && pr.min_stay > minStay) minStay = pr.min_stay;
  }

  const total = Math.max(0, R.diffDays(inicio, fin)) + 1;
  const dias = [];
  for (let i = 0; i < total; i++) {
    const f = R.addDays(inicio, i);
    dias.push(porFecha.has(f) ? porFecha.get(f) : null);
  }

  const aj = (r && r.rate_settings) || {};
  let limpieza = 0;
  for (const f of aj.fees || []) {
    const pz = f && f.price;
    if (f && f.fee_type === "CleaningFee" && pz && pz.rate_type === "Fixed" && typeof pz.amount === "number") limpieza += pz.amount;
  }
  const promociones = [];
  for (const pr of aj.promotions || []) {
    const pct = pr && pr.price && pr.price.percentage;
    const noches = pr && pr.minimum_stay_days;
    if (typeof pct === "number" && pct > 0 && typeof noches === "number" && noches > 0) promociones.push({ noches, porcentaje: pct });
  }

  return {
    inicio, dias, limpieza, minStay: minStay || 0,
    moneda: aj.currency_code || "EUR", promociones,
    checkIn: aj.check_in_hour, checkOut: aj.check_out_hour,
  };
}

/* Presupuesto EXACTO de Lodgify para una estancia: el mismo importe que cobraría Booking/Airbnb.
   Devuelve { total, moneda, alojamiento, promocion, limpieza, impuestos } o null si no hay presupuesto. */
async function presupuestoLodgify({ casa, entrada, salida, huespedes }) {
  const propId = propiedadDeCasa(casa);
  const roomId = tipoHabitacionDeCasa(casa);
  if (!propId || !roomId) { const e = new Error("Casa sin mapear en Lodgify"); e.code = "casa_no_mapeada"; throw e; }
  const gente = Number(huespedes) || 1;
  const r = await lodgify("GET", `/v2/quote/${propId}?arrival=${entrada}&departure=${salida}&roomTypes%5B0%5D.Id=${roomId}&roomTypes%5B0%5D.People=${gente}`);
  const q = Array.isArray(r) ? r[0] : r;
  if (!q || typeof q.total_including_vat !== "number") return null;

  const partes = { 0: 0, 1: 0, 2: 0, 4: 0 };
  for (const rt of q.room_types || []) {
    for (const pt of rt.price_types || []) {
      if (typeof pt.subtotal === "number" && pt.type in partes) partes[pt.type] += pt.subtotal;
    }
  }
  return {
    total: q.total_including_vat,
    moneda: q.currency_code || "EUR",
    alojamiento: partes[0],
    promocion: partes[1],
    limpieza: partes[2],
    impuestos: partes[4],
  };
}

module.exports = {
  lodgify, configurado, CASA_A_PROPIEDAD, PROPIEDAD_A_CASA, CASA_A_TIPO_HABITACION,
  propiedadDeCasa, casaDePropiedad, tipoHabitacionDeCasa, disponibilidadLodgify, crearReserva, modificarReserva, cancelarReserva,
  tarifasLodgify, presupuestoLodgify,
};
