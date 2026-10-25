import "server-only";
import type { Locale } from "@/i18n/routing";

// Clients and testimonials owned by Sanity (`client`, `testimonial`, architecture.md §4).
// Temporary typed stand-in until Step 3 swaps this for `sanityFetch`; keep the shape.
// Text is verbatim from the approved prototype.
//
// Logo files are not in the repo (they go to Sanity), so until Step 3 a logo is only its
// intrinsic size: render an empty box with that aspect ratio in the logo's place.

export type Client = {
  id: string;
  name: string;
  logo: { width: number; height: number } | null;
  // Shown under the name when there is no logo (prototype `.wall .lg.txt small`).
  tagline?: string;
};

export type Testimonial = {
  id: string;
  quote: string;
  client: Client;
  subtitle: string;
};

const clients = {
  blinkers: {
    id: "blinkers-brew",
    name: "Blinkers Brew",
    logo: { width: 425, height: 400 },
  },
  oleGalan: {
    id: "ole-galan",
    name: "Olé Galán",
    logo: { width: 329, height: 400 },
  },
  masterArt: {
    id: "master-art",
    name: "Máster Art",
    logo: { width: 535, height: 400 },
  },
  charcon: {
    id: "el-charcon-beach",
    name: "El Charcón Beach",
    logo: { width: 887, height: 400 },
  },
  sunMoon: {
    id: "sun-and-moon-events",
    name: "Sun & Moon Events",
    logo: { width: 940, height: 400 },
  },
  djLevitt: {
    id: "dj-levitt",
    name: "DJ Levitt",
    logo: null,
    tagline: "Artista",
  },
} satisfies Record<string, Client>;

// Wall order = prototype order.
const wall: Client[] = [
  clients.blinkers,
  clients.oleGalan,
  clients.masterArt,
  clients.charcon,
  clients.sunMoon,
  clients.djLevitt,
];

const testimonials: Testimonial[] = [
  {
    id: "t-blinkers",
    quote:
      "Fotmark entendió nuestra esencia y la convirtió en una imagen visual de calidad. El resultado superó nuestras expectativas.",
    client: clients.blinkers,
    subtitle: "Cervecería artesanal · Málaga",
  },
  {
    id: "t-ole-galan",
    quote:
      "Un trabajo profesional, creativo y cuidado al detalle. Fotmark nos ayudó a mostrar nuestro restaurante de una forma mucho más atractiva.",
    client: clients.oleGalan,
    subtitle: "Restaurante · Torremolinos",
  },
  {
    id: "t-master-art",
    quote:
      "Fotmark consiguió transmitir la calidad de nuestros proyectos a través de imágenes y vídeos profesionales. Estamos muy satisfechos con el resultado.",
    client: clients.masterArt,
    subtitle: "Construcción & Interiores · Costa del Sol",
  },
  {
    id: "t-dj-levitt",
    quote:
      "Fotmark entendió perfectamente nuestra visión. El resultado es dinámico, profesional y transmite la energía de cada actuación.",
    client: clients.djLevitt,
    subtitle: "Artista · Costa del Sol",
  },
  {
    id: "t-charcon",
    quote:
      "Un trabajo cuidado, creativo y profesional. Fotmark consiguió transmitir la esencia y el ambiente de nuestro espacio.",
    client: clients.charcon,
    subtitle: "Chiringuito · Beach & Terrace",
  },
  {
    id: "t-sun-moon",
    quote:
      "Fotmark capturó la energía y los mejores momentos de nuestros eventos. Un resultado visual que realmente refleja la experiencia.",
    client: clients.sunMoon,
    subtitle: "Eventos · Costa del Sol",
  },
];

const translatedTestimonials: Partial<
  Record<Locale, Array<Pick<Testimonial, "quote" | "subtitle">>>
> = {
  en: [
    {
      quote:
        "Fotmark understood our essence and turned it into a high-quality visual identity. The result exceeded our expectations.",
      subtitle: "Craft brewery · Málaga",
    },
    {
      quote:
        "Professional, creative work with great attention to detail. Fotmark helped us present our restaurant in a much more engaging way.",
      subtitle: "Restaurant · Torremolinos",
    },
    {
      quote:
        "Fotmark communicated the quality of our projects through professional images and videos. We are very happy with the result.",
      subtitle: "Construction & Interiors · Costa del Sol",
    },
    {
      quote:
        "Fotmark understood our vision perfectly. The result is dynamic, professional and conveys the energy of every performance.",
      subtitle: "Artist · Costa del Sol",
    },
    {
      quote:
        "Thoughtful, creative and professional work. Fotmark captured the essence and atmosphere of our space.",
      subtitle: "Beach restaurant · Beach & Terrace",
    },
    {
      quote:
        "Fotmark captured the energy and best moments of our events. A visual result that truly reflects the experience.",
      subtitle: "Events · Costa del Sol",
    },
  ],
  uk: [
    {
      quote:
        "Fotmark зрозумів нашу сутність і перетворив її на якісний візуальний образ. Результат перевершив наші очікування.",
      subtitle: "Крафтова броварня · Малага",
    },
    {
      quote:
        "Професійна й креативна робота з увагою до деталей. Fotmark допоміг показати наш ресторан значно привабливіше.",
      subtitle: "Ресторан · Торремолінос",
    },
    {
      quote:
        "Fotmark передав якість наших проєктів через професійні фото й відео. Ми дуже задоволені результатом.",
      subtitle: "Будівництво та інтер’єри · Costa del Sol",
    },
    {
      quote:
        "Fotmark чудово зрозумів наше бачення. Результат динамічний, професійний і передає енергію кожного виступу.",
      subtitle: "Артист · Costa del Sol",
    },
    {
      quote:
        "Уважна, креативна й професійна робота. Fotmark передав характер і атмосферу нашого простору.",
      subtitle: "Пляжний ресторан · Beach & Terrace",
    },
    {
      quote:
        "Fotmark зафіксував енергію та найкращі миті наших подій. Візуальний результат справді передає враження.",
      subtitle: "Події · Costa del Sol",
    },
  ],
};

export async function getClients(): Promise<Client[]> {
  return wall;
}

export async function getTestimonials(
  locale: Locale = "es",
): Promise<Testimonial[]> {
  const copy = translatedTestimonials[locale];
  if (!copy) return testimonials;
  return testimonials.map((testimonial, index) => ({
    ...testimonial,
    ...copy[index],
  }));
}
