import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Grain } from "@/components/layout/Grain";
import { Header } from "@/components/layout/Header";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { SkipLink } from "@/components/layout/SkipLink";
import { indexable, routing } from "@/i18n/routing";
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

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    title: t("title"),
    description: t("description"),
    robots: indexable[locale] ? undefined : { index: false },
  };
}

export const viewport: Viewport = {
  themeColor: THEME_COLOR,
};

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  return (
    <html
      lang={locale}
      data-theme="dark"
      // The theme script (Step 4) rewrites data-theme before hydration.
      suppressHydrationWarning
      className={`${jost.variable} ${cormorant.variable}`}
    >
      <body>
        <SkipLink />
        <Grain />
        <ScrollProgress />
        <Header />
        {children}
      </body>
    </html>
  );
}
