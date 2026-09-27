/* Aparthotel Cabanyal — contenido del barrio (lugares recomendados e historia).
   LUGARES: para añadir una colaboración, rellena "oferta" (p. ej. "10 % para huéspedes de Aparthotel Cabanyal")
   y aparecerá destacada. "q" es lo que se busca en Google Maps. */

window.NC_LUGARES = [
  /* ---------- Comer y beber ---------- */
  { tipo: "comer", nombre: "Casa Montaña", dir: "Carrer de Josep Benlliure, 69",
    es: "Bodega histórica fundada en 1836. Más de mil vinos y tapas clásicas: anchoas, alcachofas de temporada, brandada de bacalao.",
    en: "Historic bodega founded in 1836. Over a thousand wines and classic tapas: anchovies, seasonal artichokes, salt-cod brandade.",
    q: "Casa Montaña Josep Benlliure 69 Valencia", oferta: "" },
  { tipo: "comer", nombre: "Casa Guillermo", dir: "Carrer del Progrés, 15",
    es: "Negocio familiar de toda la vida, famoso por sus anchoas del Cantábrico seleccionadas a mano.",
    en: "Long-running family bar, famous for its hand-picked Cantabrian anchovies.",
    q: "Casa Guillermo Progrés 15 Valencia", oferta: "" },
  { tipo: "comer", nombre: "Anyora", dir: "Carrer de Vicent Gallart, 15",
    es: "Bodega de «menjars de sempre»: recetas de la abuela con producto local y vinos naturales.",
    en: "A bodega of “old-time food”: grandma’s recipes with local produce and natural wines.",
    q: "Anyora Vicent Gallart 15 Valencia", oferta: "" },
  { tipo: "comer", nombre: "Bodega Aldeana 1927", dir: "Carrer de Josep Benlliure, 258",
    es: "Almuerzos valencianos (esmorzaret) y recetas del Cabanyal: sepionet, coca de dacsa y arroces.",
    en: "Valencian mid-morning “esmorzaret” and Cabanyal recipes: baby cuttlefish, corn flatbread and rice dishes.",
    q: "Bodega Aldeana 1927 Valencia", oferta: "" },
  { tipo: "comer", nombre: "La Paca", dir: "Carrer del Rosari, 30",
    es: "Ambiente bohemio y terraza al sol. Vermú casero y tortillas de todo tipo.",
    en: "Bohemian vibe and a sunny terrace. Home-made vermouth and all kinds of tortillas.",
    q: "La Paca Carrer del Rosari 30 Valencia", oferta: "" },
  { tipo: "comer", nombre: "La Pepica", dir: "Passeig de Neptú, 6",
    es: "Frente al mar desde 1898: el clásico de la paella en la playa, por donde pasó Hemingway.",
    en: "On the seafront since 1898: the classic beach paella house, once frequented by Hemingway.",
    q: "La Pepica Passeig de Neptú 6 Valencia", oferta: "" },
  { tipo: "comer", nombre: "Casa Carmela", dir: "Carrer d'Isabel de Villena, 155",
    es: "Más de cien años cocinando paella a leña de naranjo, en la Malvarrosa.",
    en: "Over a hundred years cooking paella over orange-wood fire, in La Malvarrosa.",
    q: "Casa Carmela Isabel de Villena 155 Valencia", oferta: "" },

  /* ---------- Ver y hacer ---------- */
  { tipo: "ver", nombre: "Mercat del Cabanyal", dir: "Carrer de Martí Grajales, 4",
    es: "El mercado del barrio: más de 150 puestos con pescado del día y producto fresco.",
    en: "The neighbourhood market: over 150 stalls with fresh fish and local produce.",
    q: "Mercat del Cabanyal Martí Grajales 4 Valencia", oferta: "" },
  { tipo: "ver", nombre: "Museo de la Semana Santa Marinera", dir: "Carrer del Rosari, 1",
    es: "En un antiguo molino de arroz: esculturas, trajes y la historia de la Semana Santa del Marítimo. Entrada gratuita.",
    en: "In a former rice mill: sculptures, costumes and the story of the seaside Holy Week. Free entry.",
    q: "Museo Semana Santa Marinera Rosari 1 Valencia", oferta: "" },
  { tipo: "ver", nombre: "Teatre El Musical", dir: "Plaça del Rosari, 3",
    es: "Teatro municipal con programación de artes escénicas y música, en la plaza más bonita del barrio.",
    en: "Municipal theatre for performing arts and music, on the neighbourhood’s prettiest square.",
    q: "Teatre El Musical Valencia", oferta: "" },
  { tipo: "ver", nombre: "Fábrica de Hielo", dir: "",
    es: "Antigua fábrica de hielo convertida en espacio cultural: conciertos, mercadillos y eventos.",
    en: "A former ice factory turned cultural venue: concerts, markets and events.",
    q: "Fábrica de Hielo Cabanyal Valencia", oferta: "" },
  { tipo: "ver", nombre: "Playa de Las Arenas y paseo marítimo", dir: "",
    es: "A unos 500 metros. El paseo de palmeras enlaza con la Malvarrosa: ideal para correr, ir en bici o ver el atardecer.",
    en: "About 500 metres away. The palm-lined promenade runs to La Malvarrosa: perfect for a run, a bike ride or the sunset.",
    q: "Playa de Las Arenas Valencia", oferta: "" },
  { tipo: "ver", nombre: "La Marina de València", dir: "",
    es: "El antiguo puerto, con el edificio Veles e Vents, paseos junto a los barcos y terrazas para el final del día.",
    en: "The old harbour, with the Veles e Vents building, waterside walks and terraces for sundowners.",
    q: "La Marina de València Veles e Vents", oferta: "" }
];

