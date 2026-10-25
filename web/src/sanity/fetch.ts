import "server-only";
import { cache } from "react";
import type { Locale } from "@/i18n/routing";
import {
  SERVICE_KEYS,
  type Category,
  type Client,
  type PortfolioItem,
  type Service,
  type ServiceKey,
  type Settings,
  type Testimonial,
} from "./content-types";
import { resolveImage } from "./image";
import { sanityFetch } from "./live";
import {
  CATEGORIES_QUERY,
  CLIENTS_QUERY,
  PORTFOLIO_QUERY,
  SERVICES_QUERY,
  SETTINGS_QUERY,
  TESTIMONIALS_QUERY,
} from "./queries";
import type {
  CATEGORIES_QUERY_RESULT,
  CLIENTS_QUERY_RESULT,
  PORTFOLIO_QUERY_RESULT,
  SERVICES_QUERY_RESULT,
  SETTINGS_QUERY_RESULT,
  TESTIMONIALS_QUERY_RESULT,
} from "./types";

// Data-access layer: the only place that knows GROQ result shapes. Components get the
// plain shapes of content-types.ts, with text already in the page locale.
//
// Every call pins `perspective: "published"` and `stega: false`: no draftMode() lookup, so the
// per-locale pages stay static even if a read token is added later (see live.ts). The custom
// `tags` are what a revalidation webhook can target (`revalidateTag("client", "max")`).
// Each getter is wrapped in React `cache()`: Header, Footer, Sobre… share one result per render.
// `sanityFetch` returns `unknown` data (typegen runs without `overloadClientMethods`, see
// studio/sanity.cli.ts), so each result is cast to its generated `*_QUERY_RESULT` type.

const FETCH = { perspective: "published", stega: false } as const;

type LogoSource = Parameters<typeof resolveImage>[0];

function toLogo(logo: LogoSource): Client["logo"] {
  const resolved = resolveImage(logo);
  return resolved
    ? { width: resolved.width, height: resolved.height, url: resolved.url }
    : null;
}

function toClient(source: {
  _id: string;
  name: string;
  tagline: string | null;
  logo: LogoSource;
}): Client {
  return {
    id: source._id,
    name: source.name,
    logo: toLogo(source.logo),
    ...(source.tagline ? { tagline: source.tagline } : {}),
  };
}

export const getSettings = cache(async (locale: Locale): Promise<Settings> => {
  const { data: raw } = await sanityFetch({
    query: SETTINGS_QUERY,
    params: { locale },
    tags: ["settings"],
    ...FETCH,
  });
  const data = raw as SETTINGS_QUERY_RESULT;
  if (!data) {
    throw new Error(
      'Sanity has no published "settings" document. Run the seed (studio/scripts/seed.ts) or publish it in Studio.',
    );
  }
  return {
    location: data.location ?? "",
    areaServed: data.areaServed ?? [],
    address: (data.address ?? "")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean),
    phone: data.phone,
    whatsapp: data.whatsapp,
    email: data.email,
    instagram: data.instagram,
    founder: data.founder,
    stats: {
      projects: data.stats?.projects ?? "",
      years: data.stats?.years ?? 0,
    },
  };
});

// The tagline is the only localized part of a client.
export const getClients = cache(async (locale: Locale): Promise<Client[]> => {
  const { data: raw } = await sanityFetch({
    query: CLIENTS_QUERY,
    params: { locale },
    tags: ["client"],
    ...FETCH,
  });
  const data = raw as CLIENTS_QUERY_RESULT;
  return data.map(toClient);
});

export const getTestimonials = cache(
  async (locale: Locale): Promise<Testimonial[]> => {
    const { data: raw } = await sanityFetch({
      query: TESTIMONIALS_QUERY,
      params: { locale },
      tags: ["testimonial", "client"],
      ...FETCH,
    });
    const data = raw as TESTIMONIALS_QUERY_RESULT;
    return data.flatMap((item) =>
      item.client && item.quote
        ? [
            {
              id: item._id,
              quote: item.quote,
              client: toClient(item.client),
              subtitle: item.subtitle ?? "",
            },
          ]
        : [],
    );
  },
);

export const getCategories = cache(
  async (locale: Locale): Promise<Category[]> => {
    const { data: raw } = await sanityFetch({
      query: CATEGORIES_QUERY,
      params: { locale },
      tags: ["category"],
      ...FETCH,
    });
    const data = raw as CATEGORIES_QUERY_RESULT;
    return data.map((item) => ({
      key: item.key,
      label: item.label ?? item.key,
    }));
  },
);

// Studio order (drag-and-drop list). Items with a broken asset or category are skipped.
export const getPortfolio = cache(
  async (locale: Locale): Promise<PortfolioItem[]> => {
    const { data: raw } = await sanityFetch({
      query: PORTFOLIO_QUERY,
      params: { locale },
      tags: ["portfolioItem", "category"],
      ...FETCH,
    });
    const data = raw as PORTFOLIO_QUERY_RESULT;
    return data.flatMap((item) => {
      const image = resolveImage(item.image);
      if (!image || !item.category) return [];
      return [
        {
          id: item._id,
          category: item.category,
          caption: item.caption ?? "",
          alt: item.alt ?? "",
          aspectRatio: image.width / image.height,
          image,
        },
      ];
    });
  },
);

const isServiceKey = (key: string): key is ServiceKey =>
  (SERVICE_KEYS as readonly string[]).includes(key);

// Studio order. A service needs a name; an unknown icon (not in the Studio list) is skipped.
export const getServices = cache(async (locale: Locale): Promise<Service[]> => {
  const { data: raw } = await sanityFetch({
    query: SERVICES_QUERY,
    params: { locale },
    tags: ["service"],
    ...FETCH,
  });
  const data = raw as SERVICES_QUERY_RESULT;
  return data.flatMap((item) =>
    item.name && isServiceKey(item.key)
      ? [
          {
            key: item.key,
            name: item.name,
            text: item.text ?? "",
            tags: item.tags ?? "",
          },
        ]
      : [],
  );
});
