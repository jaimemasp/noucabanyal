# Nou Cabanyal — notas del proyecto

Web de reservas directas de **Aparthotel Cabanyal**: ocho apartamentos en
Carrer de Vicent Brull 73, El Cabanyal (València). HTML, CSS y JavaScript sin
framework, funciones serverless en Netlify, cobros con Stripe y calendario
sincronizado con Lodgify, que a su vez alimenta Booking.com y Airbnb.

- Producción: https://noucabanyal.es (Netlify, rama `main`)
- Repositorio: `jaimemasp/noucabanyal`, con el código dentro de la carpeta
  `Nou Cabanyal/`
- Carpeta de trabajo en el Mac: `~/Desktop/Nou Cabanyal`

---

## Cómo se publica

No hay repositorio git en el Mac. Los cambios se suben por la web de GitHub,
carpeta por carpeta, y después hay que forzar el despliegue:

1. Subir los archivos a `github.com/jaimemasp/noucabanyal/upload/main/Nou%20Cabanyal/<carpeta>`.
2. Verificar siempre el commit en `/commits/main`. GitHub a veces falla en
   silencio con "You can't perform that action at this time" y el commit no
   llega aunque el botón parezca haber respondido.
3. **Cada push produce un deploy "Canceled" en Netlify.** Es el
   comportamiento normal de este proyecto, no un error. Hay que entrar en el
   deploy y usar Retry ▾ → **"Retry without cache with latest branch commit"**.
4. Comprobar el resultado en la web en vivo, no solo en el panel.

---

## Estructura

| Archivo | Para qué |
|---|---|
| `assets/js/data.js` | Configuración: contacto, empresa, apartamentos, fotos |
| `assets/js/precios.js` | Tarifas y política de cancelación |
| `assets/js/main.js` | Toda la lógica de la web y los textos en español e inglés |
| `assets/css/styles.css` | Estilos |
| `netlify/functions/` | Disponibilidad, precios, reserva y webhook de Stripe |
| `netlify/lib/` | Clientes de Lodgify y Stripe, y la lógica compartida |

### Fotos

`NC_CONFIG.photoSource` vale `"local"`. Cada apartamento lee sus fotos de
`assets/img/casas/casa-N/01.jpg`, `02.jpg`… y el número de fotos y sus pies
salen del array `local` de cada casa en `data.js` (`d` dormitorio, `s` salón,
`k` cocina, `b` baño, `x` otros). Si se añaden o quitan fotos hay que tocar ese
array; el array `photos` que queda es el de Booking y Airbnb y solo se usa si
se vuelve a `photoSource: "remote"`.

Solo hay reportaje de las habitaciones 3, 5 y 7. Los apartamentos 1 a 6 son
iguales entre sí y el 7 y el 8 también, así que las fotos se reparten
simulando reportajes distintos: **las ocho portadas tienen que ser diferentes**
y no se mezclan en una misma galería las fotos de la habitación 3 (colcha
oscura, sillas azuladas) con las de la 5 (blanca, sillas verdes).

Las fotos del barrio van en `assets/img/zona/` y las zonas comunes en
`assets/img/comunes/`. Las imágenes se guardan a 1400 px y calidad 80.

---

## Integraciones

### Lodgify
- Cancelar una reserva: `DELETE /v1/reservation/booking/{id}`. La ruta
  equivalente de v2 devuelve 405.
- **Nunca usar `GET /v2/reservations/bookings?propertyId=X`.** La cuenta es de
  una agencia con unas 40 propiedades y ese endpoint devuelve datos personales
  de clientes de otros alojamientos.
- El usuario de Lodgify no tiene permisos sobre tarifas ni canales. Cualquier
  cambio de precios o de políticas lo tiene que hacer la agencia.

### Stripe
- Claves de producción. El webhook escucha `checkout.session.completed` y
  `charge.refunded`.
- Un reembolso **total** de un pago hecho desde la web cancela sola la reserva
  en Lodgify, lo que libera esas noches en Booking y Airbnb. Un reembolso
  parcial no cancela nada.
