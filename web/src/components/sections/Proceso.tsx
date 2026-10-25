import { getTranslations } from "next-intl/server";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { reveal, type RevealDelay } from "@/components/ui/reveal";
import { rich } from "@/components/ui/rich";

// Prototype `.step.rv` delays: none, d1…d4.
const STEPS = [
  { key: "descubrimos", delay: undefined },
  { key: "definimos", delay: 1 },
  { key: "creamos", delay: 2 },
  { key: "impulsamos", delay: 3 },
  { key: "optimizamos", delay: 4 },
] as const satisfies readonly { key: string; delay: RevealDelay | undefined }[];

const FLOW = ["estrategia", "creatividad", "impacto"] as const;

// Prototype `.proc`: 5-step timeline (3 cols ≤1080 without the line, 2 cols ≤820) + flow line.
export async function Proceso() {
  const t = await getTranslations("proceso");

  return (
    <section
      id="proceso"
      data-section="proceso"
      className="relative bg-bg1 py-section"
    >
      <div className="wrap">
        <div {...reveal()} className="mx-auto max-w-sh text-center">
          <Eyebrow centered className="mb-6">
            {t("eyebrow")}
          </Eyebrow>
          <h2 className="text-title font-light">{t.rich("title", rich)}</h2>
        </div>

        {/* .steps: inline margin-top:70px; the 1px line (::before, top 34px) only in 5-col layout. */}
        <div className="relative mt-[70px] grid grid-cols-2 gap-y-[44px] nav:grid-cols-3 wide:grid-cols-5 wide:gap-y-0 wide:before:absolute wide:before:inset-x-0 wide:before:top-[34px] wide:before:h-px wide:before:bg-line2">
          {STEPS.map(({ key, delay }, i) => (
            <div
              key={key}
              {...reveal(delay)}
              className="relative px-[clamp(14px,1.6vw,26px)] first:pl-0"
            >
              {/* The one round shape and ring shadow in the design (design-system §1): the
                  `--bg1` ring masks the timeline line behind the dot. */}
              <div className="relative mb-[60px] size-[9px] rounded-full bg-acc shadow-[0_0_0_6px_var(--bg1)] after:absolute after:-inset-[6px] after:rounded-full after:border after:border-acc after:opacity-35" />
              <span className="mb-[10px] block text-index font-normal text-acc">
                {String(i + 1).padStart(2, "0")}
              </span>
              {/* One-off: 12.5px, .16em. */}
              <h3 className="mb-4 text-[12.5px] tracking-label text-ink uppercase">
                {t(`steps.${key}.title`)}
              </h3>
              <p className="text-card text-mut">{t(`steps.${key}.text`)}</p>
            </div>
          ))}
        </div>

        {/* .flow: one-off size clamp(16px,2.4vw,28px), .12em. */}
        <div
          {...reveal(2)}
          className="mt-[70px] flex flex-wrap items-center justify-center gap-[clamp(12px,2vw,30px)] text-[clamp(16px,2.4vw,28px)] tracking-[.12em] text-ink"
        >
          {FLOW.map((key, i) => (
            <FlowItem key={key} arrow={i > 0}>
              {t(`flow.${key}`)}
            </FlowItem>
          ))}
        </div>
      </div>
    </section>
  );
}

function FlowItem({ arrow, children }: { arrow: boolean; children: string }) {
  return (
    <>
      {arrow && (
        <span aria-hidden="true" className="font-glyph text-[.8em] text-acc">
          →
        </span>
      )}
      <span>{children}</span>
    </>
  );
}
