import "server-only";

// Facts owned by the Sanity `settings` document (architecture.md §4).
// Temporary typed stand-in until Step 3 swaps this for `sanityFetch`; keep the shape.
// Values are verbatim from the approved prototype.

export type Settings = {
  location: string;
  // Footer "Ubicación" column, one entry per line.
  address: string[];
  phone: string;
  whatsapp: string;
  email: string;
  instagram: string;
  founder: string;
  stats: { projects: string; years: number };
};

const fallback: Settings = {
  location: "Málaga · Costa del Sol",
  address: ["Málaga, España", "Costa del Sol"],
  phone: "+34 611 280 574",
  whatsapp: "+34 611 280 574",
  email: "fotmark.es@gmail.com",
  instagram: "@fotmark.es",
  founder: "Illia Lutsak",
  stats: { projects: "40+", years: 2 },
};

export async function getSettings(): Promise<Settings> {
  return fallback;
}
