import type { MetadataRoute } from "next";
import { env } from "@/env";
import { indexable, routing } from "@/i18n/routing";
import {
  absoluteUrl,
  approvedLanguageAlternates,
  getLocalePath,
} from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  if (!env.SITE_INDEXABLE) return [];
  return routing.locales
    .filter((locale) => indexable[locale])
    .map((locale) => ({
      url: absoluteUrl(getLocalePath(locale)),
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 1,
      alternates: { languages: approvedLanguageAlternates() },
    }));
}
