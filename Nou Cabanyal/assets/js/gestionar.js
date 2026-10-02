/* Aparthotel Cabanyal — asistente "Gestionar reserva" (gestionar.html).
   Conversación guiada con botones: el huésped nunca escribe libremente salvo su código, su email,
   fechas, hora y teléfono. Todo lo que tiene que ver con dinero lo calcula el servidor. */
(function () {
  "use strict";
  var CFG = window.NC_CONFIG || {};
  var CASAS = window.NC_CASAS || [];
  var RS = window.NC_RESERVAS || null;
  var API = CFG.api || "/api";
  var lang = window.NC_LANG || document.documentElement.lang || "es";

  var TX = {
    es: {
      title: "Gestionar reserva · Aparthotel Cabanyal",
      h1: "Gestionar mi reserva",
      sub: "Cambia fechas, cancela o actualiza tus datos sin esperar a nadie.",
      hola: "¡Hola! Soy el asistente de reservas de Aparthotel Cabanyal. Para encontrar tu reserva necesito tu código y el email con el que reservaste.",
      hola2: "El código empieza por NC y lo tienes en la página de confirmación y en el recibo del pago.",
      ota: "¿Reservaste en Booking.com o Airbnb? Entonces se gestiona desde su web o app.",
      codigo: "Código de reserva", email: "Email de la reserva", buscar: "Buscar mi reserva",
      sinCodigo: "¿No tienes el código?", sinCodigoPide: "Sin problema. Escribe el email con el que reservaste y te mandamos tu código.", enviarCodigo: "Enviarme el código", volverLogin: "Ya tengo el código",
      codigoEnviado: "Si hay alguna reserva a nombre de ese email, te acabamos de enviar el código. Mira tu bandeja de entrada (y la carpeta de spam). Cuando lo tengas, escríbelo aquí.",
      buscando: "Buscando tu reserva…", cargando: "Un momento…",
      encontrada: "Aquí tienes tu reserva, {n}:", encontrada0: "Aquí tienes tu reserva:",
      casa: "Casa {n}", fechas: "Fechas", noches1: "1 noche", nochesN: "{n} noches", huespedes: "Huéspedes",
      pagado: "Pagado", devuelto: "Devuelto", total: "Precio de la estancia", llegada: "Llegada aprox.", tel: "Teléfono",
      pol: "Cancelación", polSi: "Gratuita hasta el {f} incluido", polNo: "No reembolsable", estado: "Estado", cancelada: "Cancelada",
      queHacer: "¿Qué quieres hacer?",
      oFechas: "Cambiar fechas", oHuesp: "Cambiar nº de huéspedes", oCancel: "Cancelar la reserva", oDatos: "Hora de llegada y teléfono",
      oInfo: "Cómo llegar y entrar", oRecibos: "Recibos de pago", oContacto: "Hablar con nosotros", oSalir: "Salir", oMenu: "Volver al menú",
      oOtra: "Buscar otra reserva", oNueva: "Hacer una nueva reserva",
      yaCancelada: "Esta reserva está cancelada. Si tienes cualquier duda, escríbenos.",
      yaEmpezada: "Tu estancia ya ha empezado, así que las fechas y la cancelación solo se pueden cambiar hablando con nosotros.",
      enCurso: "Estamos aplicando un cambio que acabas de pagar. Tarda solo unos segundos.", actualizar: "Actualizar",
      cancelSi: "Estás a tiempo: si cancelas ahora te devolvemos {x} a la misma tarjeta. Suele tardar entre 5 y 10 días en aparecer.",
      cancelNo: "Faltan menos de {d} días para tu llegada, así que la reserva ya no es reembolsable. Puedes cancelarla igualmente, pero no se devuelve el importe.",
      cancelNoR: "Esta reserva quedó como no reembolsable tras un cambio de última hora. Puedes cancelarla, pero no se devuelve el importe.",
      cancelSeguro: "¿Seguro que quieres cancelar? No se puede deshacer.", cancelConfirmar: "Sí, cancelar la reserva", cancelNoQuiero: "No, mantener la reserva",
      cancelHecha: "Hecho: tu reserva está cancelada y las noches vuelven a estar libres.", cancelReembolso: "Hemos ordenado el reembolso de {x}. Lo verás en tu tarjeta en 5 a 10 días.",
      cancelSinReemb: "Como estaba fuera de plazo, no hay reembolso.",
      fechasPide: "Elige las nuevas fechas. Puedes alargar, acortar o mover la estancia.", entrada: "Entrada", salida: "Salida",
      verPrecio: "Ver precio", otrasFechas: "Elegir otras fechas",
      huespPide: "¿Cuántas personas os vais a alojar? Esta casa admite hasta {n}.", huespN: "{n} huésped(es)",
      nuevo: "Así quedaría:", nuevoTotal: "Precio con el cambio", yaPagado: "Ya pagado",
      aPagar: "Tendrías que pagar {x} de diferencia. Te llevaremos a la pasarela segura de Stripe.",
      aDevolver: "Te devolveríamos {x} a tu tarjeta.",
      sinDevol: "La estancia nueva cuesta menos, pero como faltan menos de {d} días no se devuelve la diferencia.",
      igual: "El precio no cambia.",
      quedaNoR: "Ojo: al hacer el cambio dentro de los {d} días previos a la llegada, la reserva pasará a ser no reembolsable.",
      confirmar: "Confirmar el cambio", pagarDif: "Pagar {x} y confirmar", llevando: "Te llevamos al pago…",
      cambioHecho: "¡Listo! Tu reserva ha cambiado. Ya está actualizada en todos nuestros calendarios.",
      volviPago: "Gracias por el pago. Estamos aplicando el cambio a tu reserva…",
      pagoTarda: "El pago está hecho, pero el cambio está tardando más de lo normal. No hagas nada: lo revisamos y te escribimos. Si tienes prisa, contáctanos.",
      pagoFallido: "No hemos podido aplicar el cambio (las fechas se han ocupado mientras pagabas). Te hemos devuelto el pago de la diferencia y tu reserva sigue como estaba.",
      pagoCancelado: "No se ha completado el pago, así que tu reserva sigue igual.",
      datosPide: "Actualiza tu hora aproximada de llegada y tu teléfono.", guardar: "Guardar", datosHecho: "Guardado. Gracias por avisarnos.", sinHora: "Sin indicar",
      info1: "Dirección: {a}.", info2: "Entrada a partir de las {i} y salida antes de las {o}. La entrada es autónoma, con cerradura inteligente.",
      info3: "48 horas antes de tu llegada recibirás los códigos de acceso al edificio y al apartamento.",
      info4: "Antes de llegar te pediremos los datos de los viajeros, porque el registro es obligatorio por ley.", mapa: "Abrir en el mapa",
      recibos: "Estos son los recibos de tus pagos:", recibo: "Recibo del {f} · {x}", sinRecibos: "Todavía no hay recibos disponibles. Prueba en unos minutos.",
      contacto: "Estamos encantados de ayudarte. Elige cómo prefieres hablar con nosotros:", wa: "WhatsApp", mail: "Email", llamar: "Llamar",
      waTexto: "Hola, tengo la reserva {c} (Casa {n}, {f}).",
      adios: "¡Hasta pronto! Si necesitas algo más, aquí estaremos.",
      e: {
        no_encontrada: "No encuentro ninguna reserva con ese código y ese email. Revisa los dos (el código empieza por NC) y vuelve a probar.",
        demasiados_intentos: "Demasiados intentos seguidos. Espera unos minutos y vuelve a probar.",
        ya_cancelada: "Esta reserva ya está cancelada.", empezada: "Tu estancia ya ha empezado: para cambios, escríbenos.",
        cambio_en_curso: "Hay un cambio pagado que todavía se está aplicando. Espera un minuto y vuelve a probar.",
        sin_cambios: "Es igual que tu reserva actual. Elige algo distinto.",
        min: "La estancia mínima es de {d} noches.", max: "La estancia máxima es de {d} noches.",
        antelacion: "La llegada tiene que ser como pronto mañana.", horizonte: "Solo se puede reservar hasta un año vista.",
        huespedes: "Esta casa admite como máximo {d} personas.", fecha: "Esas fechas no son válidas o todavía no tienen precio.", orden: "La salida tiene que ser después de la entrada.",
        ocupado: "Lo siento, la noche del {d} ya está ocupada. Prueba con otras fechas.",
        sin_comprobar: "Ahora mismo no podemos comprobar la disponibilidad. Inténtalo en unos minutos.",
        precio_no_disponible: "Ahora mismo no podemos calcular el precio. Inténtalo en unos minutos.",
        precio_cambiado: "El precio acaba de cambiar. Te enseño el nuevo:",
        lodgify: "No hemos podido completar la operación en nuestro sistema de reservas. No se ha cobrado ni devuelto nada. Escríbenos y lo hacemos a mano.",
        telefono: "Ese teléfono no parece válido.", servicio: "Algo ha fallado por nuestra parte. Inténtalo de nuevo en unos minutos o escríbenos.",
        pagos_no_configurados: "La gestión online no está disponible ahora mismo. Escríbenos y te ayudamos.",
        red: "No hay conexión. Comprueba tu internet y vuelve a probar.", faltan: "Rellena el código y el email.", email: "Ese email no parece válido."
      }
    },
    en: {
      title: "Manage booking · Aparthotel Cabanyal",
      h1: "Manage my booking",
      sub: "Change dates, cancel or update your details without waiting for anyone.",
      hola: "Hi! I’m the Aparthotel Cabanyal booking assistant. To find your booking I need your booking code and the email you booked with.",
      hola2: "The code starts with NC. You’ll find it on the confirmation page and on your payment receipt.",
      ota: "Did you book on Booking.com or Airbnb? Then please manage it on their website or app.",
      codigo: "Booking code", email: "Booking email", buscar: "Find my booking",
      sinCodigo: "Don’t have your code?", sinCodigoPide: "No problem. Enter the email you booked with and we’ll send you your code.", enviarCodigo: "Send me the code", volverLogin: "I have my code",
      codigoEnviado: "If there’s a booking under that email, we’ve just sent you the code. Check your inbox (and spam folder). Once you have it, enter it here.",
      buscando: "Looking for your booking…", cargando: "One moment…",
      encontrada: "Here’s your booking, {n}:", encontrada0: "Here’s your booking:",
      casa: "House {n}", fechas: "Dates", noches1: "1 night", nochesN: "{n} nights", huespedes: "Guests",
      pagado: "Paid", devuelto: "Refunded", total: "Price of the stay", llegada: "Approx. arrival", tel: "Phone",
      pol: "Cancellation", polSi: "Free until {f} inclusive", polNo: "Non-refundable", estado: "Status", cancelada: "Cancelled",
      queHacer: "What would you like to do?",
      oFechas: "Change dates", oHuesp: "Change number of guests", oCancel: "Cancel booking", oDatos: "Arrival time and phone",
      oInfo: "Getting here and check-in", oRecibos: "Payment receipts", oContacto: "Talk to us", oSalir: "Exit", oMenu: "Back to menu",
      oOtra: "Find another booking", oNueva: "Make a new booking",
      yaCancelada: "This booking is cancelled. If you have any questions, please get in touch.",
      yaEmpezada: "Your stay has already started, so dates and cancellation can only be changed by talking to us.",
      enCurso: "We’re applying a change you’ve just paid for. It only takes a few seconds.", actualizar: "Refresh",
      cancelSi: "You’re in time: if you cancel now we’ll refund {x} to the same card. It usually takes 5 to 10 days to show.",
      cancelNo: "Your arrival is less than {d} days away, so the booking is no longer refundable. You can still cancel, but the amount won’t be refunded.",
      cancelNoR: "This booking became non-refundable after a last-minute change. You can cancel it, but the amount won’t be refunded.",
      cancelSeguro: "Are you sure you want to cancel? This can’t be undone.", cancelConfirmar: "Yes, cancel my booking", cancelNoQuiero: "No, keep my booking",
      cancelHecha: "Done: your booking is cancelled and the nights are available again.", cancelReembolso: "We’ve issued a refund of {x}. You’ll see it on your card in 5 to 10 days.",
      cancelSinReemb: "As it was outside the free cancellation period, there’s no refund.",
      fechasPide: "Choose your new dates. You can extend, shorten or move your stay.", entrada: "Check-in", salida: "Check-out",
      verPrecio: "See price", otrasFechas: "Choose other dates",
      huespPide: "How many people will be staying? This house sleeps up to {n}.", huespN: "{n} guest(s)",
      nuevo: "This is how it would look:", nuevoTotal: "Price with the change", yaPagado: "Already paid",
      aPagar: "You’d need to pay a difference of {x}. We’ll take you to Stripe’s secure checkout.",
      aDevolver: "We’d refund {x} to your card.",
      sinDevol: "The new stay costs less, but as your arrival is less than {d} days away the difference isn’t refunded.",
      igual: "The price doesn’t change.",
      quedaNoR: "Please note: as the change is made within {d} days of arrival, the booking will become non-refundable.",
      confirmar: "Confirm the change", pagarDif: "Pay {x} and confirm", llevando: "Taking you to payment…",
      cambioHecho: "Done! Your booking has been changed and all our calendars are updated.",
      volviPago: "Thanks for your payment. We’re applying the change to your booking…",
      pagoTarda: "Your payment went through, but the change is taking longer than usual. No need to do anything: we’ll check it and get back to you. If it’s urgent, contact us.",
      pagoFallido: "We couldn’t apply the change (the dates were taken while you were paying). We’ve refunded the difference and your booking stays as it was.",
      pagoCancelado: "The payment wasn’t completed, so your booking stays the same.",
      datosPide: "Update your approximate arrival time and your phone number.", guardar: "Save", datosHecho: "Saved. Thanks for letting us know.", sinHora: "Not specified",
      info1: "Address: {a}.", info2: "Check-in from {i}, check-out by {o}. Self check-in with a smart lock.",
      info3: "48 hours before you arrive you’ll receive the access codes for the building and the apartment.",
      info4: "Before arrival we’ll ask for your travellers’ details, as registration is a legal requirement in Spain.", mapa: "Open in maps",
      recibos: "Here are the receipts for your payments:", recibo: "Receipt {f} · {x}", sinRecibos: "No receipts available yet. Try again in a few minutes.",
      contacto: "We’re happy to help. Choose how you’d like to reach us:", wa: "WhatsApp", mail: "Email", llamar: "Call",
      waTexto: "Hi, I have booking {c} (House {n}, {f}).",
      adios: "See you soon! If you need anything else, we’re here.",
      e: {
        no_encontrada: "I can’t find a booking with that code and email. Please check both (the code starts with NC) and try again.",
        demasiados_intentos: "Too many attempts in a row. Please wait a few minutes and try again.",
        ya_cancelada: "This booking is already cancelled.", empezada: "Your stay has already started: please contact us for changes.",
        cambio_en_curso: "A paid change is still being applied. Please wait a minute and try again.",
        sin_cambios: "That’s the same as your current booking. Please choose something different.",
        min: "The minimum stay is {d} nights.", max: "The maximum stay is {d} nights.",
        antelacion: "Arrival must be tomorrow at the earliest.", horizonte: "Bookings can only be made up to one year ahead.",
        huespedes: "This house sleeps up to {d} people.", fecha: "Those dates aren’t valid or don’t have a price yet.", orden: "Check-out must be after check-in.",
        ocupado: "Sorry, the night of {d} is already taken. Please try other dates.",
        sin_comprobar: "We can’t check availability right now. Please try again in a few minutes.",
        precio_no_disponible: "We can’t calculate the price right now. Please try again in a few minutes.",
        precio_cambiado: "The price has just changed. Here’s the new one:",
        lodgify: "We couldn’t complete this in our booking system. Nothing has been charged or refunded. Please contact us and we’ll do it manually.",
        telefono: "That phone number doesn’t look right.", servicio: "Something went wrong on our side. Please try again in a few minutes or contact us.",
        pagos_no_configurados: "Online management isn’t available right now. Please contact us and we’ll help.",
        red: "No connection. Check your internet and try again.", faltan: "Please fill in the code and the email.", email: "That email doesn’t look right."
      }
    }
  };

  function t(k, v) {
    var s = (TX[lang] || TX.es)[k]; if (s === undefined) s = TX.es[k]; if (s === undefined) s = k;
    if (v) Object.keys(v).forEach(function (x) { s = s.split("{" + x + "}").join(v[x]); });
    return s;
  }
  function te(k, dato) { var s = (TX[lang] || TX.es).e[k] || TX.es.e[k] || TX[lang].e.servicio; return s.split("{d}").join(dato != null ? (/^\d{4}-\d\d-\d\d$/.test(dato) ? fecha(dato) : dato) : ""); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function loc() { return lang === "es" ? "es-ES" : "en-GB"; }
  function fecha(ds) { try { return new Intl.DateTimeFormat(loc(), { weekday: "short", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(ds + "T00:00:00Z")); } catch (e) { return ds; } }
  function euros(n) { return (Math.round(n * 100) / 100).toLocaleString(loc(), { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €"; }
  function ses(k, v) { try { if (v === undefined) return sessionStorage.getItem(k); if (v === null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, v); } catch (e) { return null; } }
  function casaDe(n) { for (var i = 0; i < CASAS.length; i++) if (CASAS[i].n === n) return CASAS[i]; return null; }
  function noches(n) { return n === 1 ? t("noches1") : t("nochesN", { n: n }); }
  function hoy() { return RS ? RS.hoy() : new Date().toISOString().slice(0, 10); }
  function addDays(s, n) { return RS ? RS.addDays(s, n) : s; }

  /* ---------- Estado y conversación ---------- */
  var S = { codigo: "", email: "", r: null, log: [], controles: null, ocupado: false, cambio: null };
  var EL = {};

  function bot(f) { S.log.push({ de: "bot", f: typeof f === "function" ? f : function () { return f; } }); }
  function yo(k) { S.log.push({ de: "yo", f: function () { return esc(t(k)); } }); }
  function controles(f) { S.controles = f; render(); }

  function render() {
    if (!EL.chat) return;
    document.title = t("title");
    EL.h1.textContent = t("h1"); EL.sub.textContent = t("sub");
    EL.chat.innerHTML = S.log.map(function (m) { return '<div class="gest-msg is-' + m.de + '">' + m.f() + "</div>"; }).join("") +
      (S.ocupado ? '<div class="gest-msg is-bot is-typing"><span></span><span></span><span></span></div>' : "");
    EL.ctl.innerHTML = S.ocupado || !S.controles ? "" : S.controles();
    var last = EL.chat.lastElementChild;
    if (last && S.log.length > 1) last.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function llamar(datos) {
    S.ocupado = true; render();
    var cuerpo = Object.assign({ codigo: S.codigo, email: S.email }, datos);
    return fetch(API + "/gestionar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(cuerpo), cache: "no-store" })
      .then(function (r) { return r.json().catch(function () { return { error: "servicio" }; }).then(function (j) { return { status: r.status, j: j }; }); })
      .catch(function () { return { status: 0, j: { error: "red" } }; })
      .then(function (x) { S.ocupado = false; return x; });
  }

  function opcion(k, accion, cls) { return '<button type="button" class="btn ' + (cls || "btn-outline") + '" data-a="' + accion + '">' + esc(t(k)) + "</button>"; }
  function botonesMenu() { return '<div class="gest-ops">' + opcion("oMenu", "menu") + "</div>"; }

  /* ---------- Tarjeta resumen ---------- */
  function resumen() {
    var r = S.r; if (!r) return "";
    var c = casaDe(r.casa);
    var pol = r.cancelada ? "" : (r.reembolsable ? t("polSi", { f: fecha(r.limite) }) : t("polNo"));
    return '<div class="gest-card"><div class="gest-card-top"><strong>' + esc(t("casa", { n: r.casa })) + "</strong><span>" + esc(r.codigo) + "</span></div>" +
      '<dl>' +
      (r.cancelada ? "<div><dt>" + esc(t("estado")) + '</dt><dd class="is-cancel">' + esc(t("cancelada")) + "</dd></div>" : "") +
      "<div><dt>" + esc(t("fechas")) + "</dt><dd>" + esc(fecha(r.entrada)) + " → " + esc(fecha(r.salida)) + " · " + esc(noches(r.noches)) + "</dd></div>" +
      "<div><dt>" + esc(t("huespedes")) + "</dt><dd>" + r.huespedes + "</dd></div>" +
      "<div><dt>" + esc(t("pagado")) + "</dt><dd>" + euros(r.pagado) + (r.devuelto > 0 ? " · " + esc(t("devuelto")) + " " + euros(r.devuelto) : "") + "</dd></div>" +
      (!r.cancelada && r.hora ? "<div><dt>" + esc(t("llegada")) + "</dt><dd>" + esc(r.hora) + "</dd></div>" : "") +
      (pol ? "<div><dt>" + esc(t("pol")) + "</dt><dd>" + esc(pol) + "</dd></div>" : "") +
      (c ? "" : "") +
      "</dl></div>";
  }

  /* ---------- Pasos ---------- */
  function inicio(codigo) {
    S.log = []; S.r = null;
    bot(function () { return "<p>" + esc(t("hola")) + "</p><p>" + esc(t("hola2")) + '</p><p class="gest-small">' + esc(t("ota")) + "</p>"; });
    pedirLogin(codigo);
  }
  function pedirLogin(codigo) {
    controles(function () {
      return '<form class="gest-form" id="gest-login" novalidate>' +
        '<label><span>' + esc(t("codigo")) + '</span><input name="codigo" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="NC-XXXX-XXXX" maxlength="16" value="' + esc(codigo || S.codigo || "") + '"></label>' +
        '<label><span>' + esc(t("email")) + '</span><input name="email" type="email" autocomplete="email" maxlength="120" value="' + esc(S.email || "") + '"></label>' +
        '<button type="submit" class="btn btn-accent">' + esc(t("buscar")) + "</button>" +
        '<button type="button" class="gest-link" data-a="sin_codigo">' + esc(t("sinCodigo")) + "</button></form>";
    });
  }
  function sinCodigoPasoSinEco() { controles(EL._recordar); }
  function sinCodigoPaso() {
    yo("sinCodigo");
    bot(function () { return "<p>" + esc(t("sinCodigoPide")) + "</p>"; });
    controles(function () {
      return '<form class="gest-form" id="gest-recordar" novalidate>' +
        '<label><span>' + esc(t("email")) + '</span><input name="email" type="email" autocomplete="email" maxlength="120" value="' + esc(S.email || "") + '"></label>' +
        '<button type="submit" class="btn btn-accent">' + esc(t("enviarCodigo")) + "</button>" +
        '<button type="button" class="gest-link" data-a="login">' + esc(t("volverLogin")) + "</button></form>";
    });
    EL._recordar = S.controles;
  }

  function entrar(codigo, email, despues) {
    S.codigo = codigo; S.email = email;
    return llamar({ accion: "ver" }).then(function (x) {
      if (!x.j.reserva) {
        bot(function () { return '<p class="gest-err">' + esc(te(x.j.error)) + "</p>"; });
        ses("nc-gest", null);
        pedirLogin(codigo); return false;
      }
      S.r = x.j.reserva;
      ses("nc-gest", JSON.stringify({ codigo: codigo, email: email }));
      if (despues) return despues();
      var nombre = String(S.r.nombre || "").split(" ")[0];
      bot(function () { return "<p>" + esc(nombre ? t("encontrada", { n: nombre }) : t("encontrada0")) + "</p>" + resumen(); });
      menu();
      return true;
    });
  }

  function menu() {
    var r = S.r;
    if (r.cancelada) {
      bot(function () { return "<p>" + esc(t("yaCancelada")) + "</p>"; });
      return controles(function () { return '<div class="gest-ops">' + opcion("oRecibos", "recibos") + opcion("oContacto", "contacto") + opcion("oNueva", "nueva") + opcion("oOtra", "salir") + "</div>"; });
    }
    if (r.pendienteCambio) {
      bot(function () { return "<p>" + esc(t("enCurso")) + "</p>"; });
      return controles(function () { return '<div class="gest-ops">' + opcion("actualizar", "refrescar", "btn-accent") + opcion("oContacto", "contacto") + "</div>"; });
    }
    if (r.empezada) {
      bot(function () { return "<p>" + esc(t("yaEmpezada")) + "</p>"; });
      return controles(function () { return '<div class="gest-ops">' + opcion("oInfo", "info") + opcion("oDatos", "datos") + opcion("oRecibos", "recibos") + opcion("oContacto", "contacto") + opcion("oSalir", "salir") + "</div>"; });
    }
    bot(function () { return "<p>" + esc(t("queHacer")) + "</p>"; });
    controles(function () {
      return '<div class="gest-ops">' + opcion("oFechas", "fechas") + opcion("oHuesp", "huespedes") + opcion("oDatos", "datos") + opcion("oInfo", "info") +
        opcion("oRecibos", "recibos") + opcion("oContacto", "contacto") + opcion("oCancel", "cancelar", "btn-outline is-danger") + opcion("oSalir", "salir") + "</div>";
    });
  }

  function errorYMenu(x) {
    bot(function () { return '<p class="gest-err">' + esc(te(x.j.error, x.j.dato)) + "</p>"; });
    if (x.j.reserva) S.r = x.j.reserva;
    controles(function () { return '<div class="gest-ops">' + opcion("oMenu", "menu") + opcion("oContacto", "contacto") + "</div>"; });
  }

  /* Cancelar */
  function cancelarPaso() {
    yo("oCancel");
    llamar({ accion: "ver_cancelacion" }).then(function (x) {
      if (!x.j.cancelacion) return errorYMenu(x);
      var v = x.j.cancelacion; S.r = x.j.reserva;
      bot(function () {
        var txt = v.reembolso > 0 ? t("cancelSi", { x: euros(v.reembolso) }) : (S.r.noReembolsable ? t("cancelNoR") : t("cancelNo", { d: S.r.diasCancelacion }));
        return "<p>" + esc(txt) + "</p><p><strong>" + esc(t("cancelSeguro")) + "</strong></p>";
      });
      controles(function () { return '<div class="gest-ops">' + opcion("cancelConfirmar", "cancelar_si", "btn-accent is-danger-solid") + opcion("cancelNoQuiero", "menu") + "</div>"; });
    });
  }
  function cancelarConfirmado() {
    yo("cancelConfirmar");
    llamar({ accion: "cancelar" }).then(function (x) {
      if (!x.j.ok) return errorYMenu(x);
      S.r = x.j.reserva;
      var reemb = x.j.reembolso;
      bot(function () { return "<p>" + esc(t("cancelHecha")) + "</p><p>" + esc(reemb > 0 ? t("cancelReembolso", { x: euros(reemb) }) : t("cancelSinReemb")) + "</p>" + resumen(); });
      controles(function () { return '<div class="gest-ops">' + opcion("oRecibos", "recibos") + opcion("oContacto", "contacto") + opcion("oNueva", "nueva") + opcion("oSalir", "salir") + "</div>"; });
    });
  }

  /* Cambiar fechas / huéspedes */
  function fechasPaso(sinEco) {
    if (!sinEco) yo("oFechas");
    bot(function () { return "<p>" + esc(t("fechasPide")) + "</p>"; });
    var min = addDays(hoy(), 1), max = addDays(hoy(), 365 + 365);
    controles(function () {
      var e = S.cambio ? S.cambio.entrada : S.r.entrada, s = S.cambio ? S.cambio.salida : S.r.salida;
      return '<form class="gest-form gest-form-2" id="gest-fechas" novalidate>' +
        '<label><span>' + esc(t("entrada")) + '</span><input type="date" name="entrada" required min="' + min + '" max="' + max + '" value="' + esc(e) + '"></label>' +
        '<label><span>' + esc(t("salida")) + '</span><input type="date" name="salida" required min="' + addDays(min, 1) + '" max="' + max + '" value="' + esc(s) + '"></label>' +
        '<div class="gest-ops gest-full"><button type="submit" class="btn btn-accent">' + esc(t("verPrecio")) + "</button>" + opcion("oMenu", "menu") + "</div></form>";
    });
  }
  function huespedesPaso() {
    yo("oHuesp");
    bot(function () { return "<p>" + esc(t("huespPide", { n: S.r.capacidad })) + "</p>"; });
    controles(function () {
      var o = "";
      for (var i = 1; i <= (S.r.capacidad || 4); i++) o += '<button type="button" class="btn ' + (i === S.r.huespedes ? "btn-sea" : "btn-outline") + '" data-a="h" data-n="' + i + '">' + esc(t("huespN", { n: i })) + "</button>";
      return '<div class="gest-ops">' + o + opcion("oMenu", "menu") + "</div>";
    });
  }
  function cotizar(datos) {
    var pedido = { entrada: datos.entrada || S.r.entrada, salida: datos.salida || S.r.salida, huespedes: datos.huespedes || S.r.huespedes };
    S.ultimoPedido = pedido;
    llamar(Object.assign({ accion: "cotizar" }, pedido)).then(function (x) {
      if (!x.j.cambio) {
        bot(function () { return '<p class="gest-err">' + esc(te(x.j.error, x.j.dato)) + "</p>"; });
        return controles(function () { return '<div class="gest-ops">' + opcion("otrasFechas", "fechas_otra", "btn-accent") + opcion("oMenu", "menu") + "</div>"; });
      }
      mostrarCambio(x.j.cambio);
    });
  }
  function mostrarCambio(c) {
    S.cambio = c;
    bot(function () {
      var res = c.accion === "pagar" ? t("aPagar", { x: euros(c.importe) }) : c.accion === "devolver" ? t("aDevolver", { x: euros(c.importe) }) :
        c.accion === "sin_devolucion" ? t("sinDevol", { d: S.r.diasCancelacion }) : t("igual");
      return "<p>" + esc(t("nuevo")) + '</p><div class="gest-card"><dl>' +
        "<div><dt>" + esc(t("fechas")) + "</dt><dd>" + esc(fecha(c.entrada)) + " → " + esc(fecha(c.salida)) + " · " + esc(noches(c.noches)) + "</dd></div>" +
        "<div><dt>" + esc(t("huespedes")) + "</dt><dd>" + c.huespedes + "</dd></div>" +
        "<div><dt>" + esc(t("nuevoTotal")) + "</dt><dd>" + euros(c.nuevoTotal) + "</dd></div>" +
        "<div><dt>" + esc(t("yaPagado")) + "</dt><dd>" + euros(S.r.neto) + "</dd></div>" +
        "</dl></div><p><strong>" + esc(res) + "</strong></p>" +
        (c.quedaNoReembolsable && !S.r.noReembolsable ? '<p class="gest-warn">' + esc(t("quedaNoR", { d: S.r.diasCancelacion })) + "</p>" : "");
    });
    controles(function () {
      var conf = c.accion === "pagar" ? t("pagarDif", { x: euros(c.importe) }) : t("confirmar");
      return '<div class="gest-ops"><button type="button" class="btn btn-accent" data-a="cambiar_si">' + esc(conf) + "</button>" + opcion("otrasFechas", "fechas_otra") + opcion("oMenu", "menu") + "</div>";
    });
  }
  function cambiarConfirmado() {
    var c = S.cambio; if (!c) return menu();
    S.log.push({ de: "yo", f: function () { return esc(c.accion === "pagar" ? t("pagarDif", { x: euros(c.importe) }) : t("confirmar")); } });
    llamar({ accion: "cambiar", entrada: c.entrada, salida: c.salida, huespedes: c.huespedes, importe: c.importe }).then(function (x) {
      if (x.status === 409 && x.j.error === "precio_cambiado" && x.j.dato) {
        bot(function () { return "<p>" + esc(te("precio_cambiado")) + "</p>"; });
        return mostrarCambio(x.j.dato);
      }
      if (x.j.pagar && x.j.url) {
        ses("nc-gest-esperado", JSON.stringify({ entrada: c.entrada, salida: c.salida, huespedes: c.huespedes }));
        bot(function () { return "<p>" + esc(t("llevando")) + "</p>"; }); controles(null);
        location.href = x.j.url; return;
      }
      if (!x.j.ok) return errorYMenu(x);
      S.r = x.j.reserva; S.cambio = null;
      bot(function () { return "<p>" + esc(t("cambioHecho")) + "</p>" + (x.j.reembolso > 0 ? "<p>" + esc(t("cancelReembolso", { x: euros(x.j.reembolso) })) + "</p>" : "") + resumen(); });
      menu();
    });
  }

  /* Vuelta de la pasarela tras pagar una diferencia: esperamos a que el webhook aplique el cambio */
  function esperarCambio(intento) {
    var esperado = null; try { esperado = JSON.parse(ses("nc-gest-esperado") || "null"); } catch (e) {}
    llamar({ accion: "ver" }).then(function (x) {
      if (x.j.reserva) S.r = x.j.reserva;
      var r = S.r;
      var hecho = r && esperado && r.entrada === esperado.entrada && r.salida === esperado.salida && r.huespedes === esperado.huespedes;
      if (hecho) {
        ses("nc-gest-esperado", null);
        bot(function () { return "<p>" + esc(t("cambioHecho")) + "</p>" + resumen(); });
        return menu();
      }
      if (r && r.ultimoSuplemento === "fallido") {
        ses("nc-gest-esperado", null);
        bot(function () { return '<p class="gest-err">' + esc(t("pagoFallido")) + "</p>" + resumen(); });
        return menu();
      }
      if (intento >= 20) {
        bot(function () { return '<p class="gest-warn">' + esc(t("pagoTarda")) + "</p>" + resumen(); });
        return controles(function () { return '<div class="gest-ops">' + opcion("actualizar", "refrescar", "btn-accent") + opcion("oContacto", "contacto") + "</div>"; });
      }
      S.ocupado = true; render();
      setTimeout(function () { esperarCambio(intento + 1); }, 3000);
    });
  }

  /* Datos */
  function datosPaso() {
    yo("oDatos");
    bot(function () { return "<p>" + esc(t("datosPide")) + "</p>"; });
    controles(function () {
      var o = '<option value="">' + esc(t("sinHora")) + "</option>";
      for (var h = 0; h < 24; h++) {
        var f = (h < 10 ? "0" : "") + h + ":00–" + ((h + 1) % 24 < 10 ? "0" : "") + ((h + 1) % 24) + ":00";
        o += "<option" + (f === S.r.hora ? " selected" : "") + ">" + f + "</option>";
      }
      return '<form class="gest-form gest-form-2" id="gest-datos" novalidate>' +
        '<label><span>' + esc(t("llegada")) + '</span><select name="hora">' + o + "</select></label>" +
        '<label><span>' + esc(t("tel")) + '</span><input type="tel" name="telefono" autocomplete="tel" maxlength="30" value="' + esc(S.r.telefono) + '"></label>' +
        '<div class="gest-ops gest-full"><button type="submit" class="btn btn-accent">' + esc(t("guardar")) + "</button>" + opcion("oMenu", "menu") + "</div></form>";
    });
  }

  function infoPaso() {
    yo("oInfo");
    var c = casaDe(S.r.casa) || {};
    var dir = CFG.address || "";
    bot(function () {
      return "<p>" + esc(t("info1", { a: dir })) + "</p><p>" + esc(t("info2", { i: c.checkin || "16:00", o: c.checkout || "11:00" })) + "</p><p>" + esc(t("info3")) + "</p><p>" + esc(t("info4")) + "</p>" +
        (CFG.lat ? '<p><a class="btn btn-sea btn-sm" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=' + CFG.lat + "," + CFG.lng + '">' + esc(t("mapa")) + "</a></p>" : "");
    });
    controles(botonesMenu);
  }

  function recibosPaso() {
    yo("oRecibos");
    var rec = S.r.recibos || [];
    bot(function () {
      if (!rec.length) return "<p>" + esc(t("sinRecibos")) + "</p>";
      return "<p>" + esc(t("recibos")) + '</p><ul class="gest-list">' + rec.map(function (x) {
        return '<li><a href="' + esc(x.url) + '" target="_blank" rel="noopener">' + esc(t("recibo", { f: fecha(x.fecha), x: euros(x.importe) })) + "</a></li>";
      }).join("") + "</ul>";
    });
    controles(botonesMenu);
  }

  function contactoPaso() {
    yo("oContacto");
    var r = S.r;
    var texto = t("waTexto", { c: r.codigo, n: r.casa, f: r.entrada + " → " + r.salida });
    bot(function () {
      var b = "";
      if (CFG.whatsapp) b += '<a class="btn btn-accent btn-sm" target="_blank" rel="noopener" href="https://wa.me/' + esc(String(CFG.whatsapp).replace(/\D/g, "")) + "?text=" + encodeURIComponent(texto) + '">' + esc(t("wa")) + "</a>";
      if (CFG.email) b += '<a class="btn btn-sea btn-sm" href="mailto:' + esc(CFG.email) + "?subject=" + encodeURIComponent(r.codigo) + "&body=" + encodeURIComponent(texto) + '">' + esc(t("mail")) + "</a>";
      if (CFG.telefono) b += '<a class="btn btn-outline btn-sm" href="tel:' + esc(String(CFG.telefono).replace(/[^\d+]/g, "")) + '">' + esc(t("llamar")) + " · " + esc(CFG.telefono) + "</a>";
      return "<p>" + esc(t("contacto")) + '</p><div class="gest-links">' + b + "</div>";
    });
    controles(botonesMenu);
  }

  function salir() {
    yo(S.r && S.r.cancelada ? "oOtra" : "oSalir");
    bot(function () { return "<p>" + esc(t("adios")) + "</p>"; });
    ses("nc-gest", null); S.codigo = ""; S.email = ""; S.r = null; S.cambio = null;
    controles(function () { return '<div class="gest-ops">' + opcion("oOtra", "reiniciar", "btn-accent") + opcion("oNueva", "nueva") + "</div>"; });
  }

  /* ---------- Eventos ---------- */
  function onClick(e) {
    var b = e.target.closest("[data-a]"); if (!b || S.ocupado) return;
    var a = b.getAttribute("data-a");
    if (a === "menu") { yo("oMenu"); S.cambio = null; menu(); }
    else if (a === "cancelar") cancelarPaso();
    else if (a === "cancelar_si") cancelarConfirmado();
    else if (a === "fechas") { S.cambio = null; fechasPaso(); }
    else if (a === "fechas_otra") { yo("otrasFechas"); fechasPaso(true); }
    else if (a === "huespedes") huespedesPaso();
    else if (a === "h") { var n = Number(b.getAttribute("data-n")); S.log.push({ de: "yo", f: function () { return esc(t("huespN", { n: n })); } }); cotizar({ huespedes: n }); }
    else if (a === "cambiar_si") cambiarConfirmado();
    else if (a === "datos") datosPaso();
    else if (a === "info") infoPaso();
    else if (a === "recibos") recibosPaso();
    else if (a === "contacto") contactoPaso();
    else if (a === "salir") salir();
    else if (a === "reiniciar") inicio();
    else if (a === "sin_codigo") sinCodigoPaso();
    else if (a === "login") { yo("volverLogin"); pedirLogin(); }
    else if (a === "nueva") { location.href = "index.html#apartamentos"; }
    else if (a === "refrescar") { yo("actualizar"); esperarCambio(19); }
  }
  function onSubmit(e) {
    var f = e.target; if (!f.closest || !f.closest("#gest") || S.ocupado) return;
    e.preventDefault();
    if (f.id === "gest-login") {
      var codigo = f.codigo.value.trim(), email = f.email.value.trim();
      if (!codigo || !email) { bot(function () { return '<p class="gest-err">' + esc(te("faltan")) + "</p>"; }); return render(); }
      S.log.push({ de: "yo", f: function () { return esc(codigo.toUpperCase()) + "<br>" + esc(email); } });
      entrar(codigo, email);
    } else if (f.id === "gest-recordar") {
      var em = f.email.value.trim();
      if (!em) { bot(function () { return '<p class="gest-err">' + esc(te("email")) + "</p>"; }); return render(); }
      S.email = em;
      S.log.push({ de: "yo", f: function () { return esc(em); } });
      llamar({ accion: "recordar", email: em, idioma: lang }).then(function (x) {
        if (!x.j.ok) { bot(function () { return '<p class="gest-err">' + esc(te(x.j.error)) + "</p>"; }); return sinCodigoPasoSinEco(); }
        bot(function () { return "<p>" + esc(t("codigoEnviado")) + "</p>"; });
        pedirLogin();
      });
    } else if (f.id === "gest-fechas") {
      var en = f.entrada.value, sa = f.salida.value;
      S.log.push({ de: "yo", f: function () { return esc(fecha(en)) + " → " + esc(fecha(sa)); } });
      cotizar({ entrada: en, salida: sa });
    } else if (f.id === "gest-datos") {
      var hora = f.hora.value, tel = f.telefono.value;
      S.log.push({ de: "yo", f: function () { return esc(hora || t("sinHora")) + " · " + esc(tel); } });
      llamar({ accion: "datos", hora: hora, telefono: tel }).then(function (x) {
        if (!x.j.ok) return errorYMenu(x);
        S.r = x.j.reserva;
        bot(function () { return "<p>" + esc(t("datosHecho")) + "</p>"; });
        menu();
      });
    }
  }

  function init() {
    EL.root = document.getElementById("gest"); if (!EL.root) return;
    EL.chat = document.getElementById("gest-chat"); EL.ctl = document.getElementById("gest-ctl");
    EL.h1 = document.getElementById("gest-h1"); EL.sub = document.getElementById("gest-sub");
    EL.root.addEventListener("click", onClick);
    EL.root.addEventListener("submit", onSubmit);
    document.addEventListener("nc:lang", function (e) { lang = e.detail === "en" ? "en" : "es"; render(); });

    var q = location.search;
    var c = (/[?&]c=([A-Za-z0-9-]+)/.exec(q) || [])[1] || "";
    var pago = (/[?&]pago=(cs_[A-Za-z0-9_]+)/.exec(q) || [])[1];
    var guardado = null; try { guardado = JSON.parse(ses("nc-gest") || "null"); } catch (e) {}
    if (guardado && (!c || guardado.codigo.replace(/[^A-Za-z0-9]/g, "").toUpperCase() === c.replace(/[^A-Za-z0-9]/g, "").toUpperCase())) {
      S.codigo = guardado.codigo; S.email = guardado.email;
      if (pago) {
        bot(function () { return "<p>" + esc(t("volviPago")) + "</p>"; });
        render();
        entrar(S.codigo, S.email, function () { esperarCambio(0); });
      } else {
        if (ses("nc-gest-esperado")) { ses("nc-gest-esperado", null); bot(function () { return "<p>" + esc(t("pagoCancelado")) + "</p>"; }); }
        bot(function () { return "<p>" + esc(t("buscando")) + "</p>"; });
        render();
        entrar(S.codigo, S.email);
      }
    } else {
      inicio(c);
    }
    try { history.replaceState(null, "", location.pathname + (c ? "?c=" + encodeURIComponent(c) : "")); } catch (e) {}
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
