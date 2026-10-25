import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { LegalPage } from "@/components/legal/LegalPage";
import { routing } from "@/i18n/routing";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/aviso-legal">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "pages.legal" });
  return buildMetadata(
    locale,
    { title: `${t("noticeTitle")} — FOTMARK`, description: t("placeholder") },
    { slug: "aviso-legal", noIndex: true },
  );
}
export default async function LegalNotice({
  params,
}: PageProps<"/[locale]/aviso-legal">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const t = await getTranslations({ locale, namespace: "pages.legal" });
  return <LegalPage title={t("noticeTitle")} placeholder={t("placeholder")} />;
}
