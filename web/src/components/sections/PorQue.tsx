import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { reveal, type RevealDelay } from "@/components/ui/reveal";
import { rich } from "@/components/ui/rich";

// Prototype `.pill.rv` delays: none, d1…d3.
const PILLARS = [
  { key: "estrategia", delay: undefined },
  { key: "creatividad", delay: 1 },
  { key: "produccion", delay: 2 },
  { key: "marketing", delay: 3 },
] as const satisfies readonly { key: string; delay: RevealDelay | undefined }[];

// `.why .strike b`: the second line in ink2, still weight 300 (no bold, D-002).
const strikeTags = {
  ...rich,
  b: (chunks: ReactNode) => <span className="text-ink2">{chunks}</span>,
};

// Prototype `.why` (no id): centred head + 4 hairline pillars (2 cols ≤1080, 1 ≤820).
// Each pillar's own `transition` (background .5s ease) overrides the reveal fade, as `.pill`
// overrides `.rv` in the prototype: pillars appear without it (Q-25). Longhands, not the
// shorthand: `.rv.d1…d3` keeps its transition-delay there, so the hover is delayed too.
export async function PorQue() {
  const t = await getTranslations("porque");

  return (
    <section data-section="porque" className="relative bg-bg1 py-section">
      <div className="wrap">
        <div {...reveal()} className="mx-auto max-w-sh text-center">
          <Eyebrow centered className="mb-6">
            {t("eyebrow")}
          </Eyebrow>
          <h2 className="text-title font-light">{t.rich("title", rich)}</h2>
          {/* .strike: one-off 15px / line-height 2. */}
          <p className="mt-[26px] text-[15px] leading-[2] text-mut">
            {t.rich("strike", strikeTags)}
          </p>
        </div>

        {/* Grid lines: top+left on the wrapper, right+bottom on each pillar. */}
        <div className="mt-[70px] grid grid-cols-1 border-t border-l border-line nav:grid-cols-2 wide:grid-cols-4">
          {PILLARS.map(({ key, delay }, i) => (
            <div
              key={key}
              {...reveal(delay)}
              className="border-r border-b border-line p-[clamp(28px,3vw,44px)] transition-[background] duration-500 hover:bg-bg2"
            >
              <span className="mb-[20px] block text-index font-normal text-acc">
                {String(i + 1).padStart(2, "0")}
              </span>
              {/* .pill h4: one-off clamp(19px,2vw,24px), -.005em. */}
              <h3 className="mb-[12px] text-[length:clamp(19px,2vw,24px)] tracking-[-.005em]">
                {t(`pillars.${key}.title`)}
              </h3>
              <p className="text-card text-mut">{t(`pillars.${key}.text`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
