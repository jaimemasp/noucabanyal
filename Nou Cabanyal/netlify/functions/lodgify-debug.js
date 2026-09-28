/* Endpoint de diagnóstico retirado.
   Durante la puesta en marcha existió aquí una herramienta que podía crear y cancelar reservas
   reales en Lodgify. Se ha desactivado: no debe haber nada en producción capaz de tocar reservas
   fuera del flujo normal de pago. El archivo se queda como lápida para dejar constancia. */
"use strict";
exports.handler = async () => ({
  statusCode: 410,
  headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  body: JSON.stringify({ error: "retirado" }),
});
