import { getTranslations } from "next-intl/server";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { rich } from "@/components/ui/rich";

// Prototype `.appr` ("Nuestro enfoque", no id): a centred manifesto over a 900px radial
// glow (`.appr::before`). The block is `.wrap.in.rv`, and its `in` class is also the
// reveal's end state, so the prototype shows it without the fade. Ported as is: no
// reveal (same as the CTA's `.wrap.in.rv`).
// The other clamp() values below are this section's own, used nowhere else in the prototype.
export async function Enfoque() {
  const t = await getTranslations("enfoque");

  return (
    <section
      data-section="enfoque"
      className="glow-appr relative overflow-hidden py-section text-center"
    >
      {/* `.appr .in` narrows `.wrap` to 1100px. */}
      <div className="relative z-1 mx-auto max-w-[1100px] px-gut">
        <Eyebrow centered className="mb-[30px]">
          {t("eyebrow")}
        </Eyebrow>
        <div className="text-enfoque font-light">
          {t.rich("statement", rich)}
        </div>
        <div className="mt-[34px] text-body-lg leading-[2] text-ink2">
          {t.rich("body", rich)}
        </div>
        <div className="mx-auto my-[40px] h-px w-[60px] bg-acc" />
        <div className="text-[length:clamp(19px,2.5vw,28px)] leading-[1.5] font-light tracking-[-.01em] text-acc2">
          {t.rich("closing", rich)}
        </div>
      </div>
    </section>
  );
}
