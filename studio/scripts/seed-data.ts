// Content for the one-off seed (seed.ts). The values are copied verbatim from the typed
// typed fallbacks the site used before Sanity (removed in Step 3:
// web/src/lib/settings-fallback.ts and content-fallback.ts); those files import `server-only`, so they cannot be
// imported here. Spanish is the approved copy. EN/UK are the drafts the fallbacks already
// carry (testimonials) or plain place names and labels derived from them (marked "draft").
// Nothing here is invented: no SEO texts, prices, stats or clients beyond the fallbacks.

export type Localized = { es: string; en: string; uk: string };

export const SETTINGS = {
  phone: "+34 672 463 000",
  whatsapp: "+34 672 463 000",
  email: "fotmark.es@gmail.com",
  instagram: "@fotmark.es",
  founder: "Illia Lutsak",
  // Service-area business, no street address shown (Q-04): the places Illia works in.
  areaServed: [
    "Málaga",
    "Marbella",
    "Torremolinos",
    "Benalmádena",
    "Fuengirola",
    "Estepona",
    "Benahavís",
    "Costa del Sol",
  ],
  stats: { projects: "40+", years: 2 },
  // EN/UK are drafts of the place names; ES is verbatim.
  location: {
    es: "Málaga · Costa del Sol",
    en: "Málaga · Costa del Sol",
    uk: "Малага · Costa del Sol",
  },
  // One line per row (the footer "Ubicación" column).
  address: {
    es: "Málaga, España\nCosta del Sol",
    en: "Málaga, Spain\nCosta del Sol",
    uk: "Малага, Іспанія\nCosta del Sol",
  },
} satisfies {
  phone: string;
  whatsapp: string;
  email: string;
  instagram: string;
  founder: string;
  areaServed: string[];
  stats: { projects: string; years: number };
  location: Localized;
  address: Localized;
};

// Gallery filters in the prototype's filter order (after "Todos"). ES labels are the approved ones;
// EN/UK match the captions the photo map uses for the same words (drafts for Illia to review).
export const CATEGORIES: Array<{ key: string; label: Localized }> = [
  {
    key: "gastronomia",
    label: { es: "Gastronomía", en: "Food", uk: "Гастрономія" },
  },
  {
    key: "japones",
    label: { es: "Japonés", en: "Japanese", uk: "Японська кухня" },
  },
  { key: "bebidas", label: { es: "Bebidas", en: "Drinks", uk: "Напої" } },
  { key: "eventos", label: { es: "Eventos", en: "Events", uk: "Події" } },
  {
    key: "inmobiliaria",
    label: { es: "Inmobiliaria", en: "Real estate", uk: "Нерухомість" },
  },
  {
    key: "interiores",
    label: { es: "Interiores", en: "Interiors", uk: "Інтер’єри" },
  },
  {
    key: "retratos",
    label: { es: "Retratos", en: "Portraits", uk: "Портрети" },
  },
];

export type ClientSeed = {
  // Document id is `client-${slug}`.
  slug: string;
  name: string;
  // File name inside ../../clients (workspace folder, read-only input).
  logoFile?: string;
  // Expected pixel size of the logo (from the fallback); the seed warns if the file differs.
  logoSize?: { width: number; height: number };
  // Shown under the name when there is no logo.
  tagline?: Localized;
};

// Wall order = prototype order.
export const CLIENTS: ClientSeed[] = [
  {
    slug: "blinkers-brew",
    name: "Blinkers Brew",
    logoFile: "blinkers-brew.webp",
    logoSize: { width: 425, height: 400 },
  },
  {
    slug: "ole-galan",
    name: "Olé Galán",
    logoFile: "ole-galan.webp",
    logoSize: { width: 329, height: 400 },
  },
  {
    slug: "master-art",
    name: "Máster Art",
    logoFile: "master-art.webp",
    logoSize: { width: 535, height: 400 },
  },
  {
    slug: "el-charcon-beach",
    name: "El Charcón Beach",
    logoFile: "el-charcon-beach.webp",
    logoSize: { width: 887, height: 400 },
  },
  {
    slug: "sun-and-moon-events",
    name: "Sun & Moon Events",
    logoFile: "sun-and-moon-events.webp",
    logoSize: { width: 940, height: 400 },
  },
  {
    slug: "dj-levitt",
    name: "DJ Levitt",
    // The fallback has "Artista" (ES). EN/UK reuse the words of the testimonial subtitle.
    tagline: { es: "Artista", en: "Artist", uk: "Артист" },
  },
];

