import type { Metadata } from "next";
import type { Graph, ProfessionalService, WebSite } from "schema-dts";
import { env } from "@/env";
import { indexable, type Locale } from "@/i18n/routing";
import type { Settings } from "@/sanity/content-types";
import { BRAND } from "./site";

const localePrefixes: Record<Locale, string> = { es: "", en: "/en", uk: "/ua" };
const openGraphLocales: Record<Locale, string> = {
  es: "es_ES",
  en: "en_GB",
  uk: "uk_UA",
};

export function getLocalePath(locale: Locale) {
  return localePrefixes[locale] || "/";
}

export function getLocalizedPath(locale: Locale, slug = "") {
  const prefix = localePrefixes[locale];
  return `${prefix}/${slug}`.replace(/\/$/, "") || "/";
}

export function absoluteUrl(path = "/") {
  return new URL(path, env.NEXT_PUBLIC_SITE_URL).toString();
}

export function isLocaleIndexable(locale: Locale) {
  return env.SITE_INDEXABLE && indexable[locale];
}

export function approvedLanguageAlternates(slug = "") {
  const languages: Record<string, string> = {};
  for (const locale of ["es", "en", "uk"] as const) {
    if (indexable[locale])
      languages[locale] = absoluteUrl(getLocalizedPath(locale, slug));
  }
  languages["x-default"] = absoluteUrl(getLocalizedPath("es", slug));
  return languages;
}

type MetadataCopy = { title: string; description: string };

export function buildMetadata(
  locale: Locale,
  copy: MetadataCopy,
  options: { slug?: string; noIndex?: boolean } = {},
): Metadata {
  const slug = options.slug ?? "";
  const canonical = absoluteUrl(getLocalizedPath(locale, slug));
  const noIndex = options.noIndex || !isLocaleIndexable(locale);

  return {
    metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
    title: copy.title,
    description: copy.description,
    alternates: {
      canonical,
      languages: approvedLanguageAlternates(slug),
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      type: "website",
      siteName: BRAND,
      locale: openGraphLocales[locale],
      url: canonical,
      title: copy.title,
      description: copy.description,
      images: [
        { url: absoluteUrl("/og"), width: 1200, height: 630, alt: "FOTMARK" },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: copy.title,
      description: copy.description,
      images: [absoluteUrl("/og")],
    },
  };
}

type StructuredCopy = {
  description: string;
  services: string[];
};

export function buildStructuredData(
  locale: Locale,
  settings: Settings,
  copy: StructuredCopy,
): Graph {
  const websiteId = `${absoluteUrl("/")}#website`;
  const businessId = `${absoluteUrl("/")}#business`;
  const service: ProfessionalService = {
    "@type": "ProfessionalService",
    "@id": businessId,
    name: BRAND,
    url: absoluteUrl(getLocalePath(locale)),
    description: copy.description,
    email: settings.email,
    telephone: settings.phone,
    areaServed: settings.areaServed,
    sameAs: [`https://instagram.com/${settings.instagram.replace(/^@/, "")}`],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Fotmark services",
      itemListElement: copy.services.map((name) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name },
      })),
    },
  };
  const website: WebSite = {
    "@type": "WebSite",
    "@id": websiteId,
    name: BRAND,
    url: absoluteUrl("/"),
    inLanguage: locale,
    publisher: { "@id": businessId },
  };

  return { "@context": "https://schema.org", "@graph": [service, website] };
}
