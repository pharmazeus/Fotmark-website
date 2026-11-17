import { getLocale, getTranslations } from "next-intl/server";
import { PageShell } from "@/components/layout/PageShell";
import type { Locale } from "@/i18n/routing";
import { getLocalePath } from "@/lib/seo";

export default async function NotFound() {
  const [locale, t, pages] = await Promise.all([
    getLocale(),
    getTranslations("pages.notFound"),
    getTranslations("pages"),
  ]);
  return (
    <PageShell eyebrow="404" title={t("title")}>
      <p>{t("text")}</p>
      <a
        className="link-underline mt-8 inline-block text-acc2"
        href={getLocalePath(locale as Locale)}
      >
        {pages("backHome")}
      </a>
    </PageShell>
  );
}
