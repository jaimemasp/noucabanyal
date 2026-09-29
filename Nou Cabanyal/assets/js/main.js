/* Aparthotel Cabanyal — lógica de la web (idiomas, apartamentos, página de cada casa, galería) */
(function () {
  "use strict";

  var CFG = window.NC_CONFIG || {};
  var CASAS = window.NC_CASAS || [];
  var SERVICIOS = window.NC_SERVICIOS || [];
  var LUGARES = window.NC_LUGARES || [];
  var HISTORIA = window.NC_HISTORIA || null;
  var IS_CASA = document.body.classList.contains("page-casa");
  var IS_OK = document.body.classList.contains("page-ok");
  var IS_COND = document.body.classList.contains("page-cond");
  var RS = window.NC_RESERVAS || null;
  var API = CFG.api || "/api";
  var ONLINE = /^https?:$/.test(location.protocol);
  function cancelDias() { return RS ? RS.precios.cancelacionGratisDias : 5; }
  function limiteCancelacion(entrada) { return RS && entrada ? RS.addDays(entrada, -cancelDias()) : null; }
  function cancelable(entrada) { var l = limiteCancelacion(entrada); return !!l && l > RS.hoy(); }

  /* ------------------------------------------------------------------
     TEXTOS (ES / EN)
  ------------------------------------------------------------------ */
  var T = {
    es: {
      "meta.title": "Aparthotel Cabanyal · Apartamentos a 500 m de la playa en Valencia",
      "meta.desc": "Ocho apartamentos nuevos en el barrio del Cabanyal, a 500 m de la playa de Las Arenas (Valencia). Check-in autónomo, aire acondicionado y wifi. Reserva directa en nuestra web, sin intermediarios.",
      "skip": "Saltar al contenido",
      "nav.apts": "Apartamentos", "nav.amen": "Qué incluye", "nav.area": "El barrio", "nav.beach": "La playa", "nav.loc": "Ubicación", "nav.book": "Reservar", "nav.home": "Volver al inicio",
      "hero.alt": "Palmeras en el paseo marítimo, junto a la playa",
      "hero.alt2": "Barcas de pescadores en la playa, al atardecer",
      "hero.alt3": "Azulejos de una fachada modernista del Cabanyal",
      "hero.kicker": "València · El Cabanyal",
      "hero.title": "Tu aparthotel junto al mar, en el barrio más auténtico de Valencia",
      "hero.sub": "Ocho apartamentos nuevos a 500 metros de la playa de Las Arenas. Descúbrelos y elige el que más te guste.",
      "hero.cta1": "Ver apartamentos", "hero.cta2": "Reserva directa",
      "badge.rating": "{r}/5 · {n} opiniones de huéspedes", "badge.self": "Check-in autónomo",
      "facts.beach": "hasta la playa", "facts.apts": "apartamentos", "facts.new": "obra nueva", "facts.metro": "al metro Marítim-Serrería",
      "apts.kicker": "Los apartamentos", "apts.title": "Elige tu casa",
      "apts.lead": "Todas las unidades en el mismo edificio en el corazón del Cabanyal y reformadas en 2026. Dormitorios con cama doble, sofá cama, baño y cocina equipada. Todo lo necesario para sentirte como en casa, a 500m de la playa.",
      "f.all": "Todos", "f.outdoor": "Terraza o balcón", "f.four": "Hasta 4 personas",
      "card.house": "Casa {n}", "card.guests": "Hasta {n} personas", "card.bed": "Cama doble + sofá cama",
      "card.photos": "{n} fotos", "card.view": "Ver casa", "card.book": "Reservar", "card.from": "Desde <b>{p} €</b> / noche",
      "out.terrace": "Terraza", "out.patio": "Patio o balcón",
      "key.work": "Zona para trabajar", "key.ac": "Aire acondicionado", "key.wifi": "WiFi gratis",
      "cap.d": "Dormitorio", "cap.s": "Salón", "cap.k": "Cocina", "cap.b": "Baño", "cap.x": "Detalles",
      "amen.kicker": "Qué incluye", "amen.title": "Todo lo necesario, nada que te sobre",
      "amen.note": "Cocina tipo office, sin fuegos, y con un supermercado a 100 metros con comida preparada. En la página de cada casa encuentras la lista completa de servicios.",
      "area.kicker": "El barrio", "area.title": "El Cabanyal, el antiguo barrio de pescadores",
      "area.p1": "Calles estrechas paralelas al mar, fachadas cubiertas de azulejos de colores, murales y plazas con palmeras: el Cabanyal conserva su vida de barrio de siempre y, a la vez, es una de las zonas con más ambiente de Valencia.",
      "area.p2": "A un paseo tienes el Mercat del Cabanyal para la compra del día, bodegas centenarias como Casa Montaña —abierta desde 1836—, la plaza del Rosari con el Teatre El Musical, y un sinfín de bares y terrazas donde comer bien sin necesidad de coche.",
      "area.gallery": "El Cabanyal",
      "beach.kicker": "La playa", "beach.title": "Del apartamento a la arena en un paseo",
      "beach.p1": "La playa de Las Arenas está a unos 500 metros: baja con la toalla por la mañana y vuelve a comer a casa. Arena fina, entrada suave al agua y un paseo marítimo lleno de palmeras que enlaza con la Malvarrosa.",
      "beach.p2": "Por la tarde, el paseo es perfecto para correr, ir en bici o sentarte a ver cómo cae la tarde con un arroz frente al mar.",
      "beach.alt1": "La playa, con el puerto al fondo", "beach.alt2": "Palmeras en el paseo marítimo", "beach.gallery": "La playa",
      "loc.kicker": "Ubicación", "loc.title": "Cerca del mar y bien conectado", "loc.open": "Abrir en Google Maps",
      "direct.kicker": "Reserva directa", "direct.title": "Reserva aquí y paga menos",
      "direct.lead": "Sin intermediarios: eliges tu casa y tus fechas, pagas de forma segura y hablas directamente con nosotros.",
      "direct.b1.t": "Trato directo", "direct.b1.p": "Sin comisiones de intermediarios: hablas y reservas directamente con nosotros.",
      "direct.b2.t": "Pago seguro", "direct.b2.p": "Con tarjeta a través de Stripe. Recibes la confirmación al momento por email.",
      "direct.b3.t": "Cancelación gratuita", "direct.b3.p": "Hasta {d} días antes de tu llegada, con reembolso completo.",
      "direct.cta": "Elige tu casa y tus fechas",
      "book.direct.t": "¿Tienes dudas?", "book.direct.p": "Escríbenos y te ayudamos a elegir el apartamento y las fechas.",
      "book.wa": "WhatsApp", "book.mail": "Email", "book.call": "Llamar", "book.ig": "Instagram",
      "lb.close": "Cerrar", "lb.prev": "Anterior", "lb.next": "Siguiente", "lb.of": "{i} de {n}",
      /* Página de cada casa */
      "casa.meta.title": "Casa {n} · Aparthotel Cabanyal · Apartamento en el Cabanyal, Valencia",
      "casa.back": "Todos los apartamentos",
      "casa.sub": "Apartamento de 1 dormitorio · Carrer de Vicent Brull, 73 · a 500 m de la playa",
      "casa.all": "Ver las {n} fotos",
      "casa.about": "Sobre el apartamento",
      "casa.desc1": "Apartamento de un dormitorio con aire acondicionado, estrenado en marzo de 2026. Tiene dormitorio independiente con cama doble, salón con sofá cama, zona de cocina equipada y baño privado{out}.",
      "casa.desc.terrace": ", además de terraza", "casa.desc.patio": ", además de patio privado o balcón",
      "casa.desc2": "El check-in es autónomo, con cerradura inteligente. La playa de Las Arenas queda a unos 500 metros y el metro Marítim-Serrería a 550 m, así que te mueves por toda Valencia sin coche.",
      "casa.guest": "Información para el huésped",
      "g.in": "Entrada", "g.out": "Salida", "g.cap": "Capacidad", "g.beds": "Camas", "g.kids": "Niños", "g.rules": "Normas", "g.park": "Aparcamiento", "g.lang": "Idiomas",
      "g.in.range": "De {t} h", "g.in.from": "a partir de las {t}", "g.in.note": "Avisa con antelación de tu hora de llegada.",
      "g.out.range": "De {t} h", "g.out.before": "antes de las {t}",
      "g.cap.v": "Hasta {n} personas", "g.beds.v": "1 cama doble + 1 sofá cama",
      "g.kids.v": "Bienvenidos, de cualquier edad. Cuna bajo petición.",
      "g.rules.v": "No se puede fumar. No se permiten fiestas ni eventos.",
      "g.park.v": "El alojamiento no tiene parking.",
      "g.lang.v": "Español e inglés",
      "acc.amen.t": "Todos los servicios", "acc.amen.s": "{n} servicios incluidos",
      "acc.amen.note": "Si necesitas algo que no aparezca en la lista, pregúntanos.",
      "acc.area.t": "Qué ver y dónde comer en el Cabanyal", "acc.area.s": "Nuestros sitios favoritos del barrio",
      "acc.area.eat": "Comer y beber", "acc.area.see": "Ver y hacer", "acc.area.map": "Cómo llegar",
      "acc.area.note": "Horarios y reservas: consulta directamente con cada sitio antes de ir.",
      "acc.hist.t": "Historia del Cabanyal", "acc.hist.s": "Del poblado de barracas al barrio de hoy",
      /* Reserva y pago */
      "bw.from": "desde", "bw.night": "/ noche",
      "bw.in": "Entrada", "bw.out": "Salida", "bw.pick": "Elige fecha", "bw.guests": "Huéspedes", "bw.guest1": "1 huésped", "bw.guestN": "{n} huéspedes",
      "bw.busy": "Ocupado", "bw.prev": "Mes anterior", "bw.next": "Mes siguiente",
      "bw.hint.in": "Elige el día de entrada en el calendario.", "bw.hint.out": "Ahora elige el día de salida.",
      "bw.min": "La estancia mínima es de {n} noches.", "bw.max": "La estancia máxima es de {n} noches.", "bw.gap": "Hay noches ocupadas entre esas fechas. Elige otra entrada.",
      "bw.nights": "{n} noches", "bw.clean": "Limpieza", "bw.total": "Total",
      "bw.cta": "Reservar", "bw.secure": "Pago seguro con tarjeta a través de Stripe", "bw.cancel": "Cancelación gratuita hasta {d} días antes de la llegada",
      "bw.clear": "Borrar fechas",
      "bw.preview": "Vista previa: la disponibilidad real y el pago se activan cuando la web está publicada.",
      "bw.loading": "Comprobando disponibilidad…", "bw.cancelled": "Has salido del pago: tu reserva no se ha completado y no se te ha cobrado nada.",
      "fm.title": "Tus datos", "fm.name": "Nombre y apellidos", "fm.email": "Email", "fm.phone": "Teléfono", "fm.country": "País",
      "fm.arrival": "Hora estimada de llegada", "fm.msg": "Mensaje (opcional)", "fm.accept": "He leído y acepto las <a href=\"condiciones.html\" target=\"_blank\">condiciones de reserva y la política de privacidad</a>.",
      "fm.pay": "Pagar {t} € con tarjeta", "fm.back": "Volver", "fm.sending": "Preparando el pago seguro…",
      "fm.note": "Te llevaremos a la página de pago segura de Stripe. No guardamos los datos de tu tarjeta.",
      "fm.cancel.si": "Cancelación gratuita hasta el {f}: te devolvemos el 100 %. A partir de esa fecha la reserva no es reembolsable.",
      "fm.cancel.no": "Esta reserva no es reembolsable: quedan menos de {d} días para tu llegada.",
      "err.nombre": "Escribe tu nombre y apellidos.", "err.email": "Revisa el email.", "err.telefono": "Revisa el teléfono.", "err.condiciones": "Tienes que aceptar las condiciones.",
      "err.ocupado": "Lo sentimos: esas fechas se acaban de ocupar. Elige otras, por favor.", "err.sin_comprobar": "Ahora mismo no podemos comprobar la disponibilidad. Inténtalo de nuevo en unos minutos.",
      "err.pagos_no_configurados": "Los pagos online todavía no están activados. Escríbenos para reservar.", "err.min": "La estancia mínima es de {n} noches.",
      "err.huespedes": "Esta casa admite como máximo {n} personas.", "err.antelacion": "No se puede reservar para hoy.", "err.generic": "No se ha podido iniciar el pago. Inténtalo de nuevo.",
      "err.preview": "Vista previa: aquí se abriría la página de pago segura de Stripe. El pago funcionará cuando la web esté publicada.",
      "err.max": "La estancia máxima es de {n} noches.", "err.fecha": "Revisa las fechas.", "err.orden": "La salida tiene que ser posterior a la entrada.",
      "err.horizonte": "Todavía no se puede reservar con tanta antelación.", "err.casa": "Apartamento no válido.",
      "err.stripe": "No hemos podido conectar con la pasarela de pago. Inténtalo de nuevo en unos minutos.",
      "err.precio_no_disponible": "Ahora mismo no podemos confirmar el precio. Inténtalo de nuevo en unos minutos.",
      "err.precio_cambiado": "El precio de esas fechas acaba de cambiar. Vuelve a cargar la página para ver el precio actualizado.",
      "foot.terms": "Condiciones y privacidad",
      /* Confirmación */
      "ok.meta": "Reserva confirmada · Aparthotel Cabanyal", "ok.title": "¡Reserva confirmada!", "ok.lead": "Gracias, {n}. Hemos recibido tu pago y tu casa te está esperando.",
      "ok.pending": "Estamos confirmando tu pago", "ok.pending.p": "Si has completado el pago, recibirás un email de confirmación en unos minutos.",
      "ok.err": "No encontramos esta reserva", "ok.err.p": "Si has pagado y tienes dudas, escríbenos y lo revisamos.",
      "ok.casa": "Apartamento", "ok.dates": "Fechas", "ok.guests": "Huéspedes", "ok.total": "Total pagado", "ok.email": "Confirmación enviada a",
      "ok.next": "Próximos pasos", "ok.n1": "Recibirás el recibo del pago por email.", "ok.n2": "Antes de tu llegada te pediremos los datos de los viajeros (registro obligatorio por ley) y te enviaremos las instrucciones del check-in autónomo.",
      "ok.n3": "Entrada: {in}. Salida: {out}.", "ok.home": "Volver a la web",
      "ok.cancel": "Cancelación", "ok.cancel.si": "Gratuita hasta el {f}", "ok.cancel.no": "No reembolsable",
      "casa.others": "Otros apartamentos",
      "casa.fact.guests": "Hasta {n} personas", "spec.bath": "Baño privado", "casa.fact.m2": "{n} m²", "casa.fact.in": "Entrada {t} h"
    },
    en: {
      "meta.title": "Aparthotel Cabanyal · Apartments 500 m from the beach in Valencia",
      "meta.desc": "Eight brand-new apartments in El Cabanyal, 500 m from Las Arenas beach in Valencia. Self check-in, air conditioning and WiFi. Book direct on our website, with no middlemen.",
      "skip": "Skip to content",
      "nav.apts": "Apartments", "nav.amen": "Amenities", "nav.area": "The area", "nav.beach": "The beach", "nav.loc": "Location", "nav.book": "Book", "nav.home": "Back to home",
      "hero.alt": "Palm trees on the seafront promenade, next to the beach",
      "hero.alt2": "Fishing boats on the beach at sunset",
      "hero.alt3": "Tiles on a modernist facade in El Cabanyal",
      "hero.kicker": "Valencia · El Cabanyal",
      "hero.title": "Your aparthotel by the sea, in Valencia’s most authentic neighbourhood",
      "hero.sub": "Eight brand-new apartments 500 metres from Las Arenas beach. Take a look and find the one that's right for you.",
      "hero.cta1": "See the apartments", "hero.cta2": "Book direct",
      "badge.rating": "{r}/5 · {n} guest reviews", "badge.self": "Self check-in",
      "facts.beach": "to the beach", "facts.apts": "apartments", "facts.new": "brand new", "facts.metro": "to Marítim-Serrería metro",
      "apts.kicker": "The apartments", "apts.title": "Choose your home",
      "apts.lead": "They are all in the same building and opened in 2026: a bedroom with a double bed, a sofa bed in the living room, a bathroom and an equipped kitchenette. Open each apartment to see all its photos and details.",
      "f.all": "All", "f.outdoor": "Terrace or balcony", "f.four": "Up to 4 guests",
      "card.house": "Casa {n}", "card.guests": "Up to {n} guests", "card.bed": "Double bed + sofa bed",
      "card.photos": "{n} photos", "card.view": "View apartment", "card.book": "Book", "card.from": "From <b>€{p}</b> / night",
      "out.terrace": "Terrace", "out.patio": "Patio or balcony",
      "key.work": "Workspace", "key.ac": "Air conditioning", "key.wifi": "Free WiFi",
      "cap.d": "Bedroom", "cap.s": "Living area", "cap.k": "Kitchenette", "cap.b": "Bathroom", "cap.x": "Details",
      "amen.kicker": "Amenities", "amen.title": "Everything you need, nothing you don’t",
      "amen.note": "The kitchenette has no hob, and there is a supermarket right next door with ready-made meals. Each apartment’s page has the full list of amenities.",
      "area.kicker": "The area", "area.title": "El Cabanyal, Valencia’s old fishermen’s quarter",
      "area.p1": "Narrow streets running parallel to the sea, façades covered in colourful tiles, murals and squares lined with palm trees. El Cabanyal keeps its traditional neighbourhood life while being one of the liveliest areas in Valencia.",
      "area.p2": "Within a few minutes’ walk you’ll find the Cabanyal Market, historic taverns such as Casa Montaña (open since 1836), Plaça del Rosari with the Teatre El Musical, and plenty of bars and terraces to eat well without taking the car.",
      "area.gallery": "El Cabanyal",
      "beach.kicker": "The beach", "beach.title": "From your door to the sand in a short stroll",
      "beach.p1": "Las Arenas beach is about 500 metres away: head down with your towel in the morning and come back home for lunch. Fine sand and a palm-lined promenade that runs on to La Malvarrosa.",
      "beach.p2": "In the evening the promenade is perfect for a run, a bike ride or watching the sunset over a paella by the sea.",
      "beach.alt1": "The beach, with the port in the background", "beach.alt2": "Palm trees on the seafront promenade", "beach.gallery": "The beach",
      "loc.kicker": "Location", "loc.title": "Close to the sea and well connected", "loc.open": "Open in Google Maps",
      "direct.kicker": "Book direct", "direct.title": "Book here and pay less",
      "direct.lead": "No middlemen: choose your apartment and dates, pay securely and deal with us directly.",
      "direct.b1.t": "Direct and simple", "direct.b1.p": "No middleman fees: you deal and book directly with us.",
      "direct.b2.t": "Secure payment", "direct.b2.p": "By card through Stripe. You get your confirmation by email straight away.",
      "direct.b3.t": "Free cancellation", "direct.b3.p": "Up to {d} days before arrival, with a full refund.",
      "direct.cta": "Choose your apartment and dates",
      "book.direct.t": "Any questions?", "book.direct.p": "Message us and we’ll help you choose the apartment and dates.",
      "book.wa": "WhatsApp", "book.mail": "Email", "book.call": "Call", "book.ig": "Instagram",
      "lb.close": "Close", "lb.prev": "Previous", "lb.next": "Next", "lb.of": "{i} of {n}",
      "casa.meta.title": "Casa {n} · Aparthotel Cabanyal · Apartment in El Cabanyal, Valencia",
      "casa.back": "All apartments",
      "casa.sub": "One-bedroom apartment · Carrer de Vicent Brull, 73 · 500 m from the beach",
      "casa.all": "See all {n} photos",
      "casa.about": "About the apartment",
      "casa.desc1": "Air-conditioned one-bedroom apartment, opened in March 2026. It has a separate bedroom with a double bed, a living room with a sofa bed, an equipped kitchenette and a private bathroom{out}.",
      "casa.desc.terrace": ", plus a terrace", "casa.desc.patio": ", plus a private patio or balcony",
      "casa.desc2": "Check-in is self-service with a smart lock. Las Arenas beach is about 500 metres away and Marítim-Serrería metro station 550 m, so you can get around Valencia without a car.",
      "casa.guest": "Guest information",
      "g.in": "Check-in", "g.out": "Check-out", "g.cap": "Guests", "g.beds": "Beds", "g.kids": "Children", "g.rules": "House rules", "g.park": "Parking", "g.lang": "Languages",
      "g.in.range": "{t}", "g.in.from": "from {t}", "g.in.note": "Please let us know your arrival time in advance.",
      "g.out.range": "{t}", "g.out.before": "before {t}",
      "g.cap.v": "Up to {n} guests", "g.beds.v": "1 double bed + 1 sofa bed",
      "g.kids.v": "Children of all ages welcome. Cot on request.",
      "g.rules.v": "No smoking. No parties or events.",
      "g.park.v": "No parking at the property.",
      "g.lang.v": "Spanish and English",
      "acc.amen.t": "All amenities", "acc.amen.s": "{n} amenities included",
      "acc.amen.note": "If you need anything that is not on the list, just ask us.",
      "acc.area.t": "What to see and where to eat in El Cabanyal", "acc.area.s": "Our favourite places in the neighbourhood",
      "acc.area.eat": "Eat & drink", "acc.area.see": "See & do", "acc.area.map": "Directions",
      "acc.area.note": "Opening hours and bookings: please check with each place before you go.",
      "acc.hist.t": "History of El Cabanyal", "acc.hist.s": "From fishermen’s huts to today’s neighbourhood",
      "bw.from": "from", "bw.night": "/ night",
      "bw.in": "Check-in", "bw.out": "Check-out", "bw.pick": "Choose date", "bw.guests": "Guests", "bw.guest1": "1 guest", "bw.guestN": "{n} guests",
      "bw.busy": "Booked", "bw.prev": "Previous month", "bw.next": "Next month",
      "bw.hint.in": "Choose your check-in day on the calendar.", "bw.hint.out": "Now choose your check-out day.",
      "bw.min": "Minimum stay is {n} nights.", "bw.max": "Maximum stay is {n} nights.", "bw.gap": "Some nights in between are booked. Choose another check-in date.",
      "bw.nights": "{n} nights", "bw.clean": "Cleaning", "bw.total": "Total",
      "bw.cta": "Book now", "bw.secure": "Secure card payment through Stripe", "bw.cancel": "Free cancellation up to {d} days before arrival",
      "bw.clear": "Clear dates",
      "bw.preview": "Preview: live availability and payment are enabled once the website is published.",
      "bw.loading": "Checking availability…", "bw.cancelled": "You left the payment page: your booking was not completed and you have not been charged.",
      "fm.title": "Your details", "fm.name": "Full name", "fm.email": "Email", "fm.phone": "Phone", "fm.country": "Country",
      "fm.arrival": "Estimated arrival time", "fm.msg": "Message (optional)", "fm.accept": "I have read and accept the <a href=\"condiciones.html\" target=\"_blank\">booking terms and privacy policy</a>.",
      "fm.pay": "Pay €{t} by card", "fm.back": "Back", "fm.sending": "Preparing secure payment…",
      "fm.note": "You will be taken to Stripe’s secure payment page. We never store your card details.",
      "fm.cancel.si": "Free cancellation until {f}: we refund 100 %. After that date the booking is non-refundable.",
      "fm.cancel.no": "This booking is non-refundable: your arrival is less than {d} days away.",
      "err.nombre": "Please enter your full name.", "err.email": "Please check your email.", "err.telefono": "Please check your phone number.", "err.condiciones": "You need to accept the terms.",
      "err.ocupado": "Sorry, those dates have just been booked. Please choose others.", "err.sin_comprobar": "We can’t check availability right now. Please try again in a few minutes.",
      "err.pagos_no_configurados": "Online payment is not enabled yet. Please contact us to book.", "err.min": "Minimum stay is {n} nights.",
      "err.huespedes": "This apartment sleeps up to {n} people.", "err.antelacion": "Same-day bookings are not available.", "err.generic": "We couldn’t start the payment. Please try again.",
      "err.preview": "Preview: Stripe’s secure payment page would open here. Payment will work once the website is published.",
      "err.max": "Maximum stay is {n} nights.", "err.fecha": "Please check the dates.", "err.orden": "Check-out must be after check-in.",
      "err.horizonte": "Bookings are not open that far ahead yet.", "err.casa": "Invalid apartment.",
      "err.stripe": "We couldn’t connect to the payment gateway. Please try again in a few minutes.",
      "err.precio_no_disponible": "We can’t confirm the price right now. Please try again in a few minutes.",
      "err.precio_cambiado": "The price for those dates has just changed. Please reload the page to see the updated price.",
      "foot.terms": "Terms & privacy",
      "ok.meta": "Booking confirmed · Aparthotel Cabanyal", "ok.title": "Booking confirmed!", "ok.lead": "Thank you, {n}. We’ve received your payment and your apartment is waiting for you.",
      "ok.pending": "We’re confirming your payment", "ok.pending.p": "If you completed the payment, you’ll receive a confirmation email within a few minutes.",
      "ok.err": "We can’t find this booking", "ok.err.p": "If you have paid and have any questions, please contact us.",
      "ok.casa": "Apartment", "ok.dates": "Dates", "ok.guests": "Guests", "ok.total": "Total paid", "ok.email": "Confirmation sent to",
      "ok.next": "Next steps", "ok.n1": "You’ll receive your payment receipt by email.", "ok.n2": "Before you arrive we’ll ask for your travellers’ details (a legal requirement in Spain) and send you the self check-in instructions.",
      "ok.n3": "Check-in: {in}. Check-out: {out}.", "ok.home": "Back to the website",
      "ok.cancel": "Cancellation", "ok.cancel.si": "Free until {f}", "ok.cancel.no": "Non-refundable",
      "casa.others": "Other apartments",
      "casa.fact.guests": "Up to {n} guests", "spec.bath": "Private bathroom", "casa.fact.m2": "{n} m²", "casa.fact.in": "Check-in {t}"
    }
  };

  var AMENITIES = [
    { i: "wifi", es: ["WiFi gratis", "En todo el apartamento"], en: ["Free WiFi", "Throughout the apartment"] },
    { i: "ac", es: ["Aire acondicionado", "Y calefacción para el invierno"], en: ["Air conditioning", "Plus heating for winter"] },
    { i: "key", es: ["Check-in autónomo", "Cerradura inteligente, sin esperas"], en: ["Self check-in", "Smart lock, no waiting"] },
    { i: "coffee", es: ["Cocina tipo office", "Nevera, microondas, Nespresso, hervidor, tostadora y sandwichera"], en: ["Kitchenette", "Fridge, microwave, Nespresso, kettle, toaster and sandwich maker"] },
    { i: "plate", es: ["Menaje completo", "Platos, cubiertos y utensilios básicos"], en: ["Fully equipped", "Plates, cutlery and cooking basics"] },
    { i: "tv", es: ["TV de pantalla plana", "En el salón"], en: ["Flat-screen TV", "In the living area"] },
    { i: "desk", es: ["Zona para trabajar", "Con conexión Ethernet"], en: ["Workspace", "With Ethernet connection"] },
    { i: "lift", es: ["Ascensor", "En el edificio"], en: ["Lift", "In the building"] },
    { i: "baby", es: ["Cuna y trona", "Bajo petición"], en: ["Cot and high chair", "On request"] },
    { i: "bath", es: ["Baño equipado", "Secador, champú, acondicionador y gel"], en: ["Equipped bathroom", "Hair dryer, shampoo, conditioner and shower gel"] },
    { i: "broom", es: ["Limpieza extra", "Disponible con coste adicional"], en: ["Extra cleaning", "Available at extra cost"] },
    { i: "cart", es: ["Supermercado al lado", "Con comida lista para llevar"], en: ["Supermarket next door", "With ready-made meals"] }
  ];

  var KEY_AMEN = [["desk", "key.work"], ["ac", "key.ac"], ["wifi", "key.wifi"]];

  var ZONA = [
    { f: "fachadas-206", c: "w2 h2", es: "Casas tradicionales con azulejos", en: "Traditional tiled houses" },
    { f: "calle-rosario", c: "", es: "Calle del Rosario", en: "Calle del Rosario" },
    { f: "mercat-cabanyal", c: "", es: "Mercat del Cabanyal", en: "Cabanyal Market" },
    { f: "mercat-verdures", c: "", es: "Puestos de fruta y verdura", en: "Fruit and vegetable stalls" },
    { f: "placa-rosari", c: "h2", es: "Plaça del Rosari", en: "Plaça del Rosari" },
    { f: "casa-montana", c: "w2", es: "Casa Montaña, desde 1836", en: "Casa Montaña, since 1836" },
    { f: "azulejos", c: "", es: "Azulejos en las fachadas", en: "Tiled façades" },
    { f: "mural", c: "w2", es: "Murales del barrio", en: "Neighbourhood murals" },
    { f: "calle-colores", c: "", es: "Calles de colores", en: "Colourful streets" },
    { f: "teatre-el-musical", c: "w2", es: "Teatre El Musical", en: "Teatre El Musical" },
    { f: "fachadas-azulejos", c: "", es: "Balcones de forja", en: "Wrought-iron balconies" },
    { f: "anyora", c: "", es: "Bodegas de siempre", en: "Old-style bodegas" },
    { f: "calle-peatonal", c: "w2", es: "Calles peatonales", en: "Pedestrian streets" },
    { f: "passeig-palmeres", c: "h2", es: "Passeig marítim, entre palmeras", en: "Seafront promenade, among palm trees" }
  ];

  var DIST = [
    { es: "Playa de Las Arenas", en: "Las Arenas beach", d: "500 m" },
    { es: "Metro Marítim-Serrería", en: "Marítim-Serrería metro", d: "550 m" },
    { es: "Puerto de Valencia", en: "Port of Valencia", d: "800 m" },
    { es: "Oceanogràfic", en: "Oceanogràfic aquarium", d: "3,2 km" },
    { es: "Jardín del Turia", en: "Turia Gardens", d: "4,2 km" },
    { es: "Estación del Norte", en: "Estació del Nord (train)", d: "4,7 km" },
    { es: "Aeropuerto de Valencia", en: "Valencia Airport", d: "12 km" }
  ];

  var ICONS = {
    wifi: '<path d="M2 9a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0"/><circle cx="12" cy="19.5" r="1"/>',
    ac: '<rect x="2" y="4" width="20" height="8" rx="2"/><path d="M6 9h12M7 15c0 2-1 3-1 5M12 15v5M17 15c0 2 1 3 1 5"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l3 3M15 8l2 2"/>',
    coffee: '<path d="M4 8h13v5a6 6 0 0 1-6 6h-1a6 6 0 0 1-6-6z"/><path d="M17 10h1.5a2.5 2.5 0 0 1 0 5H17M8 2v3M12 2v3"/>',
    plate: '<circle cx="12" cy="12" r="6"/><path d="M3 3v6a2 2 0 0 0 2 2M5 3v18M21 3c-2 1-3 3-3 6v3h3M21 12v9"/>',
    tv: '<rect x="2" y="5" width="20" height="13" rx="2"/><path d="M8 22h8M12 18v4"/>',
    desk: '<rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M2 20h20M9 16v4M15 16v4"/>',
    lift: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M12 2v20M7.5 9l1.5-2 1.5 2M13.5 15l1.5 2 1.5-2"/>',
    baby: '<path d="M3 10h18v6a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3zM3 10V6M21 10V6M7 19v2M17 19v2M8 10v9M12 10v9M16 10v9"/>',
    bath: '<path d="M3 12h18v2a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5z"/><path d="M6 12V5a2 2 0 0 1 4 0M7 19l-1 2M17 19l1 2"/>',
    broom: '<path d="M14 3l-4 9M7 12h8l2 9H5z"/><path d="M9 16v5M13 16v5"/>',
    cart: '<circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2 3h3l2.5 12h11.5l2-8H6"/>',
    users: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M16 5.2a3 3 0 0 1 0 5.6M18 14.4c1.8.8 3 2.7 3 5.6"/>',
    area: '<path d="M4 4h16v16H4z"/><path d="M4 9h4M16 20v-4M9 4v3"/>',
    bed: '<path d="M3 18V7M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5"/><circle cx="7" cy="11" r="1.6"/>',
    camera: '<path d="M4 7h3l2-3h6l2 3h3v12H4z"/><circle cx="12" cy="13" r="3.5"/>',
    star: '<path d="M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    shield: '<path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    pin: '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    arrow: '<path d="M7 17L17 7M9 7h8v8"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'
  };
  function icon(name, cls) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"' + (cls ? ' class="' + cls + '"' : "") + ">" + (ICONS[name] || "") + "</svg>";
  }

  /* ------------------------------------------------------------------
     UTILIDADES
  ------------------------------------------------------------------ */
  var lang = "es";
  function t(key, vars) {
    var s = (T[lang] && T[lang][key]);
    if (s === undefined) s = T.es[key];
    if (s === undefined) s = key;
    if (vars) Object.keys(vars).forEach(function (k) { s = s.split("{" + k + "}").join(vars[k]); });
    return s;
  }
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $all(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  /* Carrusel de la foto de portada: alterna entre las fotos .hero-img cada 8 s */
  function heroCarousel() {
    var imgs = $all(".hero-img");
    if (imgs.length < 2) return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var i = 0;
    setInterval(function () {
      imgs[i].classList.remove("is-active");
      i = (i + 1) % imgs.length;
      imgs[i].classList.add("is-active");
    }, 8000);
  }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function setText(sel, txt) { var el = $(sel); if (el) el.textContent = txt; }

  /* Fotos */
  var BK_SIZES = { thumb: "max300", card: "max1024x768", large: "max1280x900" };
  var AB_SIZES = { thumb: 320, card: 720, large: 1440 };
  function photoUrl(casa, i, size) {
    if (CFG.photoSource === "local") return "assets/img/casas/casa-" + casa.n + "/" + pad(i + 1) + ".jpg";
    var p = casa.photos[i];
    if (casa.platform === "booking") {
      return "https://cf.bstatic.com/xdata/images/hotel/" + BK_SIZES[size] + "/" + p[0] + ".jpg?k=" + p[1] + "&o=";
    }
    return "https://a0.muscache.com/im/pictures/hosting/Hosting-" + casa.airbnbRoom + "/original/" + p + ".jpeg?im_w=" + AB_SIZES[size];
  }
  function photoCaption(casa, i) {
    var p = casa.photos[i];
    return casa.platform === "booking" && p[2] ? t("cap." + p[2]) : "";
  }

  function casaUrl(casa) { return "casa.html?n=" + casa.n; }
  function outdoorLabel(casa) { return casa.outdoor === "terrace" ? t("out.terrace") : casa.outdoor === "patio" ? t("out.patio") : ""; }
  function keyChips() {
    return KEY_AMEN.map(function (k) { return '<li class="key-chip">' + icon(k[0]) + esc(t(k[1])) + "</li>"; }).join("");
  }
  function servicesFor(casa) {
    return SERVICIOS.map(function (g) {
      var items = g.items.filter(function (it) { return !it.only || it.only.indexOf(casa.n) !== -1; });
      return { g: g, items: items };
    }).filter(function (x) { return x.items.length; });
  }
  function timeRange(s) {
    var p = String(s).split("–");
    if (p.length < 2) return s;
    return lang === "es" ? "de " + p[0] + " a " + p[1] : p[0] + " – " + p[1];
  }
  function checkinText(c) { return c.platform === "booking" ? timeRange(c.checkin) : t("g.in.from", { t: c.checkin }); }
  function checkoutText(c) { return c.platform === "booking" ? timeRange(c.checkout) : t("g.out.before", { t: c.checkout }); }
  function cap1(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function mapsUrl(q) { return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q); }

  /* ------------------------------------------------------------------
     PORTADA
  ------------------------------------------------------------------ */
  function renderBadges() {
    var el = $("#hero-badges"); if (!el) return;
    var html = "";
    if (CFG.airbnbRating) html += "<li>" + icon("star") + esc(t("badge.rating", { r: CFG.airbnbRating, n: CFG.airbnbReviews })) + "</li>";
    html += "<li>" + esc(t("badge.self")) + "</li>";
    el.innerHTML = html;
  }

  function renderCards() {
    var el = $("#cards"); if (!el) return;
    el.innerHTML = CASAS.map(function (c) {
      var meta = "";
      if (c.m2) meta += "<li>" + icon("area") + c.m2 + " m²</li>";
      meta += "<li>" + icon("users") + esc(t("card.guests", { n: c.guests })) + "</li>";
      meta += "<li>" + icon("bed") + esc(t("card.bed")) + "</li>";
      if (c.outdoor) meta += "<li>" + icon("sun") + esc(outdoorLabel(c)) + "</li>";
      var title = t("card.house", { n: c.n });
      return (
        '<article class="card" data-casa="' + c.n + '" data-outdoor="' + (c.outdoor ? "1" : "") + '" data-guests="' + c.guests + '">' +
          '<a class="card-media" href="' + casaUrl(c) + '" aria-label="' + esc(t("card.view") + " · " + title) + '">' +
            '<img src="' + esc(photoUrl(c, 0, "card")) + '" alt="' + esc(title) + '" loading="lazy" decoding="async">' +
            '<span class="card-count">' + icon("camera") + esc(t("card.photos", { n: c.photos.length })) + "</span>" +
          "</a>" +
          '<div class="card-body">' +
            '<div class="card-title"><h3><a href="' + casaUrl(c) + '">' + esc(title) + "</a></h3>" +
              (RS ? '<p class="card-from">' + t("card.from", { p: RS.desde(c.n, 60) }) + "</p>" : "") + "</div>" +
            '<ul class="card-meta">' + meta + "</ul>" +
            '<ul class="key-amen">' + keyChips() + "</ul>" +
            '<div class="card-actions">' +
              '<a class="btn btn-outline btn-sm" href="' + casaUrl(c) + '">' + esc(t("card.view")) + "</a>" +
              '<a class="btn btn-accent btn-sm" href="' + casaUrl(c) + '#reservar">' + esc(t("card.book")) + "</a>" +
            "</div>" +
          "</div>" +
        "</article>"
      );
    }).join("");
    applyFilter(currentFilter);
  }

  var currentFilter = "all";
  function applyFilter(f) {
    currentFilter = f;
    var box = $("#filters"); if (!box) return;
    $all(".chip", box).forEach(function (b) { var on = b.getAttribute("data-filter") === f; b.classList.toggle("is-active", on); b.setAttribute("aria-pressed", on); });
    $all(".card", $("#cards")).forEach(function (card) {
      var show = f === "all" ||
        (f === "outdoor" && card.getAttribute("data-outdoor") === "1") ||
        (f === "four" && Number(card.getAttribute("data-guests")) >= 4);
      card.hidden = !show;
    });
  }

  function renderAmenities() {
    var el = $("#amenities"); if (!el) return;
    el.innerHTML = AMENITIES.map(function (a) {
      var tx = a[lang] || a.es;
      return "<li>" + icon(a.i) + "<div><strong>" + esc(tx[0]) + "</strong><span>" + esc(tx[1]) + "</span></div></li>";
    }).join("");
  }

  function renderMosaic() {
    var el = $("#mosaic"); if (!el) return;
    el.innerHTML = ZONA.map(function (z, i) {
      var big = /w2|h2/.test(z.c);
      var cap = z[lang] || z.es;
      return '<button type="button" class="' + z.c + '" data-zona="' + i + '" aria-label="' + esc(cap) + '">' +
        '<img src="assets/img/zona/' + z.f + (big ? "-l" : "-m") + '.jpg" alt="' + esc(cap) + '" loading="lazy" decoding="async">' +
        "<figcaption>" + esc(cap) + "</figcaption></button>";
    }).join("");
  }

  function renderLocation() {
    setText("#address", CFG.address || "");
    setText("#foot-address", CFG.address || "");
    var el = $("#distances");
    if (el) el.innerHTML = DIST.map(function (d) { return "<li><span>" + esc(d[lang] || d.es) + "</span><strong>" + esc(d.d) + "</strong></li>"; }).join("");
    var lat = CFG.lat, lng = CFG.lng, dLat = 0.006, dLng = 0.011;
    var map = $("#map");
    if (map && lat && !map.getAttribute("src")) {
      map.setAttribute("src", "https://www.openstreetmap.org/export/embed.html?bbox=" + (lng - dLng) + "%2C" + (lat - dLat) + "%2C" + (lng + dLng) + "%2C" + (lat + dLat) + "&layer=mapnik&marker=" + lat + "%2C" + lng);
    }
    var ml = $("#map-link");
    if (ml && lat) ml.href = "https://www.google.com/maps/search/?api=1&query=" + lat + "%2C" + lng;
  }

  function directButtons() {
    var direct = "";
    if (CFG.whatsapp) direct += '<a class="btn btn-accent" href="https://wa.me/' + esc(String(CFG.whatsapp).replace(/\D/g, "")) + '" target="_blank" rel="noopener">' + esc(t("book.wa")) + "</a>";
    if (CFG.email) direct += '<a class="btn btn-sea" href="mailto:' + esc(CFG.email) + '">' + esc(t("book.mail")) + "</a>";
    if (CFG.telefono) direct += '<a class="btn btn-outline" href="tel:' + esc(String(CFG.telefono).replace(/[^\d+]/g, "")) + '">' + esc(t("book.call")) + " · " + esc(CFG.telefono) + "</a>";
    if (CFG.instagram) direct += '<a class="btn btn-outline" href="' + esc(CFG.instagram) + '" target="_blank" rel="noopener">' + esc(t("book.ig")) + "</a>";
    return direct;
  }

  function renderBooking() {
    var el = $("#book-grid"); if (!el) return;
    var cards = [
      ["star", t("direct.b1.t"), t("direct.b1.p")],
      ["shield", t("direct.b2.t"), t("direct.b2.p")],
      ["clock", t("direct.b3.t"), t("direct.b3.p", { d: cancelDias() })]
    ];
    var html = cards.map(function (c) {
      return '<div class="book-card benefit">' + icon(c[0]) + "<h3>" + esc(c[1]) + "</h3><p>" + esc(c[2]) + "</p></div>";
    }).join("");
    var direct = directButtons();
    if (direct) html += '<div class="book-card benefit">' + icon("pin") + "<h3>" + esc(t("book.direct.t")) + "</h3><p>" + esc(t("book.direct.p")) + '</p><div class="book-links">' + direct + "</div></div>";
    el.innerHTML = html;
  }

  /* ------------------------------------------------------------------
     PÁGINA DE CADA CASA
  ------------------------------------------------------------------ */
  var CASA = null;
  function currentCasa() {
    var m = /[?&]n=(\d+)/.exec(location.search);
    var n = m ? Number(m[1]) : NaN;
    for (var i = 0; i < CASAS.length; i++) if (CASAS[i].n === n) return CASAS[i];
    return null;
  }

  function renderCasa() {
    var c = CASA; if (!c) return;
    var title = t("card.house", { n: c.n });
    document.title = t("casa.meta.title", { n: c.n });
    setText("#casa-title", title);
    setText("#casa-sub", t("casa.sub"));

    // Galería (1 grande + 4 pequeñas)
    var g = $("#casa-gallery");
    var shown = Math.min(5, c.photos.length), gh = "";
    for (var i = 0; i < shown; i++) {
      gh += '<button type="button" class="cg-item cg-' + i + '" data-photo="' + i + '" aria-label="' + esc(title + " · " + (i + 1)) + '">' +
        '<img src="' + esc(photoUrl(c, i, i === 0 ? "large" : "card")) + '" alt="' + esc(photoCaption(c, i) || title) + '"' + (i === 0 ? ' fetchpriority="high"' : ' loading="lazy"') + "></button>";
    }
    gh += '<button type="button" class="cg-all" data-photo="0">' + icon("grid") + esc(t("casa.all", { n: c.photos.length })) + "</button>";
    g.innerHTML = gh;

    // Datos clave
    var specs = "";
    if (c.m2) specs += "<li>" + icon("area") + "<span>" + c.m2 + " m²</span></li>";
    specs += "<li>" + icon("users") + "<span>" + esc(t("card.guests", { n: c.guests })) + "</span></li>";
    specs += "<li>" + icon("bed") + "<span>" + esc(t("card.bed")) + "</span></li>";
    specs += "<li>" + icon("bath") + "<span>" + esc(t("spec.bath")) + "</span></li>";
    if (c.outdoor) specs += "<li>" + icon("sun") + "<span>" + esc(outdoorLabel(c)) + "</span></li>";
    $("#casa-specs").innerHTML = specs;

    // Descripción y servicios clave
    var out = c.outdoor ? t("casa.desc." + c.outdoor) : "";
    $("#casa-desc").innerHTML = "<p>" + esc(t("casa.desc1", { out: out })) + "</p><p>" + esc(t("casa.desc2")) + "</p>";
    $("#casa-key").innerHTML = keyChips();

    // Información para el huésped
    var isB = c.platform === "booking";
    var inTxt = cap1(checkinText(c)) + (isB ? ". " + t("g.in.note") : "");
    var outTxt = cap1(checkoutText(c));
    var rows = [
      ["clock", t("g.in"), inTxt], ["clock", t("g.out"), outTxt],
      ["users", t("g.cap"), t("g.cap.v", { n: c.guests })], ["bed", t("g.beds"), t("g.beds.v")],
      ["baby", t("g.kids"), t("g.kids.v")], ["shield", t("g.rules"), t("g.rules.v")],
      ["pin", t("g.park"), t("g.park.v")], ["check", t("g.lang"), t("g.lang.v")]
    ];
    $("#casa-guest").innerHTML = rows.map(function (r) {
      return '<div class="gi">' + icon(r[0]) + "<dt>" + esc(r[1]) + "</dt><dd>" + esc(r[2]) + "</dd></div>";
    }).join("");

    // Desplegable 1: servicios
    var groups = servicesFor(c), total = 0;
    groups.forEach(function (x) { total += x.items.length; });
    setText("#acc-amen-sub", t("acc.amen.s", { n: total }));
    $("#acc-servicios-body").innerHTML =
      '<div class="amen-groups">' + groups.map(function (x) {
        return '<div class="amen-group"><h3>' + icon(x.g.icon) + esc(x.g[lang] || x.g.es) + "</h3><ul>" +
          x.items.map(function (it) { return "<li>" + icon("check") + esc(it[lang] || it.es) + "</li>"; }).join("") + "</ul></div>";
      }).join("") + '</div><p class="acc-note">' + esc(t("acc.amen.note")) + "</p>";

    // Desplegable 2: barrio
    function places(tipo) {
      return LUGARES.filter(function (p) { return p.tipo === tipo; }).map(function (p) {
        return '<li class="place' + (p.oferta ? " has-offer" : "") + '">' +
          '<div class="place-head"><strong>' + esc(p.nombre) + "</strong>" + (p.oferta ? '<span class="offer">' + esc(p.oferta) + "</span>" : "") + "</div>" +
          "<p>" + esc(p[lang] || p.es) + "</p>" +
          '<div class="place-foot">' + (p.dir ? "<span>" + icon("pin") + esc(p.dir) + "</span>" : "<span></span>") +
          '<a href="' + esc(mapsUrl(p.q || p.nombre)) + '" target="_blank" rel="noopener">' + esc(t("acc.area.map")) + icon("arrow") + "</a></div></li>";
      }).join("");
    }
    $("#acc-barrio-body").innerHTML =
      '<h3 class="acc-sub">' + esc(t("acc.area.eat")) + '</h3><ul class="places">' + places("comer") + "</ul>" +
      '<h3 class="acc-sub">' + esc(t("acc.area.see")) + '</h3><ul class="places">' + places("ver") + "</ul>" +
      '<p class="acc-note">' + esc(t("acc.area.note")) + "</p>";

    // Desplegable 3: historia
    var H = HISTORIA ? (HISTORIA[lang] || HISTORIA.es) : null;
    if (H) {
      $("#acc-historia-body").innerHTML = '<p class="hist-intro">' + esc(H.intro) + '</p><ol class="timeline">' +
        H.hitos.map(function (h) { return '<li><span class="tl-year">' + esc(h[0]) + "</span><p>" + esc(h[1]) + "</p></li>"; }).join("") +
        "</ol><p>" + esc(H.cierre) + "</p>";
    }

    // Reserva directa: calendario, precio y pago
    bwRender();
    var hb = $("#header-book"); if (hb) { hb.href = "#reservar"; hb.removeAttribute("target"); hb.removeAttribute("rel"); }
    bwBarraMovil(c, title);

    // Otras casas
    $("#others").innerHTML = CASAS.filter(function (o) { return o.n !== c.n; }).map(function (o) {
      return '<a class="other" href="' + casaUrl(o) + '"><img src="' + esc(photoUrl(o, 0, "card")) + '" alt="" loading="lazy">' +
        "<span><strong>" + esc(t("card.house", { n: o.n })) + "</strong><small>" + esc(t("card.guests", { n: o.guests })) + (o.outdoor ? " · " + esc(outdoorLabel(o)) : "") + "</small></span></a>";
    }).join("");
    setText("#foot-address", CFG.address || "");
  }

  /* ------------------------------------------------------------------
     RESERVA DIRECTA: calendario, precio y pago con Stripe
  ------------------------------------------------------------------ */
  var BW = { entrada: null, salida: null, huespedes: 2, mes: null, bloqueadas: new Set(), cargando: false, preview: !ONLINE, msg: null, min: null, max: null };
  var DIAS = { es: ["L", "M", "X", "J", "V", "S", "D"], en: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"] };

  function locale() { return lang === "es" ? "es-ES" : "en-GB"; }
  function fechaCorta(ds) {
    try { return new Intl.DateTimeFormat(locale(), { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }).format(RS.parse(ds)); }
    catch (e) { return ds; }
  }
  function fechaLarga(ds) {
    try { return new Intl.DateTimeFormat(locale(), { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(RS.parse(ds)); }
    catch (e) { return ds; }
  }
  function euros(n) { return (Math.round(n * 100) / 100).toLocaleString(locale(), { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + " €"; }

  function bwInit(c) {
    var hoy = RS.hoy();
    BW.huespedes = Math.min(2, c.guests);
    BW.min = RS.addDays(hoy, RS.precios.antelacionMinima);
    BW.max = RS.addDays(hoy, RS.precios.horizonte);
    BW.mes = BW.min.slice(0, 8) + "01";
    if (/[?&]cancelado=1/.test(location.search)) BW.msg = { k: "bw.cancelled", tipo: "info" };
    bwCargar(c);
    var box = $("#reservar");
    box.addEventListener("click", bwClick);
    box.addEventListener("change", function (e) {
      if (e.target.id === "bw-guests") { BW.huespedes = Number(e.target.value); bwRender(); }
    });
  }

  /* Barra fija inferior de la ficha de casa (se repinta cuando llegan las tarifas en vivo) */
  function bwBarraMovil(c, title) {
    var box = $("#mobile-book");
    if (!box || !c) return;
    title = title || t("card.house", { n: c.n });
    var desdeTxt = RS ? t("bw.from") + " " + RS.desde(c.n, 90) + " € " + t("bw.night") : title;
    box.innerHTML = "<div><strong>" + esc(desdeTxt) + "</strong><span>" + esc(title + " · " + t("casa.fact.guests", { n: c.guests })) +
      '</span></div><a class="btn btn-accent btn-sm" href="#reservar">' + esc(t("card.book")) + "</a>";
  }

  /* Portada: refresca el "desde X €" de las tarjetas con las tarifas reales de Lodgify */
  function refrescarDesdeTarjetas() {
    var tarjetas = document.querySelectorAll(".card[data-casa]");
    if (!tarjetas.length || !ONLINE || !RS) return;
    fetch(API + "/precios?resumen=1", { cache: "no-store" })
      .then(function (r) { if (!r.ok) throw new Error(String(r.status)); return r.json(); })
      .then(function (d) {
        var casas = (d && d.casas) || {};
        Array.prototype.forEach.call(tarjetas, function (art) {
          var n = art.getAttribute("data-casa");
          var p = casas[n] && casas[n].desde;
          var el = art.querySelector(".card-from");
          if (p && el) el.innerHTML = t("card.from", { p: p });
        });
      })
      .catch(function () {});
  }

  function bwCargar(c) {
    if (!ONLINE) { BW.preview = true; return; }
    BW.cargando = true;
    var disp = fetch(API + "/disponibilidad?casa=" + c.n, { cache: "no-store" })
      .then(function (r) { if (!r.ok) throw new Error(String(r.status)); return r.json(); })
      .then(function (d) { BW.bloqueadas = new Set(d.bloqueadas || []); BW.preview = false; })
      .catch(function () { BW.preview = true; });
    // Tarifas en vivo de Lodgify: las mismas que Booking y Airbnb, para que el precio coincida.
    var precios = fetch(API + "/precios?casa=" + c.n, { cache: "no-store" })
      .then(function (r) { if (!r.ok) throw new Error(String(r.status)); return r.json(); })
      .then(function (d) { if (d && d.disponible) RS.aplicarTarifas(c.n, d); })
      .catch(function () {});
    Promise.all([disp, precios]).then(function () { BW.cargando = false; bwRender(); bwBarraMovil(c); });
  }

  function bwQuote() {
    if (!CASA || !BW.entrada || !BW.salida) return null;
    return RS.presupuesto({ casa: CASA.n, entrada: BW.entrada, salida: BW.salida, huespedes: BW.huespedes });
  }

  function bwMesDesplazado(m, delta) {
    var d = RS.parse(m); d.setUTCMonth(d.getUTCMonth() + delta); return RS.fmt(d).slice(0, 8) + "01";
  }

  function bwCalendario(c) {
    var m = BW.mes, d0 = RS.parse(m);
    var dow = (d0.getUTCDay() + 6) % 7;
    var diasMes = new Date(Date.UTC(d0.getUTCFullYear(), d0.getUTCMonth() + 1, 0)).getUTCDate();
    var nombre = new Intl.DateTimeFormat(locale(), { month: "long", year: "numeric", timeZone: "UTC" }).format(d0);
    var prevOk = m > BW.min.slice(0, 8) + "01";
    var nextOk = RS.addDays(m, diasMes) <= BW.max;
    var eligiendoSalida = BW.entrada && !BW.salida;
    var h = '<div class="bw-cal"><div class="bw-cal-head">' +
      '<button type="button" class="bw-nav" data-nav="-1" aria-label="' + esc(t("bw.prev")) + '"' + (prevOk ? "" : " disabled") + '><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button>' +
      "<strong>" + esc(nombre.charAt(0).toUpperCase() + nombre.slice(1)) + "</strong>" +
      '<button type="button" class="bw-nav" data-nav="1" aria-label="' + esc(t("bw.next")) + '"' + (nextOk ? "" : " disabled") + '><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg></button></div>' +
      '<div class="bw-grid" role="grid">' + DIAS[lang].map(function (d) { return '<span class="bw-dow">' + d + "</span>"; }).join("");
    for (var b = 0; b < dow; b++) h += '<span class="bw-blank"></span>';
    for (var i = 1; i <= diasMes; i++) {
      var ds = m.slice(0, 8) + pad(i);
      var off = ds < BW.min || ds > BW.max;
      var busy = BW.bloqueadas.has(ds);
      var canOut = eligiendoSalida && ds > BW.entrada && RS.diffDays(BW.entrada, ds) <= RS.precios.estanciaMaxima && !RS.conflicto(BW.entrada, ds, BW.bloqueadas);
      var clickable = !off && (canOut || !busy);
      var cls = ["bw-day"];
      if (off) cls.push("is-off");
      if (busy) cls.push("is-busy");
      if (canOut) cls.push("can-out");
      if (ds === BW.entrada) cls.push("is-in");
      if (ds === BW.salida) cls.push("is-out");
      if (BW.entrada && BW.salida && ds > BW.entrada && ds < BW.salida) cls.push("in-range");
      var pn = !off && !busy ? RS.precioNoche(c.n, ds) : null;
      h += '<button type="button" class="' + cls.join(" ") + '" data-d="' + ds + '"' + (clickable ? "" : " disabled") +
        ' aria-label="' + esc(fechaLarga(ds) + (busy ? " · " + t("bw.busy") : pn ? " · " + pn.precio + " €" : "")) + '"' +
        (ds === BW.entrada || ds === BW.salida ? ' aria-pressed="true"' : "") + ">" +
        "<span>" + i + "</span>" + (pn ? "<small>" + pn.precio + "</small>" : "") + "</button>";
    }
    h += '</div><p class="bw-legend"><span class="lg-busy"></span>' + esc(t("bw.busy")) + "</p></div>";
    return h;
  }

  function bwRender() {
    var box = $("#reservar"); if (!box || !RS || !CASA) return;
    var c = CASA, q = bwQuote();
    var focoD = document.activeElement && document.activeElement.getAttribute ? document.activeElement.getAttribute("data-d") : null;
    var h = '<div class="bw-head"><p class="bw-price"><span>' + esc(t("bw.from")) + "</span> <strong>" + RS.desde(c.n, 90) + " €</strong> <span>" + esc(t("bw.night")) + "</span></p></div>";
    h += '<div class="bw-dates">' +
      '<div class="bw-d' + (!BW.entrada || BW.salida ? "" : "") + (!BW.entrada ? " is-next" : "") + '"><small>' + esc(t("bw.in")) + "</small><strong>" + esc(BW.entrada ? fechaCorta(BW.entrada) : t("bw.pick")) + "</strong></div>" +
      '<div class="bw-d' + (BW.entrada && !BW.salida ? " is-next" : "") + '"><small>' + esc(t("bw.out")) + "</small><strong>" + esc(BW.salida ? fechaCorta(BW.salida) : "—") + "</strong></div></div>";
    h += bwCalendario(c);
    var opts = "";
    for (var g = 1; g <= c.guests; g++) opts += '<option value="' + g + '"' + (g === BW.huespedes ? " selected" : "") + ">" + esc(g === 1 ? t("bw.guest1") : t("bw.guestN", { n: g })) + "</option>";
    h += '<label class="bw-guests"><span>' + esc(t("bw.guests")) + '</span><select id="bw-guests">' + opts + "</select></label>";

    var msg = BW.msg ? t(BW.msg.k, { n: BW.msg.n }) : (BW.cargando ? t("bw.loading") : !BW.entrada ? t("bw.hint.in") : !BW.salida ? t("bw.hint.out") : "");
    if (q && !q.ok) msg = t("err." + q.error, { n: q.dato });
    if (msg) h += '<p class="bw-msg' + (BW.msg ? " is-" + (BW.msg.tipo || "warn") : "") + '" role="status">' + esc(msg) + "</p>";

    if (q && q.ok) {
      h += '<dl class="bw-sum">' +
        "<div><dt>" + esc(t("bw.nights", { n: q.noches })) + "</dt><dd>" + euros(q.tarifaBase - q.descuento) + "</dd></div>" +
        (q.limpieza ? "<div><dt>" + esc(t("bw.clean")) + "</dt><dd>" + euros(q.limpieza) + "</dd></div>" : "") +
        '<div class="total"><dt>' + esc(t("bw.total")) + "</dt><dd>" + euros(q.total) + "</dd></div></dl>";
    }
    h += '<div class="bw-actions"><button type="button" class="btn btn-accent bw-go" id="bw-go"' + (q && q.ok ? "" : " disabled") + ">" + esc(t("bw.cta")) + (q && q.ok ? " · " + euros(q.total) : "") + "</button>" +
      (BW.entrada ? '<button type="button" class="bw-clear" id="bw-clear">' + esc(t("bw.clear")) + "</button>" : "") + "</div>";
    h += '<ul class="bw-trust"><li>' + icon("shield") + esc(t("bw.secure")) + "</li><li>" + icon("check") + '<a href="condiciones.html">' + esc(t("bw.cancel", { d: cancelDias() })) + "</a></li></ul>";
    if (BW.preview) h += '<p class="bw-preview">' + esc(t("bw.preview")) + "</p>";
    box.innerHTML = h;
    if (focoD) { var f = box.querySelector('[data-d="' + focoD + '"]'); if (f && !f.disabled) f.focus(); }
  }

  function bwClick(e) {
    var b = e.target.closest("button"); if (!b || b.disabled) return;
    if (b.getAttribute("data-d")) { bwPick(b.getAttribute("data-d")); return; }
    if (b.getAttribute("data-nav")) { BW.mes = bwMesDesplazado(BW.mes, Number(b.getAttribute("data-nav"))); bwRender(); return; }
    if (b.id === "bw-clear") { BW.entrada = BW.salida = null; BW.msg = null; bwRender(); return; }
    if (b.id === "bw-go") bwAbrirFormulario();
  }

  function bwPick(d) {
    BW.msg = null;
    var P = RS.precios;
    if (!BW.entrada || BW.salida || d <= BW.entrada) {
      if (BW.bloqueadas.has(d)) return;
      BW.entrada = d; BW.salida = null;
    } else {
      var n = RS.diffDays(BW.entrada, d);
      if (RS.conflicto(BW.entrada, d, BW.bloqueadas)) { BW.msg = { k: "bw.gap" }; if (!BW.bloqueadas.has(d)) BW.entrada = d; }
      else if (n < P.estanciaMinima) BW.msg = { k: "bw.min", n: P.estanciaMinima };
      else if (n > P.estanciaMaxima) BW.msg = { k: "bw.max", n: P.estanciaMaxima };
      else BW.salida = d;
    }
    bwRender();
  }

  /* ---------- Formulario del huésped y pago ---------- */
  function horasLlegada(c) {
    var p = String(c.checkin).split("–");
    var ini = parseInt(p[0], 10) || 15, fin = p[1] ? parseInt(p[1], 10) : 23;
    var out = [];
    for (var hh = ini; hh < fin; hh++) out.push(hh + ":00–" + (hh + 1) + ":00");
    return out;
  }

  function bwAbrirFormulario() {
    var q = bwQuote(); if (!q || !q.ok) return;
    var c = CASA;
    var m = $("#bw-modal");
    if (!m) {
      m = document.createElement("div");
      m.id = "bw-modal"; m.className = "bw-modal"; m.setAttribute("role", "dialog"); m.setAttribute("aria-modal", "true"); m.setAttribute("aria-labelledby", "fm-title");
      document.body.appendChild(m);
      m.addEventListener("click", function (e) { if (e.target === m || e.target.closest("[data-close]")) bwCerrarFormulario(); });
      m.addEventListener("submit", function (e) { e.preventDefault(); bwEnviar(e.target); });
      m.addEventListener("input", function () { var er = $("#fm-err"); if (er && !er.classList.contains("is-info")) er.hidden = true; });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !m.hidden) bwCerrarFormulario(); });
    }
    var horas = horasLlegada(c).map(function (x) { return "<option>" + x + "</option>"; }).join("");
    m.innerHTML =
      '<div class="bw-sheet">' +
        '<button type="button" class="bw-x" data-close aria-label="' + esc(t("lb.close")) + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
        '<h2 id="fm-title">' + esc(t("fm.title")) + "</h2>" +
        '<div class="fm-resumen"><strong>' + esc(t("card.house", { n: c.n })) + "</strong><span>" + esc(fechaCorta(q.entrada) + " → " + fechaCorta(q.salida)) + " · " + esc(t("bw.nights", { n: q.noches })) + " · " +
          esc(q.huespedes === 1 ? t("bw.guest1") : t("bw.guestN", { n: q.huespedes })) + '</span><b>' + euros(q.total) + "</b></div>" +
        '<p class="fm-cancel' + (cancelable(q.entrada) ? "" : " is-no") + '">' + icon(cancelable(q.entrada) ? "check" : "clock") +
          esc(cancelable(q.entrada) ? t("fm.cancel.si", { f: fechaLarga(limiteCancelacion(q.entrada)) }) : t("fm.cancel.no", { d: cancelDias() })) + "</p>" +
        '<form class="fm" novalidate>' +
          '<label class="fm-full"><span>' + esc(t("fm.name")) + ' *</span><input name="nombre" autocomplete="name" required maxlength="80"></label>' +
          '<label><span>' + esc(t("fm.email")) + ' *</span><input name="email" type="email" autocomplete="email" required maxlength="120"></label>' +
          '<label><span>' + esc(t("fm.phone")) + ' *</span><input name="telefono" type="tel" autocomplete="tel" required maxlength="30"></label>' +
          '<label><span>' + esc(t("fm.country")) + '</span><input name="pais" autocomplete="country-name" maxlength="56"></label>' +
          '<label><span>' + esc(t("fm.arrival")) + '</span><select name="hora"><option value="">—</option>' + horas + "</select></label>" +
          '<label class="fm-full"><span>' + esc(t("fm.msg")) + '</span><textarea name="mensaje" rows="3" maxlength="450"></textarea></label>' +
          '<label class="fm-check fm-full"><input type="checkbox" name="acepta" required><span>' + t("fm.accept") + "</span></label>" +
          '<p class="fm-err fm-full" id="fm-err" role="alert" hidden></p>' +
          '<div class="fm-actions fm-full"><button type="button" class="btn btn-outline" data-close>' + esc(t("fm.back")) + '</button>' +
            '<button type="submit" class="btn btn-accent" id="fm-pay">' + icon("shield") + esc(t("fm.pay", { t: euros(q.total).replace(" €", "") })) + "</button></div>" +
          '<p class="fm-note fm-full">' + esc(t("fm.note")) + "</p>" +
        "</form>" +
      "</div>";
    m.hidden = false;
    document.body.classList.add("no-scroll");
    var first = m.querySelector("input"); if (first) first.focus();
  }

  function bwCerrarFormulario() {
    var m = $("#bw-modal"); if (!m) return;
    m.hidden = true;
    document.body.classList.remove("no-scroll");
    var go = $("#bw-go"); if (go) go.focus();
  }

  function bwError(key, dato, tipo) {
    var el = $("#fm-err"); if (!el) return;
    el.textContent = T[lang]["err." + key] || T.es["err." + key] ? t("err." + key, { n: dato }) : t("err.generic");
    el.className = "fm-err fm-full" + (tipo ? " is-" + tipo : "");
    el.hidden = false;
  }

  function bwEnviar(form) {
    var q = bwQuote(); if (!q || !q.ok) return;
    var v = function (n) { return (form.elements[n] && form.elements[n].value || "").trim(); };
    var datos = {
      casa: CASA.n, entrada: q.entrada, salida: q.salida, huespedes: q.huespedes,
      nombre: v("nombre"), email: v("email"), telefono: v("telefono"), pais: v("pais"), hora: v("hora"), mensaje: v("mensaje"),
      idioma: lang, acepta: form.elements.acepta.checked
    };
    if (datos.nombre.length < 2) return bwError("nombre");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(datos.email)) return bwError("email");
    if (datos.telefono.replace(/\D/g, "").length < 6) return bwError("telefono");
    if (!datos.acepta) return bwError("condiciones");
    if (BW.preview) return bwError("preview", null, "info");
    var btn = $("#fm-pay"); btn.disabled = true; btn.textContent = t("fm.sending");
    function resetBoton() { btn.disabled = false; btn.innerHTML = icon("shield") + esc(t("fm.pay", { t: euros(q.total).replace(" €", "") })); }
    fetch(API + "/reservar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        if (res.ok && res.j.url) { location.href = res.j.url; return; }
        var e = res.j.error || "generic";
        if (e === "ocupado") {
          bwCerrarFormulario();
          BW.entrada = BW.salida = null; BW.msg = { k: "err.ocupado" };
          bwCargar(CASA); bwRender();
          return;
        }
        resetBoton();
        bwError(e, res.j.dato);
      })
      .catch(function () {
        resetBoton();
        bwError("generic");
      });
  }

  /* ------------------------------------------------------------------
     PÁGINA DE CONFIRMACIÓN
  ------------------------------------------------------------------ */
  var OK = { estado: "cargando", d: null };
  function okLoad() {
    var m = /[?&]session_id=([^&#]+)/.exec(location.search);
    if (!m) { OK.estado = "error"; return; }
    if (!ONLINE) { OK.estado = "pendiente"; return; }
    fetch(API + "/reserva?session_id=" + encodeURIComponent(m[1]), { cache: "no-store" })
      .then(function (r) { if (!r.ok) throw new Error(String(r.status)); return r.json(); })
      .then(function (d) { OK.d = d; OK.estado = d.pagada ? "ok" : "pendiente"; })
      .catch(function () { OK.estado = "error"; })
      .then(function () { renderOk(); });
  }
  function renderOk() {
    document.title = t("ok.meta");
    var el = $("#ok-box"); if (!el) return;
    var inicio = '<p class="ok-actions"><a class="btn btn-accent" href="index.html">' + esc(t("ok.home")) + "</a></p>";
    if (OK.estado === "cargando") { el.innerHTML = '<p class="ok-loading">' + (lang === "es" ? "Cargando tu reserva…" : "Loading your booking…") + "</p>"; return; }
    if (OK.estado === "error") { el.innerHTML = '<div class="ok-icon is-warn">' + icon("shield") + "</div><h1>" + esc(t("ok.err")) + "</h1><p>" + esc(t("ok.err.p")) + "</p>" + inicio; return; }
    if (OK.estado === "pendiente") { el.innerHTML = '<div class="ok-icon">' + icon("clock") + "</div><h1>" + esc(t("ok.pending")) + "</h1><p>" + esc(t("ok.pending.p")) + "</p>" + inicio; return; }
    var d = OK.d, casa = null;
    CASAS.forEach(function (c) { if (c.n === d.casa) casa = c; });
    var nombre = String(d.nombre || "").split(" ")[0];
    el.innerHTML =
      '<div class="ok-icon is-ok">' + icon("check") + "</div>" +
      "<h1>" + esc(t("ok.title")) + '</h1><p class="lead">' + esc(t("ok.lead", { n: nombre })) + "</p>" +
      '<dl class="ok-dl">' +
        "<div><dt>" + esc(t("ok.casa")) + "</dt><dd>" + esc(t("card.house", { n: d.casa })) + "</dd></div>" +
        "<div><dt>" + esc(t("ok.dates")) + "</dt><dd>" + esc(fechaLarga(d.entrada)) + " → " + esc(fechaLarga(d.salida)) + " · " + esc(t("bw.nights", { n: d.noches })) + "</dd></div>" +
        "<div><dt>" + esc(t("ok.guests")) + "</dt><dd>" + d.huespedes + "</dd></div>" +
        "<div><dt>" + esc(t("ok.total")) + "</dt><dd>" + euros(d.total) + "</dd></div>" +
        (d.email ? "<div><dt>" + esc(t("ok.email")) + "</dt><dd>" + esc(d.email) + "</dd></div>" : "") +
        "<div><dt>" + esc(t("ok.cancel")) + "</dt><dd>" + esc(cancelable(d.entrada) ? t("ok.cancel.si", { f: fechaLarga(limiteCancelacion(d.entrada)) }) : t("ok.cancel.no")) + "</dd></div>" +
      "</dl>" +
      "<h2>" + esc(t("ok.next")) + '</h2><ol class="ok-steps"><li>' + esc(t("ok.n1")) + "</li><li>" + esc(t("ok.n2")) + "</li>" +
        (casa ? "<li>" + esc(t("ok.n3", { "in": cap1(checkinText(casa)), out: checkoutText(casa) })) + "</li>" : "") + "</ol>" + inicio;
  }

  /* ------------------------------------------------------------------
     CONDICIONES
  ------------------------------------------------------------------ */
  function renderCond() {
    document.title = lang === "es" ? "Condiciones de reserva y privacidad · Aparthotel Cabanyal" : "Booking terms and privacy · Aparthotel Cabanyal";
    $all("[data-lang-block]").forEach(function (el) { el.hidden = el.getAttribute("data-lang-block") !== lang; });
    var E = CFG.empresa || {};
    $all("[data-emp]").forEach(function (el) {
      var k = el.getAttribute("data-emp");
      var v = E[k] || (k === "nombre" ? "Nou Cabanyal SL" : k === "email" ? (CFG.email || "") : "");
      el.textContent = v || (lang === "es" ? "[pendiente]" : "[pending]");
      el.classList.toggle("pend", !v);
    });
    $all('[data-var="cancel"]').forEach(function (el) { el.textContent = cancelDias(); });
  }

  /* ------------------------------------------------------------------
     IDIOMA
  ------------------------------------------------------------------ */
  function applyLang(l) {
    lang = T[l] ? l : "es";
    document.documentElement.lang = lang;
    if (!IS_CASA && !IS_OK && !IS_COND) {
      document.title = t("meta.title");
      var md = $('meta[name="description"]'); if (md) md.setAttribute("content", t("meta.desc"));
    }
    $all("[data-i18n]").forEach(function (el) { el.textContent = t(el.getAttribute("data-i18n")); });
    $all("[data-i18n-alt]").forEach(function (el) { el.setAttribute("alt", t(el.getAttribute("data-i18n-alt"))); });
    $all(".lang button").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-lang") === lang ? "true" : "false"); });
    $("#lb-close").setAttribute("aria-label", t("lb.close"));
    $("#lb-prev").setAttribute("aria-label", t("lb.prev"));
    $("#lb-next").setAttribute("aria-label", t("lb.next"));
    setText("#foot-address", CFG.address || "");
    if (IS_CASA) { renderCasa(); }
    else if (IS_OK) { renderOk(); }
    else if (IS_COND) { renderCond(); }
    else { renderBadges(); renderCards(); refrescarDesdeTarjetas(); renderAmenities(); renderMosaic(); renderLocation(); renderBooking(); }
    store("nc-lang", lang);
  }
  function initialLang() {
    var q = /[?&]lang=(es|en)/.exec(location.search);
    if (q) return q[1];
    var saved = store("nc-lang");
    if (saved === "es" || saved === "en") return saved;
    var nav = (navigator.language || "es").toLowerCase();
    return /^(es|ca|gl|eu)/.test(nav) ? "es" : "en";
  }

  /* ------------------------------------------------------------------
     GALERÍA
  ------------------------------------------------------------------ */
  var lb = { items: [], i: 0, trigger: null };
  var LB = {};
  function openGallery(items, index, title, book, trigger) {
    lb.items = items; lb.i = index || 0; lb.trigger = trigger || document.activeElement;
    LB.title.textContent = title;
    if (book) {
      LB.book.hidden = false; LB.book.href = book.href; LB.book.textContent = book.label;
      if (book.internal) { LB.book.removeAttribute("target"); LB.book.removeAttribute("rel"); }
    } else { LB.book.hidden = true; }
    LB.thumbs.innerHTML = items.map(function (it, i) {
      return '<button type="button" data-i="' + i + '" aria-label="' + (i + 1) + '"><img src="' + esc(it.thumb) + '" alt="" loading="lazy"></button>';
    }).join("");
    LB.root.hidden = false;
    document.body.classList.add("no-scroll");
    show(lb.i);
    LB.close.focus();
  }
  function show(i) {
    var n = lb.items.length; if (!n) return;
    lb.i = (i + n) % n;
    var it = lb.items[lb.i];
    LB.img.src = it.src; LB.img.alt = it.cap || LB.title.textContent;
    LB.cap.textContent = it.cap || "";
    LB.count.textContent = t("lb.of", { i: lb.i + 1, n: n });
    $all("button", LB.thumbs).forEach(function (b, k) {
      b.setAttribute("aria-current", k === lb.i ? "true" : "false");
      if (k === lb.i && b.scrollIntoView) b.scrollIntoView({ block: "nearest", inline: "center" });
    });
    [lb.i + 1, lb.i - 1].forEach(function (k) { var pre = new Image(); pre.src = lb.items[(k + n) % n].src; });
  }
  function closeGallery() {
    LB.root.hidden = true;
    document.body.classList.remove("no-scroll");
    LB.img.removeAttribute("src");
    if (lb.trigger && lb.trigger.focus) lb.trigger.focus();
  }
  function casaItems(casa) {
    return casa.photos.map(function (_, i) {
      return { src: photoUrl(casa, i, "large"), thumb: photoUrl(casa, i, "thumb"), cap: photoCaption(casa, i) };
    });
  }
  function zonaItems() {
    return ZONA.map(function (z) { return { src: "assets/img/zona/" + z.f + "-l.jpg", thumb: "assets/img/zona/" + z.f + "-m.jpg", cap: z[lang] || z.es }; });
  }
  function beachItems() {
    return [
      { src: "assets/img/zona/playa-arenas-l.jpg", thumb: "assets/img/zona/playa-arenas-m.jpg", cap: t("beach.alt1") },
      { src: "assets/img/zona/playa-palmeras-l.jpg", thumb: "assets/img/zona/playa-palmeras-m.jpg", cap: t("beach.alt2") }
    ];
  }

  /* ------------------------------------------------------------------
     INICIO
  ------------------------------------------------------------------ */
  function init() {
    LB = {
      root: $("#lightbox"), img: $("#lb-img"), cap: $("#lb-cap"), title: $("#lb-title"), count: $("#lb-count"),
      thumbs: $("#lb-thumbs"), book: $("#lb-book"), close: $("#lb-close")
    };

    if (IS_CASA) {
      CASA = currentCasa();
      if (!CASA) { location.replace("index.html#apartamentos"); return; }
      if (RS) bwInit(CASA);
    }
    if (IS_OK) okLoad();

    applyLang(initialLang());
    setText("#year", new Date().getFullYear());
    heroCarousel();

    // Idioma
    $all(".lang button").forEach(function (b) { b.addEventListener("click", function () { applyLang(b.getAttribute("data-lang")); }); });

    // Cabecera
    var header = $(".site-header");
    var fixedSolid = header.classList.contains("is-fixed-solid");
    function onScroll() { if (!fixedSolid) header.classList.toggle("is-solid", window.scrollY > 40); }
    window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
    var toggle = $(".menu-toggle");
    toggle.addEventListener("click", function () {
      var open = !header.classList.contains("is-open");
      header.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open);
    });
    $all(".nav a").forEach(function (a) { a.addEventListener("click", function () { header.classList.remove("is-open"); toggle.setAttribute("aria-expanded", "false"); }); });

    // Filtros
    var filters = $("#filters");
    if (filters) filters.addEventListener("click", function (e) {
      var b = e.target.closest(".chip"); if (b) applyFilter(b.getAttribute("data-filter"));
    });

    // Abrir galerías
    document.addEventListener("click", function (e) {
      var ph = e.target.closest("[data-photo]");
      if (ph && CASA) {
        openGallery(casaItems(CASA), Number(ph.getAttribute("data-photo")) || 0, t("card.house", { n: CASA.n }), { href: "#reservar", label: t("card.book"), internal: true }, ph);
        return;
      }
      if (e.target.closest("#lb-book") && LB.book.getAttribute("href") === "#reservar") { closeGallery(); }
      var z = e.target.closest("[data-zona]");
      if (z) { openGallery(zonaItems(), Number(z.getAttribute("data-zona")), t("area.gallery"), null, z); return; }
      var bz = e.target.closest("[data-zoom='beach']");
      if (bz) { openGallery(beachItems(), Number(bz.getAttribute("data-index")) || 0, t("beach.gallery"), null, bz); }
    });

    // Controles de la galería
    $("#lb-prev").addEventListener("click", function () { show(lb.i - 1); });
    $("#lb-next").addEventListener("click", function () { show(lb.i + 1); });
    LB.close.addEventListener("click", closeGallery);
    LB.thumbs.addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) show(Number(b.getAttribute("data-i"))); });
    LB.root.addEventListener("click", function (e) { if (e.target.classList.contains("lb-stage") || e.target.classList.contains("lb-figure")) closeGallery(); });
    document.addEventListener("keydown", function (e) {
      if (LB.root.hidden) return;
      if (e.key === "Escape") closeGallery();
      else if (e.key === "ArrowLeft") show(lb.i - 1);
      else if (e.key === "ArrowRight") show(lb.i + 1);
      else if (e.key === "Tab") {
        var f = $all("a[href]:not([hidden]), button", LB.root).filter(function (x) { return x.offsetParent !== null; });
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    var sx = null;
    LB.root.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
    LB.root.addEventListener("touchend", function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx; sx = null;
      if (Math.abs(dx) > 45) show(lb.i + (dx < 0 ? 1 : -1));
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
