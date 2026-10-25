import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { LegalPage } from "@/components/legal/LegalPage";
import { routing } from "@/i18n/routing";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/privacidad">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "pages.legal" });
  return buildMetadata(
    locale,
    { title: `${t("privacyTitle")} — FOTMARK`, description: t("placeholder") },
    { slug: "privacidad", noIndex: true },
  );
}
export default async function Privacy({
  params,
}: PageProps<"/[locale]/privacidad">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const t = await getTranslations({ locale, namespace: "pages.legal" });
  return <LegalPage title={t("privacyTitle")} placeholder={t("placeholder")} />;
}