window.NC_HISTORIA = {
  es: {
    intro: "El Cabanyal nació como un poblado de pescadores sobre la arena, frente al mar. Su nombre viene de las «cabanyes», las barracas de paja y madera en las que vivían las familias que faenaban en la playa.",
    hitos: [
      ["Siglo XVII", "Las barracas de pescadores ocupan la franja de arena entre las acequias que después darán nombre a los barrios: el Canyamelar, el Cabanyal y el Cap de França."],
      ["1796", "Un gran incendio arrasa casi todo el poblado. Se reconstruye con calles alineadas y paralelas al mar, la trama en cuadrícula que todavía hoy recorres."],
      ["1837", "Los tres barrios se constituyen como municipio independiente: el Poble Nou de la Mar. A lo largo del siglo XIX se convierte también en lugar de veraneo para las familias acomodadas de Valencia."],
      ["1875", "Otro incendio calcina muchas barracas y una normativa municipal prohíbe reconstruirlas con techo de paja. Nacen las casas de obra de una o dos alturas."],
      ["1897", "El Poble Nou de la Mar se anexiona a la ciudad de Valencia."],
      ["Principios del s. XX", "Florece el modernismo popular: fachadas cubiertas de azulejos de colores, balcones de forja y molduras. Es la imagen que hoy hace único al barrio."],
      ["1993", "El núcleo histórico es declarado Bien de Interés Cultural."],
      ["1998", "Se aprueba prolongar la avenida de Blasco Ibáñez hasta el mar, lo que supondría derribar 1.651 viviendas. Los vecinos crean la plataforma Salvem el Cabanyal."],
      ["2009", "El Ministerio de Cultura declara el plan un expolio del patrimonio."],
      ["2015", "El nuevo gobierno municipal deroga el plan y el barrio comienza una etapa de rehabilitación que continúa hoy."]
    ],
    cierre: "Además de su arquitectura, el Cabanyal conserva tradiciones propias como la Semana Santa Marinera, con raíces medievales, y una vida de barrio que se vive en el mercado, las bodegas y la calle."
  },
  en: {
    intro: "El Cabanyal was born as a fishermen’s village on the sand, facing the sea. Its name comes from the “cabanyes”, the straw-and-timber huts where the families working the beach lived.",
    hitos: [
      ["17th century", "Fishermen’s huts spread along the sand between the irrigation channels that would later name the districts: Canyamelar, Cabanyal and Cap de França."],
      ["1796", "A huge fire destroys almost the entire village. It is rebuilt with straight streets running parallel to the sea: the grid you still walk today."],
      ["1837", "The three districts become an independent town, the Poble Nou de la Mar. Throughout the 19th century it also becomes a summer retreat for well-off Valencian families."],
      ["1875", "Another fire burns many huts, and a municipal bylaw bans rebuilding them with straw roofs. Brick houses of one or two storeys appear."],
      ["1897", "The Poble Nou de la Mar is annexed to the city of Valencia."],
      ["Early 20th century", "Popular modernism flourishes: façades covered in colourful tiles, wrought-iron balconies and mouldings — the look that makes the area unique today."],
      ["1993", "The historic core is declared a Site of Cultural Interest (BIC)."],
      ["1998", "A plan is approved to extend Avenida de Blasco Ibáñez to the sea, which would have demolished 1,651 homes. Residents form the Salvem el Cabanyal platform."],
      ["2009", "Spain’s Ministry of Culture declares the plan a plundering of heritage."],
      ["2015", "The new city government repeals the plan and the neighbourhood enters a period of renewal that continues today."]
    ],
    cierre: "Beyond its architecture, El Cabanyal keeps its own traditions, such as the seaside Holy Week (Semana Santa Marinera) with medieval roots, and a neighbourhood life lived in the market, the bodegas and the street."
  }
};
