import { getTranslations } from "next-intl/server";
import { Monogram } from "@/components/brand/Monogram";
import { BRAND } from "@/lib/site";

// Minimal logo lockup, no imagery (D-001…). Prototype `.hero`.
export async function Hero() {
  const t = await getTranslations("hero");

  return (
    <section
      id="top"
      data-section="hero"
      className="relative flex min-h-screen flex-col items-center justify-center bg-bg px-gut pt-[130px] pb-[100px] text-center"
    >
      <div className="flex flex-col items-center">
        <Monogram className="mb-[clamp(6px,1vw,12px)] w-[clamp(60px,8vw,112px)] animate-mono text-monogram grayscale [--from:translateY(20px)_scale(.94)]" />
        <h1 className="animate-wm pl-[.26em] font-serif text-wm font-medium text-wordmark [--from:translateY(22px)]">
          {BRAND}
        </h1>
        <div className="mt-[clamp(16px,2vw,28px)] animate-descriptor pl-[.5em] text-descriptor text-wordmark-sub uppercase [--from:translateY(16px)]">
          {t("descriptor")}
        </div>
      </div>
      <div className="mt-[clamp(32px,5.5vh,58px)] mb-[clamp(24px,3.6vh,36px)] h-px w-[66px] animate-divider bg-[linear-gradient(90deg,transparent,var(--acc)_45%,var(--acc)_55%,transparent)]" />
      <p className="max-w-[600px] animate-tagline text-tagline text-ink2 [--from:translateY(14px)]">
        {t.rich("tagline", { br: () => <br /> })}
      </p>
      <div className="mt-[clamp(20px,2.6vw,30px)] animate-loc text-hero-loc text-dim uppercase">
        {t("location")}
      </div>
      <a
        href="#quehacemos"
        className="absolute bottom-[30px] left-1/2 z-2 flex -translate-x-1/2 animate-cue flex-col items-center gap-[11px] text-cue text-dim uppercase"
      >
        <span>{t("scroll")}</span>
        <i className="relative block h-[42px] w-px overflow-hidden bg-line2 after:absolute after:top-[-42px] after:left-0 after:h-[42px] after:w-px after:animate-cue-run after:bg-acc" />
      </a>
    </section>
  );
}
