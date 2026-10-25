// The shapes the data-access functions in fetch.ts return. Kept apart from fetch.ts (which is
// `server-only` and talks to Sanity) so client components and Vitest can import them: type
// imports are erased, and `SERVICE_KEYS` is a plain constant.

export type Settings = {
  location: string;
  // Footer "Ubicación" column, one entry per line.
  address: string[];
  // Places served (service-area business, no street address; Q-04).
  areaServed: string[];
  phone: string;
  whatsapp: string;
  email: string;
  instagram: string;
  founder: string;
  stats: { projects: string; years: number };
};

export type Client = {
  id: string;
  name: string;
  logo: { width: number; height: number; url: string } | null;
  // Shown under the name when there is no logo (prototype `.wall .lg.txt small`).
  tagline?: string;
};

export type Testimonial = {
  id: string;
  quote: string;
  client: Client;
  subtitle: string;
};

export type Category = { key: string; label: string };

// The six cards of the «Servicios» section. The icon drawings are SVG components in code.
export const SERVICE_KEYS = [
  "fotografia",
  "video",
  "dron",
  "redes",
  "publicidad",
  "branding",
] as const;
export type ServiceKey = (typeof SERVICE_KEYS)[number];

export type Service = {
  // The Studio «Icono» value: picks the SVG and is unique per service.
  key: ServiceKey;
  name: string;
  text: string;
  // One string, parts separated by « · » (split it on "·" like the translation files).
  tags: string;
};

export type PortfolioItem = {
  id: string;
  // A `Category.key`.
  category: string;
  caption: string;
  alt: string;
  // Width / height of the displayed (cropped) image.
  aspectRatio: number;
  image: { url: string; width: number; height: number };
};
