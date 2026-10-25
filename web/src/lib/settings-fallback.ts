// Facts owned by the Sanity `settings` document (architecture.md §4).
// Temporary typed stand-in until Step 3 swaps this for `sanityFetch`; keep the shape.
// Values are verbatim from the approved prototype.

export type Settings = {
  location: string;
  email: string;
  instagram: string;
  stats: { projects: string; years: number };
};

const fallback: Settings = {
  location: "Málaga · Costa del Sol",
  email: "fotmark.es@gmail.com",
  instagram: "@fotmark.es",
  stats: { projects: "40+", years: 2 },
};

export async function getSettings(): Promise<Settings> {
  return fallback;
}
