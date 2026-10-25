import { getLocale, getTranslations } from "next-intl/server";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { reveal } from "@/components/ui/reveal";
import { Gallery } from "@/features/gallery/Gallery";
import type { Locale } from "@/i18n/routing";
import { getCategories, getPortfolio } from "@/sanity/fetch";

// Prototype `#proyectos`: heading + category filters (`.pf-head`) over the balanced
// masonry gallery with its lightbox. The photos and categories are CMS data
// (`getPortfolio` / `getCategories`); only the UI copy lives in messages. The interactive
// part is the client `Gallery`.
export async function Proyectos() {
  const locale = (await getLocale()) as Locale;
  const [t, items, categories] = await Promise.all([
    getTranslations("proyectos"),
    getPortfolio(locale),
    getCategories(locale),
  ]);

  return (
    <section
      id="proyectos"
      data-section="proyectos"
      className="relative py-section"
    >
      <div className="wrap">
        <Gallery
          items={items}
          categories={categories}
          labels={{
            all: t("all"),
            filters: t("filters"),
            label: t("lightbox.label"),
            close: t("lightbox.close"),
            prev: t("lightbox.prev"),
            next: t("lightbox.next"),
          }}
          head={
            <div {...reveal()} className="max-w-sh">
              <Eyebrow className="mb-6">{t("eyebrow")}</Eyebrow>
              <h2 className="mt-[20px] text-title font-light">{t("title")}</h2>
            </div>
          }
        />
      </div>
    </section>
  );
}
