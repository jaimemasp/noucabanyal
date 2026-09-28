/* Diagnóstico temporal de Lodgify (protegido por ICAL_EXPORT_TOKEN).
   ?token=X&propiedad=1&casa=N              -> datos de la propiedad (verificar el mapeo casa -> Lodgify)
   ?token=X&disp=1&casa=N[&desde&hasta]     -> respuesta CRUDA de disponibilidad
   ?token=X&tarifas=1&casa=N[&desde&hasta]  -> prueba varios endpoints de tarifas y devuelve lo que funcione
   ?token=X&crear_prueba=1[&entrada&salida] -> crea una reserva de prueba
   ?token=X&cancelar=<id>                   -> cancela una reserva por id            */
"use strict";
const { crearReserva, configurado, lodgify, propiedadDeCasa, tipoHabitacionDeCasa } = require("../lib/lodgify.js");
const { json } = require("../lib/http.js");

const dentroDe = (dias) => new Date(Date.now() + dias * 86400000).toISOString().slice(0, 10);

async function probar(metodo, ruta) {
  try {
    return { ruta, ok: true, respuesta: await lodgify(metodo, ruta) };
  } catch (e) {
    return { ruta, ok: false, status: e.status, error: e.message, body: e.body };
  }
}

exports.handler = async (event) => {
  const q = event.queryStringParameters || {};
  if (!process.env.ICAL_EXPORT_TOKEN || (q.token || "") !== process.env.ICAL_EXPORT_TOKEN) return json(403, { error: "token" });
  if (!configurado()) return json(503, { error: "lodgify_no_configurado" });

  const casa = Number(q.casa) || 1;
  const propId = propiedadDeCasa(casa);
  const roomId = tipoHabitacionDeCasa(casa);
  const desde = q.desde || dentroDe(0);
  const hasta = q.hasta || dentroDe(60);

  if (q.propiedad === "1") {
    return json(200, { casa, propId, roomId, intentos: [await probar("GET", `/v2/properties/${propId}`)] });
  }

  if (q.disp === "1") {
    return json(200, { casa, propId, desde, hasta, intentos: [await probar("GET", `/v2/availability/${propId}?start=${desde}&end=${hasta}`)] });
  }

  if (q.tarifas === "1") {
    const rutas = [
      `/v2/rates/calendar?HouseId=${propId}&StartDate=${desde}&EndDate=${hasta}`,
      `/v2/rates/calendar?propertyId=${propId}&startDate=${desde}&endDate=${hasta}`,
      `/v2/rates?HouseId=${propId}&StartDate=${desde}&EndDate=${hasta}`,
      `/v1/rates?HouseId=${propId}&StartDate=${desde}&EndDate=${hasta}`,
      `/v2/rates/settings?HouseId=${propId}`,
      `/v2/quote/${propId}?arrival=${desde}&departure=${hasta}&roomTypes%5B0%5D.Id=${roomId}&roomTypes%5B0%5D.People=2`,
    ];
    const intentos = [];
    for (const r of rutas) intentos.push(await probar("GET", r));
    return json(200, { casa, propId, roomId, desde, hasta, intentos });
  }

  if (q.cancelar) {
    return json(200, await probar("DELETE", `/v1/reservation/booking/${q.cancelar}`));
  }

  if (q.crear_prueba === "1") {
    try {
      const r = await crearReserva({
        casa, entrada: q.entrada || dentroDe(60), salida: q.salida || dentroDe(62), huespedes: 1,
        nombre: "PRUEBA CLAUDE — BORRAR", total: 1, moneda: "EUR", referencia: "TEST-" + Date.now(),
      });
      return json(200, { ok: true, reserva: r });
    } catch (e) {
      return json(200, { ok: false, error: { message: e.message, status: e.status, body: e.body } });
    }
  }

  return json(200, { info: "parámetros: propiedad=1 | disp=1 | tarifas=1 | crear_prueba=1 | cancelar=<id>   (+ casa, desde, hasta)" });
};
