import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["es", "en", "uk"],
  defaultLocale: "es",
  // ES at `/`, EN at `/en`, UA at `/ua` (locale code stays ISO `uk`, D-022).
  localePrefix: { mode: "as-needed", prefixes: { uk: "/ua" } },
  // Crawlers and shared links land on the URL they asked for.
  localeDetection: false,
  // Metadata owns hreflang so unapproved locales do not leak through Link headers.
  alternateLinks: false,
});

export type Locale = (typeof routing.locales)[number];

// Unapproved translations stay out of search (i18n.md). Flip on owner approval (Q-05).
export const indexable: Record<Locale, boolean> = {
  es: true,
  en: false,
  uk: false,
};
