import type { Metadata } from "next";
import { Cormorant_Garamond, Jost, Montserrat } from "next/font/google";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Grain } from "@/components/layout/Grain";
import { SkipLink } from "@/components/layout/SkipLink";
import { ThemeScript } from "@/components/layout/ThemeScript";
import { routing } from "@/i18n/routing";
import { buildMetadata } from "@/lib/seo";
import { THEME_COLOR } from "@/lib/site";
import "../globals.css";

const jost = Jost({
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["300", "400", "500"],
  variable: "--font-jost",
  display: "swap",
});

// Only the word FOTMARK uses it (D-003).
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: "500",
  variable: "--font-cormorant",
  display: "swap",
});

// Jost lacks a few Ukrainian glyphs. Montserrat only wins for glyphs Jost cannot render.
const ukrainianGlyphs = Montserrat({
  subsets: ["cyrillic-ext"],
  weight: ["300", "400", "500"],
  variable: "--font-uk-glyphs",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "meta" });

  return buildMetadata(locale, {
    title: t("title"),
    description: t("description"),
  });
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  return (
    <html
      lang={locale}
      // The site has its own ES/EN/UA switcher; browser auto-translate prompted on every
      // visit and rendered the brand as "FOTBOOK" (D-045).
      translate="no"
      data-theme="dark"
      // The theme script (Step 4) rewrites data-theme before hydration.
      suppressHydrationWarning
      className={`${jost.variable} ${cormorant.variable} ${ukrainianGlyphs.variable}`}
    >
      <head>
        <meta name="theme-color" content={THEME_COLOR} />
        <meta name="google" content="notranslate" />
        <ThemeScript />
        {/* Without JS nothing would reveal the `[data-reveal]` blocks. */}
        <noscript>
          <style>{"[data-reveal]{opacity:1;transform:none}"}</style>
        </noscript>
      </head>
      <body>
        <SkipLink />
        <Grain />
        {/* Site chrome (header, footer, scroll effects) lives in `(site)/layout.tsx`, so
            standalone pages like the `/qr` business card render without it. */}
        {children}
      </body>
    </html>
  );
}
