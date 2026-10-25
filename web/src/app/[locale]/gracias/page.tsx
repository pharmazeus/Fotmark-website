import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { routing } from "@/i18n/routing";
import { contactHrefs } from "@/lib/contact";
import { buildMetadata, getLocalePath } from "@/lib/seo";
import { getSettings } from "@/sanity/fetch";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/gracias">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "pages.thanks" });
  return buildMetadata(
    locale,
    { title: `${t("title")} — FOTMARK`, description: t("text") },
    { slug: "gracias", noIndex: true },
  );
}

export default async function ThanksPage({
  params,
}: PageProps<"/[locale]/gracias">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const [t, pages, settings] = await Promise.all([
    getTranslations({ locale, namespace: "pages.thanks" }),
    getTranslations({ locale, namespace: "pages" }),
    getSettings(locale),
  ]);
  return (
    <PageShell eyebrow="FOTMARK" title={t("title")}>
      <p>{t("text")}</p>
      <div className="mt-8 flex flex-wrap gap-6">
        <a className="link-underline text-acc2" href={getLocalePath(locale)}>
          {pages("backHome")}
        </a>
        <a
          className="link-underline text-acc2"
          href={contactHrefs(settings).whatsapp}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t("whatsapp")}
        </a>
      </div>
    </PageShell>
  );
}
