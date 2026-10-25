import "server-only";

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

export async function getClients(): Promise<Client[]> {
  return wall;
}

export async function getTestimonials(): Promise<Testimonial[]> {
  return testimonials;
}
