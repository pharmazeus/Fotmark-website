import { describe, expect, it } from "vitest";
import { localePrefixes, switchLocalePath } from "@/i18n/locale-path";
import { routing } from "@/i18n/routing";

describe("language switcher paths", () => {
  it("prefix table matches the routing config", () => {
    const { localePrefix } = routing;
    const custom =
      typeof localePrefix === "object" && "prefixes" in localePrefix
        ? localePrefix.prefixes
        : undefined;
    for (const locale of routing.locales) {
      const expected =
        locale === routing.defaultLocale
          ? ""
          : (custom?.[locale] ?? `/${locale}`);
      expect(localePrefixes[locale], locale).toBe(expected);
    }
  });

  it.each([
    // [pathname Next reports, current locale, target, expected href]
    ["/", "es", "en", "/en"],
    ["/", "es", "uk", "/ua"],
    ["/en", "en", "es", "/"],
    ["/en", "en", "uk", "/ua"],
    ["/ua", "uk", "es", "/"],
    ["/ua", "uk", "en", "/en"],
    ["/ua/privacidad", "uk", "en", "/en/privacidad"],
    ["/privacidad", "es", "uk", "/ua/privacidad"],
  ] as const)("%s (%s) → %s is %s", (pathname, from, to, href) => {
    expect(switchLocalePath(pathname, from, to)).toBe(href);
  });

  // Static pages can report next-intl's internal rewrite instead of the public URL
  // (vercel/next.js#73085); the preview linked to /ua/es and /en/uk from it.
  it.each([
    ["/es", "es", "en", "/en"],
    ["/es", "es", "uk", "/ua"],
    ["/es", "es", "es", "/"],
    ["/uk", "uk", "es", "/"],
    ["/uk", "uk", "en", "/en"],
    ["/uk/privacidad", "uk", "en", "/en/privacidad"],
    ["/es/gracias", "es", "uk", "/ua/gracias"],
  ] as const)("internal %s (%s) → %s is %s", (pathname, from, to, href) => {
    expect(switchLocalePath(pathname, from, to)).toBe(href);
  });

  it("does not strip a prefix that is only the start of a segment", () => {
    expect(switchLocalePath("/english", "en", "es")).toBe("/english");
  });
});