- Los metadatos del pago llevan `origen`, la casa, las fechas,
  `lodgify_booking_id` y `lodgify_cancelada`.

### Correo
- `info@noucabanyal.es` está en IONOS y se reenvía a `jaimemasp@gmail.com`.
- Los MX tienen que ser **`mx00.ionos.es` y `mx01.ionos.es`**, nunca los `.com`:
  son dos infraestructuras distintas y la cuenta es española. Con los `.com`
  todo el correo rebota con un 550 que parece un buzón inexistente.
- Para probar que el reenvío funciona hay que escribir **desde una dirección
  que no sea ese mismo Gmail**: Gmail colapsa la copia reenviada con la de
  Enviados y parece que no ha llegado.

### Variables de entorno (en Netlify)
`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `LODGIFY_API_KEY`,
`ICAL_EXPORT_TOKEN`, `SITE_URL`. Sus valores no se escriben nunca aquí ni en
el chat: los introduce Jaime directamente en el panel.

---

## Reglas de negocio

- Los precios de la web tienen que ser **idénticos** a los de Booking y Airbnb.
  Si no, pueden cerrarle esas cuentas.
- Tarifa única con política "Moderada": cancelación gratuita hasta **5 días**
  antes de la llegada; dentro de esos 5 días el reembolso es del 0 %. Se
  descartó la tarifa no reembolsable con descuento.
- Estancia máxima 365 noches, igual que el límite de Lodgify.
- La política de cancelación se ve antes de la pasarela de pago y en la
  confirmación.

---

## Pendiente

### Bloquea el lanzamiento

1. **Probar una reserva real de punta a punta.** En Stripe no ha pasado nunca
   ningún pago. Hay que reservar una noche pagando con tarjeta y comprobar, en
   este orden: el cobro en Stripe, la reserva creada en Lodgify, las noches
   bloqueadas en Booking y Airbnb, y los correos al huésped. Después
   reembolsarla entera y verificar que la reserva se cancela sola.

2. **Datos fiscales de Stripe.** La cuenta está registrada como *Individuo*,
   con "Nou Cabanyal SL" como nombre comercial y sin NIF. La entidad real es
   **Vicente Brull 73 Cabanyal CB**. Hay que cambiar el tipo a *Empresa* y
   poner el nombre tal cual figura en Hacienda y el NIF de la CB. Al guardar
   arranca un periodo de gracia de 7 días para aportar la escritura de
   constitución y los datos de los comuneros; pasado ese plazo sin completarlo,
   Stripe bloquea los cobros. Si el formulario no encaja con una comunidad de
   bienes, escribir a soporte de Stripe en vez de insistir.

3. **Confirmar que el reenvío del correo llega**, con una prueba desde una
   dirección que no sea el Gmail personal.

### Después del lanzamiento

4. Verificar el teléfono por SMS en Stripe. Solo hace falta para cobrar a mano
   desde el panel.
5. Revisar dos datos de `data.js` que pueden estar mal: el apartamento 4
   figura con `outdoor: "patio"` y el 3 con `guests: 2`, mientras que el resto
   del 1 al 6 son iguales y para 4 personas. No hay ninguna foto de ese patio.
6. Fotografiar al menos un apartamento más del grupo 1-6. Con un tercer
   reportaje dejarían de repartirse entre solo dos.
7. Las fotos de `Barrio/Exportadas` son de Wikimedia y llevan licencias que
   obligan a citar autor. No usarlas: las diez propias del barrio son mejores
   y no tienen esa servidumbre.

---

## Cómo trabajar aquí

- Explicar las cosas en castellano llano. Jaime no es programador.
- Avisar siempre de lo que pueda costarle dinero, bloquearle los cobros o
  tumbarle las cuentas de Booking y Airbnb, aunque no lo haya preguntado.
- No teclear nunca claves, contraseñas, IBAN ni números de identificación
  fiscal: esos los introduce él.
- Antes de dar algo por hecho, comprobarlo en la web en vivo o en el panel que
  corresponda.
