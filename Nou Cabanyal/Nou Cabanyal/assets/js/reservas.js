/* Aparthotel Cabanyal — lógica común de reservas (la usan la web y el servidor de pagos).
   Calcula noches, precios y valida una estancia. No toca nada de pagos. */
(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) module.exports = factory(require("./precios.js"));
  else root.NC_RESERVAS = factory(root.NC_PRECIOS);
})(typeof self !== "undefined" ? self : this, function (P) {
  "use strict";

  var RE_FECHA = /^\d{4}-\d{2}-\d{2}$/;

  function parse(s) {
    if (typeof s !== "string" || !RE_FECHA.test(s)) return null;
    var d = new Date(s + "T00:00:00Z");
    return isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== s ? null : d;
  }
  function fmt(d) { return d.toISOString().slice(0, 10); }
  function addDays(s, n) { var d = parse(s); d.setUTCDate(d.getUTCDate() + n); return fmt(d); }
  function diffDays(a, b) { return Math.round((parse(b) - parse(a)) / 86400000); }

  /* Fecha de hoy en Valencia (Europe/Madrid), formato AAAA-MM-DD */
  function hoy() {
    try {
      var parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
      var o = {}; parts.forEach(function (p) { o[p.type] = p.value; });
      return o.year + "-" + o.month + "-" + o.day;
    } catch (e) { return fmt(new Date()); }
  }

  /* Tabla de precios descomprimida por casa */
  var cache = {};
  function tabla(casa) {
    var k = String(casa);
    if (cache[k]) return cache[k];
    var s = P.base[k]; if (!s) return null;
    var out = [];
    s.split(",").forEach(function (tok) {
      var parts = tok.split("x"), v = parseInt(parts[0], 10), c = parts[1] ? parseInt(parts[1], 10) : 1;
      for (var i = 0; i < c; i++) out.push(v);
    });
    cache[k] = out;
    return out;
  }

  /* Precio de una noche: { base, precio } en euros, o null si no hay tarifa */
  function precioNoche(casa, fecha) {
    var t = tabla(casa); if (!t || !parse(fecha)) return null;
    var i = diffDays(P.inicio, fecha);
    if (i < 0) return null;
    while (i >= t.length) i -= 364;          // más allá de la tabla: misma fecha (y día de la semana) del año anterior
    var base = t[i];
    return { base: base, precio: Math.round(base * (1 - P.descuentoDirecto)) };
  }

  function noches(entrada, salida) {
    var n = diffDays(entrada, salida), out = [];
    for (var i = 0; i < n; i++) out.push(addDays(entrada, i));
    return out;
  }

  function capacidad(casa) { return (P.capacidad && P.capacidad[String(casa)]) || 0; }

  /* Presupuesto de una estancia. Devuelve { ok:true, ... } o { ok:false, error, dato } */
  function presupuesto(q, hoyStr) {
    hoyStr = hoyStr || hoy();
    var casa = parseInt(q && q.casa, 10);
    if (!tabla(casa)) return { ok: false, error: "casa" };
    if (!parse(q.entrada) || !parse(q.salida)) return { ok: false, error: "fecha" };
    var n = diffDays(q.entrada, q.salida);
    if (n <= 0) return { ok: false, error: "orden" };
    if (n < P.estanciaMinima) return { ok: false, error: "min", dato: P.estanciaMinima };
    if (n > P.estanciaMaxima) return { ok: false, error: "max", dato: P.estanciaMaxima };
    if (diffDays(hoyStr, q.entrada) < P.antelacionMinima) return { ok: false, error: "antelacion" };
    if (diffDays(hoyStr, q.entrada) > P.horizonte) return { ok: false, error: "horizonte" };
    var h = parseInt(q.huespedes, 10);
    if (!(h >= 1 && h <= capacidad(casa))) return { ok: false, error: "huespedes", dato: capacidad(casa) };
    var detalle = [], base = 0, total = 0;
    var lista = noches(q.entrada, q.salida);
    for (var i = 0; i < lista.length; i++) {
      var pn = precioNoche(casa, lista[i]);
      if (!pn) return { ok: false, error: "fecha" };
      detalle.push({ fecha: lista[i], base: pn.base, precio: pn.precio });
      base += pn.base; total += pn.precio;
    }
    var limpieza = P.limpieza || 0;
    total += limpieza;
    return {
      ok: true, casa: casa, entrada: q.entrada, salida: q.salida, huespedes: h, noches: n,
      detalle: detalle, tarifaBase: base, descuento: base - (total - limpieza), limpieza: limpieza,
      total: total, totalCentimos: Math.round(total * 100), moneda: P.moneda
    };
  }

  /* Primera noche ocupada dentro de la estancia (o null si está libre) */
  function conflicto(entrada, salida, bloqueadas) {
    var set = bloqueadas instanceof Set ? bloqueadas : new Set(bloqueadas || []);
    var lista = noches(entrada, salida);
    for (var i = 0; i < lista.length; i++) if (set.has(lista[i])) return lista[i];
    return null;
  }

  /* Precio mínimo por noche en los próximos N días (para "desde X €") */
  function desde(casa, dias, hoyStr) {
    hoyStr = hoyStr || hoy();
    var min = Infinity;
    for (var i = P.antelacionMinima; i < (dias || 60); i++) {
      var pn = precioNoche(casa, addDays(hoyStr, i));
      if (pn && pn.precio < min) min = pn.precio;
    }
    return min === Infinity ? null : min;
  }

  return {
    precios: P, parse: parse, fmt: fmt, addDays: addDays, diffDays: diffDays, hoy: hoy,
    precioNoche: precioNoche, noches: noches, capacidad: capacidad,
    presupuesto: presupuesto, conflicto: conflicto, desde: desde
  };
});
