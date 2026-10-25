import type { GalleryCategory, GalleryPhoto } from "@/features/gallery/types";

// The approved prototype's 41 cells, in order, with the aspect ratios its own `layout()` used
// (.agents/reference/prototype.html). gallery-layout.test.ts compares `layoutColumns()` with
// what the prototype produced for exactly these cells, so the ratios stay the prototype's.
// (The Sanity photo 04 is a crop, ratio 0.7054 instead of 0.7064: the test data keeps 0.7064.)
//
// id = the prototype's file stem (a stable test id; Sanity uses `portfolio-NN`).

const PHOTOS: [id: string, category: string, aspectRatio: number][] = [
  ["01-gastronomia", "gastronomia", 1.5005],
  ["02-eventos", "eventos", 0.6664],
  ["03-japones", "japones", 1.5021],
  ["04-bebidas", "bebidas", 0.7064],
  ["05-interiores", "interiores", 0.6664],
  ["06-japones", "japones", 0.6657],
  ["07-bebidas", "bebidas", 0.6664],
  ["08-inmobiliaria", "inmobiliaria", 1.5005],
  ["09-gastronomia", "gastronomia", 0.6664],
  ["10-japones", "japones", 0.9336],
  ["11-bebidas", "bebidas", 0.6664],
  ["12-retratos", "retratos", 0.6664],
  ["13-eventos", "eventos", 0.6664],
  ["14-interiores", "interiores", 1.5005],
  ["15-gastronomia", "gastronomia", 0.6664],
  ["16-bebidas", "bebidas", 0.6664],
  ["17-retratos", "retratos", 0.6664],
  ["18-eventos", "eventos", 0.6664],
  ["19-inmobiliaria", "inmobiliaria", 1.5005],
  ["20-gastronomia", "gastronomia", 1.5005],
  ["21-japones", "japones", 0.6657],
  ["22-bebidas", "bebidas", 0.6664],
  ["23-eventos", "eventos", 1.5005],
  ["24-inmobiliaria", "inmobiliaria", 1.5005],
  ["25-gastronomia", "gastronomia", 0.6664],
  ["26-bebidas", "bebidas", 0.6664],
  ["27-interiores", "interiores", 0.6664],
  ["28-eventos", "eventos", 0.6664],
  ["29-gastronomia", "gastronomia", 0.6664],
  ["30-bebidas", "bebidas", 1.4],
  ["31-eventos", "eventos", 0.6664],
  ["32-gastronomia", "gastronomia", 0.6657],
  ["33-bebidas", "bebidas", 0.6664],
  ["34-retratos", "retratos", 0.6664],
  ["35-eventos", "eventos", 0.8107],
  ["36-japones", "japones", 1.5021],
  ["37-bebidas", "bebidas", 0.6664],
  ["38-eventos", "eventos", 0.6664],
  ["39-bebidas", "bebidas", 0.6493],
  ["40-inmobiliaria", "inmobiliaria", 1.5005],
  ["41-bebidas", "bebidas", 1.5005],
];

export const fixtureItems: GalleryPhoto[] = PHOTOS.map(
  ([id, category, aspectRatio]) => ({
    id,
    category,
    caption: id,
    alt: id,
    aspectRatio,
    image: {
      url: `https://cdn.sanity.io/images/test/test/${id}-${Math.round(aspectRatio * 1000)}x1000.jpg`,
      width: Math.round(aspectRatio * 1000),
      height: 1000,
      lqip: null,
    },
  }),
);

// Filter order = the prototype's `.fb` buttons.
export const fixtureCategories: GalleryCategory[] = [
  { key: "gastronomia", label: "Gastronomía" },
  { key: "japones", label: "Japonés" },
  { key: "bebidas", label: "Bebidas" },
  { key: "eventos", label: "Eventos" },
  { key: "inmobiliaria", label: "Inmobiliaria" },
  { key: "interiores", label: "Interiores" },
  { key: "retratos", label: "Retratos" },
];
