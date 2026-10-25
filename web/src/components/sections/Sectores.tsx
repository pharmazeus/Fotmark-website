import { getTranslations } from "next-intl/server";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { reveal } from "@/components/ui/reveal";
import { rich } from "@/components/ui/rich";

const SECTORS = [
  "restaurantes",
  "inmobiliaria",
  "hoteles",
  "construccion",
  "eventos",
  "locales",
] as const;

// Prototype `#sectores`: left-aligned head + six hairline rows (`.sect-grid` / `.srow`).
// Each row keeps its own `transition` (padding-left, background), which overrides the
// reveal fade exactly as `.srow` overrides `.rv` in the prototype: rows appear without it.
export async function Sectores() {
  const t = await getTranslations("sectores");

  return (
    <section
      id="sectores"
      data-section="sectores"
      className="relative py-section"
    >
      <div className="wrap">
        <div className="max-w-sh" {...reveal()}>
          <Eyebrow className="mb-6">{t("eyebrow")}</Eyebrow>
          <h2 className="mt-[22px] text-title font-light">
            {t.rich("title", rich)}
          </h2>
        </div>
        <div className="mt-[56px] border-t border-line">
          {SECTORS.map((key, i) => (
            <div
              key={key}
              {...reveal()}
              className="group relative grid grid-cols-[40px_1fr] items-center gap-[14px] border-b border-line py-[clamp(24px,3vw,40px)] [transition:padding-left_.5s_var(--ease-fotmark),background_.5s] hover:bg-[linear-gradient(90deg,var(--bg2),transparent_60%)] hover:pl-[18px] nav:grid-cols-[64px_1fr_1.3fr] nav:gap-[clamp(16px,3vw,50px)]"
            >
              <span className="text-index font-normal text-dim [transition:color_.5s] group-hover:text-acc">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="text-sector font-light">
                {t(`items.${key}.name`)}
              </h3>
              <p className="max-w-[520px] text-desc text-mut max-nav:col-span-full">
                {t(`items.${key}.text`)}
              </p>
              <span
                aria-hidden="true"
                className="absolute right-[6px] [transform:translateX(-10px)] font-glyph text-acc opacity-0 [transition:all_.5s_var(--ease-fotmark)] group-hover:[transform:translateX(0)] group-hover:opacity-100"
              >
                →
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
