import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { LegalPage } from "@/components/legal/LegalPage";
import { routing } from "@/i18n/routing";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/cookies">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "pages.legal" });
  return buildMetadata(
    locale,
    { title: `${t("cookiesTitle")} — FOTMARK`, description: t("placeholder") },
    { slug: "cookies", noIndex: true },
  );
}
export default async function Cookies({
  params,
}: PageProps<"/[locale]/cookies">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const t = await getTranslations({ locale, namespace: "pages.legal" });
  return <LegalPage title={t("cookiesTitle")} placeholder={t("placeholder")} />;
}
