// Pure document builders for the seed (no I/O), so they can be tested without touching
// the dataset. seed.ts feeds them the prepared photos and the uploaded asset ids.

import { createHash } from "node:crypto";
import {
  CATEGORIES,
  CLIENTS,
  SERVICES,
  SETTINGS,
  TESTIMONIALS,
  type Localized,
} from "./seed-data";

export const LANGS = ["es", "en", "uk"] as const;
export type Lang = (typeof LANGS)[number];

export type Crop = { top: number; bottom: number; left: number; right: number };

export type Doc = { _id: string; _type: string; [key: string]: unknown };

export const pad2 = (n: number) => String(n).padStart(2, "0");

function sha1(text: string): string {
  return createHash("sha1").update(text).digest("hex");
}

// Internationalized array value (sanity-plugin-internationalized-array v5): one row per
// language, the language in `language`, a stable `_key` so a re-seed keeps row identity.
function localized(
  docId: string,
  field: string,
  values: Localized,
  kind: "String" | "Text",
) {
  return LANGS.map((language) => ({
    _key: sha1(`${docId}:${field}:${language}`).slice(0, 12),
    _type: `internationalizedArray${kind}Value`,
    language,
    value: values[language],
  }));
}

// Evenly spaced LexoRank strings (what @sanity/orderable-document-list sorts by): the format
// is `bucket|6 base-36 digits:`. Even spacing leaves room for Studio to insert between rows.
function orderRanks(total: number): string[] {
  const step = Math.floor(36 ** 6 / (total + 1));
  return Array.from(
    { length: total },
    (_, i) => `0|${((i + 1) * step).toString(36).padStart(6, "0")}:`,
  );
}

const ref = (id: string) => ({ _type: "reference", _ref: id });

/** What the builder needs to know about one gallery photo. */
export type PhotoForDocs = {
  docId: string;
  entry: {
    category: string;
    caption: Record<Lang, string>;
    alt: Record<Lang, string>;
  };
  crop: Crop | null;
};

export type Assets = {
  photos: Map<string, string>;
  logos: Map<string, string>;
};

export function buildDocuments(photos: PhotoForDocs[], assets: Assets): Doc[] {
  const docs: Doc[] = [];

  docs.push({
    _id: "settings",
    _type: "settings",
    phone: SETTINGS.phone,
    whatsapp: SETTINGS.whatsapp,
    email: SETTINGS.email,
    instagram: SETTINGS.instagram,
    founder: SETTINGS.founder,
    location: localized("settings", "location", SETTINGS.location, "String"),
    address: localized("settings", "address", SETTINGS.address, "Text"),
    areaServed: [...SETTINGS.areaServed],
    stats: { projects: SETTINGS.stats.projects, years: SETTINGS.stats.years },
  });

  const categoryRanks = orderRanks(CATEGORIES.length);
  CATEGORIES.forEach((category, index) => {
    const _id = `category-${category.key}`;
    docs.push({
      _id,
      _type: "category",
      orderRank: categoryRanks[index],
      key: { _type: "slug", current: category.key },
      label: localized(_id, "label", category.label, "String"),
    });
  });

  const clientRanks = orderRanks(CLIENTS.length);
  CLIENTS.forEach((client, index) => {
    const _id = `client-${client.slug}`;
    const logoAsset = assets.logos.get(client.slug);
    docs.push({
      _id,
      _type: "client",
      orderRank: clientRanks[index],
      name: client.name,
      ...(logoAsset ? { logo: { _type: "image", asset: ref(logoAsset) } } : {}),
      ...(client.tagline
        ? { tagline: localized(_id, "tagline", client.tagline, "String") }
        : {}),
      showInWall: true,
    });
  });

  const testimonialRanks = orderRanks(TESTIMONIALS.length);
  TESTIMONIALS.forEach((testimonial, index) => {
    const _id = `testimonial-${testimonial.clientSlug}`;
    docs.push({
      _id,
      _type: "testimonial",
      orderRank: testimonialRanks[index],
      quote: localized(_id, "quote", testimonial.quote, "Text"),
      client: ref(`client-${testimonial.clientSlug}`),
      subtitle: localized(_id, "subtitle", testimonial.subtitle, "String"),
    });
  });

  const serviceRanks = orderRanks(SERVICES.length);
  SERVICES.forEach((service, index) => {
    const _id = `service-${service.icon}`;
    docs.push({
      _id,
      _type: "service",
      orderRank: serviceRanks[index],
      name: localized(_id, "name", service.name, "String"),
      text: localized(_id, "text", service.text, "Text"),
      tags: localized(_id, "tags", service.tags, "String"),
      icon: service.icon,
    });
  });

  const photoRanks = orderRanks(photos.length);
  photos.forEach((photo, index) => {
    const assetId = assets.photos.get(photo.docId);
    if (!assetId) throw new Error(`no asset for ${photo.docId}`);
    const { crop } = photo;
    docs.push({
      _id: photo.docId,
      _type: "portfolioItem",
      orderRank: photoRanks[index],
      image: {
        _type: "image",
        asset: ref(assetId),
        ...(crop
          ? {
              crop: { _type: "sanity.imageCrop", ...crop },
              hotspot: {
                _type: "sanity.imageHotspot",
                x: (crop.left + (1 - crop.right)) / 2,
                y: (crop.top + (1 - crop.bottom)) / 2,
                width: 1 - crop.left - crop.right,
                height: 1 - crop.top - crop.bottom,
              },
            }
          : {}),
      },
      category: ref(`category-${photo.entry.category}`),
      caption: localized(photo.docId, "caption", photo.entry.caption, "String"),
      alt: localized(photo.docId, "alt", photo.entry.alt, "String"),
    });
  });

  return docs;
}