export type TestimonialSeed = {
  // The client's slug; the document id is `testimonial-${clientSlug}`.
  clientSlug: string;
  quote: Localized;
  subtitle: Localized;
};

// Order = prototype order (DJ Levitt is fourth).
export const TESTIMONIALS: TestimonialSeed[] = [
  {
    clientSlug: "blinkers-brew",
    quote: {
      es: "Fotmark entendió nuestra esencia y la convirtió en una imagen visual de calidad. El resultado superó nuestras expectativas.",
      en: "Fotmark understood our essence and turned it into a high-quality visual identity. The result exceeded our expectations.",
      uk: "Fotmark зрозумів нашу сутність і перетворив її на якісний візуальний образ. Результат перевершив наші очікування.",
    },
    subtitle: {
      es: "Cervecería artesanal · Málaga",
      en: "Craft brewery · Málaga",
      uk: "Крафтова броварня · Малага",
    },
  },
  {
    clientSlug: "ole-galan",
    quote: {
      es: "Un trabajo profesional, creativo y cuidado al detalle. Fotmark nos ayudó a mostrar nuestro restaurante de una forma mucho más atractiva.",
      en: "Professional, creative work with great attention to detail. Fotmark helped us present our restaurant in a much more engaging way.",
      uk: "Професійна й креативна робота з увагою до деталей. Fotmark допоміг показати наш ресторан значно привабливіше.",
    },
    subtitle: {
      es: "Restaurante · Torremolinos",
      en: "Restaurant · Torremolinos",
      uk: "Ресторан · Торремолінос",
    },
  },
  {
    clientSlug: "master-art",
    quote: {
      es: "Fotmark consiguió transmitir la calidad de nuestros proyectos a través de imágenes y vídeos profesionales. Estamos muy satisfechos con el resultado.",
      en: "Fotmark communicated the quality of our projects through professional images and videos. We are very happy with the result.",
      uk: "Fotmark передав якість наших проєктів через професійні фото й відео. Ми дуже задоволені результатом.",
    },
    subtitle: {
      es: "Construcción & Interiores · Costa del Sol",
      en: "Construction & Interiors · Costa del Sol",
      uk: "Будівництво та інтер’єри · Costa del Sol",
    },
  },
  {
    clientSlug: "dj-levitt",
    quote: {
      es: "Fotmark entendió perfectamente nuestra visión. El resultado es dinámico, profesional y transmite la energía de cada actuación.",
      en: "Fotmark understood our vision perfectly. The result is dynamic, professional and conveys the energy of every performance.",
      uk: "Fotmark чудово зрозумів наше бачення. Результат динамічний, професійний і передає енергію кожного виступу.",
    },
    subtitle: {
      es: "Artista · Costa del Sol",
      en: "Artist · Costa del Sol",
      uk: "Артист · Costa del Sol",
    },
  },
  {
    clientSlug: "el-charcon-beach",
    quote: {
      es: "Un trabajo cuidado, creativo y profesional. Fotmark consiguió transmitir la esencia y el ambiente de nuestro espacio.",
      en: "Thoughtful, creative and professional work. Fotmark captured the essence and atmosphere of our space.",
      uk: "Уважна, креативна й професійна робота. Fotmark передав характер і атмосферу нашого простору.",
    },
    subtitle: {
      es: "Chiringuito · Beach & Terrace",
      en: "Beach restaurant · Beach & Terrace",
      uk: "Пляжний ресторан · Beach & Terrace",
    },
  },
  {
    clientSlug: "sun-and-moon-events",
    quote: {
      es: "Fotmark capturó la energía y los mejores momentos de nuestros eventos. Un resultado visual que realmente refleja la experiencia.",
      en: "Fotmark captured the energy and best moments of our events. A visual result that truly reflects the experience.",
      uk: "Fotmark зафіксував енергію та найкращі миті наших подій. Візуальний результат справді передає враження.",
    },
    subtitle: {
      es: "Eventos · Costa del Sol",
      en: "Events · Costa del Sol",
      uk: "Події · Costa del Sol",
    },
  },
];

export type ServiceSeed = {
  // The icon: a fixed list in the schema, and the key the site uses to pick the SVG drawing.
  // The document id is `service-${icon}`.
  icon: "fotografia" | "video" | "dron" | "redes" | "publicidad" | "branding";
  name: Localized;
  text: Localized;
  // One `·`-separated string per locale, as in the site's translation files.
  tags: Localized;
};

