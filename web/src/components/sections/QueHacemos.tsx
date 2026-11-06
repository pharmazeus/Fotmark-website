import { getTranslations } from "next-intl/server";
import { QueHacemosReadingText } from "@/components/sections/QueHacemosReadingText";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { reveal } from "@/components/ui/reveal";
import { rich } from "@/components/ui/rich";

const DISCIPLINES = [
  "disciplines.strategy",
  "disciplines.creativity",
  "disciplines.production",
  "disciplines.marketing",
] as const;

// Owner-approved replacement for the original three-column `#quehacemos` intro (D-042).
// The clamp() values are one-offs copied from the replacement artifact.
export async function QueHacemos() {
  const t = await getTranslations("queHacemos");

  return (
    <section
      id="quehacemos"
      data-section="quehacemos"
      className="relative py-section"
    >
      <div className="wrap">
        <div
          {...reveal()}
          className="mb-[clamp(30px,3.6vw,48px)] flex items-center justify-between gap-[20px]"
        >
          <Eyebrow>{t("eyebrow")}</Eyebrow>
          <span className="hidden text-[10.5px] tracking-[.32em] text-dim uppercase nav:inline">
            {t("location")}
          </span>
        </div>

        <h2
          {...reveal(1)}
          className="text-[length:clamp(34px,6.2vw,88px)] leading-[1.02] font-light tracking-[-.03em] text-ink"
        >
          {t.rich("statement", rich)}
        </h2>

        <div className="mt-[clamp(56px,7vw,104px)] grid grid-cols-1 items-start gap-[30px] nav:grid-cols-[minmax(180px,1fr)_3fr] nav:gap-[clamp(28px,5vw,80px)]">
          <ul
            {...reveal(2)}
            aria-label={t("disciplinesLabel")}
            className="flex list-none flex-wrap gap-x-[22px] gap-y-[10px] nav:block nav:border-t nav:border-line"
          >
            {DISCIPLINES.map((key) => (
              <li
                key={key}
                className="group flex items-center gap-[14px] text-[10.5px] tracking-[.26em] text-ink2 uppercase nav:border-b nav:border-line nav:py-[15px] nav:text-[11.5px]"
              >
                <i className="size-[6px] shrink-0 rounded-full border border-acc transition-[background] duration-500 ease-fotmark group-hover:bg-acc" />
                {t(key)}
              </li>
            ))}
          </ul>

          <div>
            <QueHacemosReadingText text={t("reading")} />
            <p
              {...reveal()}
              className="mt-[clamp(36px,4vw,56px)] flex items-baseline gap-[18px] text-[length:clamp(14px,1.25vw,16.5px)] tracking-[.04em] text-mut before:h-px before:w-[44px] before:shrink-0 before:[transform:translateY(-.35em)] before:bg-acc before:content-['']"
            >
              <span className="leading-[1.7]">{t.rich("signature", rich)}</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
