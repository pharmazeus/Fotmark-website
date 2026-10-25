import { getTranslations } from "next-intl/server";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { reveal } from "@/components/ui/reveal";
import { rich } from "@/components/ui/rich";
import { cn } from "@/lib/cn";

// The third column is the gold one (`.c.accent`).
const COLS = [
  { key: "col1", accent: false },
  { key: "col2", accent: false },
  { key: "col3", accent: true },
] as const;

// Prototype `#quehacemos` (`/* intro */`): statement, a rule, three columns (one column ≤820px).
// The clamp() values below are this section's own, used nowhere else in the prototype.
export async function QueHacemos() {
  const t = await getTranslations("queHacemos");

  return (
    <section
      id="quehacemos"
      data-section="quehacemos"
      className="relative py-section"
    >
      <div className="wrap">
        <div {...reveal()}>
          <Eyebrow className="mb-[clamp(22px,2.6vw,34px)]">
            {t("eyebrow")}
          </Eyebrow>
          <h2 className="text-intro font-light text-ink">
            {t.rich("statement", rich)}
          </h2>
        </div>
        <div
          {...reveal(1)}
          className="mt-[clamp(46px,6vw,84px)] grid grid-cols-1 border-t border-line nav:grid-cols-3"
        >
          {COLS.map(({ key, accent }) => (
            <div
              key={key}
              className={cn(
                // `.intro-cols .c` and `.c+.c`; ≤820 the side rule becomes a top rule.
                "pt-[26px] nav:pt-[clamp(28px,3.2vw,44px)] nav:pr-[clamp(18px,2.4vw,42px)]",
                "not-first:mt-[26px] not-first:border-t not-first:border-line",
                "nav:not-first:mt-0 nav:not-first:border-t-0 nav:not-first:border-l nav:not-first:pl-[clamp(18px,2.4vw,42px)]",
              )}
            >
              <p
                className={cn(
                  "text-[length:clamp(14.5px,1.3vw,16.5px)] leading-[1.9] font-light",
                  accent ? "text-acc2" : "text-ink2",
                )}
              >
                {t(key)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
