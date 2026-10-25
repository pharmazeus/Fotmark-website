import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { rich } from "@/components/ui/rich";
import { contactHrefs } from "@/lib/contact";
import { getSettings } from "@/lib/settings-fallback";

// The heading's <em> isn't gold: only `.title em` is, and `.cta h2` isn't `.title`.
const titleTags = {
  ...rich,
  em: (chunks: ReactNode) => <em>{chunks}</em>,
};

// Prototype `#contacto` (`/* CTA */`, "Hablemos"): a centred call to action over a
// 1100px radial glow rising from below (`.cta::before`). The block is `.wrap.in.rv`, and
// its `in` class is also the reveal's end state, so the prototype shows it without the
// fade. Ported as is: no reveal (Q-25, same as Enfoque). The email is a CMS fact
// (settings); the contact form replaces this mailto link later (Step 4).
export async function Contacto() {
  const [t, settings] = await Promise.all([
    getTranslations("contacto"),
    getSettings(),
  ]);
  const href = `${contactHrefs(settings).email}?subject=${encodeURIComponent(t("subject"))}`;

  return (
    <section
      id="contacto"
      data-section="contacto"
      className="glow-cta relative overflow-hidden py-section text-center"
    >
      {/* `.cta .in`: lifts the content above the glow. */}
      <div className="relative z-1 wrap">
        <Eyebrow centered className="mb-[28px]">
          {t("eyebrow")}
        </Eyebrow>
        <h2 className="text-cta font-light">{t.rich("title", titleTags)}</h2>
        <p className="mx-auto mt-[26px] max-w-[600px] text-body-lg leading-[1.85] text-ink2">
          {t("text")}
        </p>
        <span className="mt-[22px] block text-[length:clamp(17px,2vw,23px)] font-light text-acc2">
          {t("tagline")}
        </span>
        <div>
          {/* `.cta .btn` outranks the ≤820 `.btn` padding, so 19/46 holds at every width. */}
          <Button
            variant="solid"
            href={href}
            className="mt-[44px] [--btn-px:46px] [--btn-py:19px]"
          >
            {t("button")}
          </Button>
        </div>
      </div>
    </section>
  );
}
