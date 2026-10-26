import type { Locale } from "./routing";

// Public URL prefixes (routing.ts `localePrefix`): ES at `/`, EN at `/en`, UA at `/ua`.
export const localePrefixes: Record<Locale, string> = {
  es: "",
  en: "/en",
  uk: "/ua",
};

// On static pages Next can report next-intl's internal path (`/es…`, `/uk…`) instead of
// the address bar's (vercel/next.js#73085), so strip either the public prefix or the locale.
function unprefix(pathname: string, locale: Locale) {
  for (const prefix of [localePrefixes[locale], `/${locale}`]) {
    if (!prefix) continue;
    if (pathname === prefix) return "/";
    if (pathname.startsWith(`${prefix}/`)) return pathname.slice(prefix.length);
  }
  return pathname;
}

export function switchLocalePath(pathname: string, from: Locale, to: Locale) {
  const path = unprefix(pathname, from);
  return `${localePrefixes[to]}${path === "/" ? "" : path}` || "/";
}