// Verbatim from web/src/messages/{es,en,uk}.json → servicios.items (the cards move to Sanity,
// Q-21). Order = prototype order.
export const SERVICES: ServiceSeed[] = [
  {
    icon: "fotografia",
    name: {
      es: "Fotografía",
      en: "Photography",
      uk: "Фотографія",
    },
    text: {
      es: "Creamos imágenes profesionales que reflejan la calidad y personalidad de tu negocio.",
      en: "We create professional images that reflect the quality and personality of your business.",
      uk: "Створюємо професійні зображення, що передають якість і характер вашого бізнесу.",
    },
    tags: {
      es: "Gastronomía · Inmobiliaria · Hoteles · Interiores · Productos · Eventos · Marca personal",
      en: "Food · Real estate · Hotels · Interiors · Products · Events · Personal brand",
      uk: "Гастрономія · Нерухомість · Готелі · Інтер’єри · Продукти · Події · Особистий бренд",
    },
  },
  {
    icon: "video",
    name: {
      es: "Vídeo",
      en: "Video",
      uk: "Відео",
    },
    text: {
      es: "Contenido audiovisual diseñado para captar atención y contar la historia de tu marca.",
      en: "Audiovisual content designed to capture attention and tell your brand story.",
      uk: "Аудіовізуальний контент, який привертає увагу та розповідає історію вашого бренду.",
    },
    tags: {
      es: "Reels · Vídeos promocionales · Publicidad · Eventos · Entrevistas · Contenido para redes",
      en: "Reels · Promotional videos · Advertising · Events · Interviews · Social content",
      uk: "Reels · Промовідео · Реклама · Події · Інтерв’ю · Контент для соцмереж",
    },
  },
  {
    icon: "dron",
    name: {
      es: "Dron",
      en: "Drone",
      uk: "Дрон",
    },
    text: {
      es: "Una perspectiva diferente para mostrar espacios, proyectos y experiencias.",
      en: "A different perspective for showcasing spaces, projects and experiences.",
      uk: "Інший ракурс для презентації просторів, проєктів і вражень.",
    },
    tags: {
      es: "Inmobiliaria · Hoteles · Villas · Arquitectura · Construcción · Eventos · Negocios",
      en: "Real estate · Hotels · Villas · Architecture · Construction · Events · Business",
      uk: "Нерухомість · Готелі · Вілли · Архітектура · Будівництво · Події · Бізнес",
    },
  },
  {
    icon: "redes",
    name: {
      es: "Redes Sociales",
      en: "Social Media",
      uk: "Соціальні мережі",
    },
    text: {
      es: "Convertimos tu presencia digital en una herramienta real para tu negocio.",
      en: "We turn your digital presence into a practical tool for your business.",
      uk: "Перетворюємо вашу цифрову присутність на дієвий інструмент для бізнесу.",
    },
    tags: {
      es: "Estrategia · Contenido · Reels · Gestión · Optimización · Calendario editorial",
      en: "Strategy · Content · Reels · Management · Optimisation · Content calendar",
      uk: "Стратегія · Контент · Reels · Ведення · Оптимізація · Контент-план",
    },
  },
  {
    icon: "publicidad",
    name: {
      es: "Publicidad",
      en: "Advertising",
      uk: "Реклама",
    },
    text: {
      es: "Llevamos tu marca hasta la audiencia adecuada, en el momento adecuado.",
      en: "We take your brand to the right audience at the right time.",
      uk: "Допомагаємо вашому бренду знайти потрібну аудиторію в потрібний момент.",
    },
    tags: {
      es: "Meta Ads · Instagram · Facebook · Captación · Campañas · Optimización · Análisis",
      en: "Meta Ads · Instagram · Facebook · Lead generation · Campaigns · Optimisation · Analysis",
      uk: "Meta Ads · Instagram · Facebook · Ліди · Кампанії · Оптимізація · Аналітика",
    },
  },
  {
    icon: "branding",
    name: {
      es: "Creatividad & Branding",
      en: "Creative & Branding",
      uk: "Креатив і брендинг",
    },
    text: {
      es: "Construimos una imagen coherente, reconocible y alineada con el nivel de tu negocio.",
      en: "We build a coherent, recognisable image aligned with the quality of your business.",
      uk: "Створюємо цілісний, упізнаваний образ, що відповідає рівню вашого бізнесу.",
    },
    tags: {
      es: "Conceptos creativos · Identidad visual · Campañas · Materiales · Creatividades",
      en: "Creative concepts · Visual identity · Campaigns · Materials · Creative assets",
      uk: "Креативні концепції · Візуальна айдентика · Кампанії · Матеріали · Креативи",
    },
  },
];
