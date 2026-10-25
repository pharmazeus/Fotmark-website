import { getTranslations } from "next-intl/server";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { reveal } from "@/components/ui/reveal";
import { rich } from "@/components/ui/rich";
import { getSettings } from "@/lib/settings-fallback";

// Prototype `#sobre` (`/* ABOUT */`): one narrow text column (`.wrap.ab-grid`, 880px),
// two leads and the stats row. The numbers are CMS facts (settings.stats, D-012);
// only their labels are copy. The clamp() sizes below are this section's own.
export async function Sobre() {
  const [t, { stats }] = await Promise.all([
    getTranslations("sobre"),
    getSettings(),
  ]);

  const items = [
    { n: stats.projects, label: t("stats.projects") },
    { n: stats.years, label: t("stats.years") },
  ];

  return (
    <section id="sobre" data-section="sobre" className="relative py-section">
      {/* `.ab-grid{max-width:880px}` overrides `.wrap`'s 1320px; padding and margin stay. */}
      <div className="wrap max-w-sh">
        <div {...reveal()}>
          <Eyebrow className="mb-6">{t("eyebrow")}</Eyebrow>
          <h2 className="mb-[26px] text-[length:clamp(27px,3.7vw,46px)] leading-[1.16] font-light tracking-[-0.015em]">
            {t.rich("title", rich)}
          </h2>
          <p className="mb-[18px] text-lead font-light text-ink2">{t("p1")}</p>
          <p className="mb-[18px] text-lead font-light text-ink2">{t("p2")}</p>
          <div className="mt-[44px] flex flex-wrap gap-[clamp(28px,4vw,56px)]">
            {items.map(({ n, label }) => (
              <div key={label}>
                <div className="text-[length:clamp(32px,3.6vw,46px)] leading-none font-light tracking-[-0.01em] text-acc2">
                  {n}
                </div>
                <div className="mt-[10px] text-micro tracking-[0.18em] text-dim uppercase">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
