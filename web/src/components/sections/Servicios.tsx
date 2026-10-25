import { Fragment, type ComponentType } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { reveal, type RevealDelay } from "@/components/ui/reveal";
import { rich } from "@/components/ui/rich";
import type { Locale } from "@/i18n/routing";
import type { ServiceKey } from "@/sanity/content-types";
import { getServices } from "@/sanity/fetch";
import {
  CameraIcon,
  DroneIcon,
  NetworkIcon,
  StarIcon,
  TargetIcon,
  VideoIcon,
} from "./servicios/icons";

// The drawings stay in code; a service picks one with its Studio «Icono» value (`key`).
const ICONS: Record<ServiceKey, ComponentType> = {
  fotografia: CameraIcon,
  video: VideoIcon,
  dron: DroneIcon,
  redes: NetworkIcon,
  publicidad: TargetIcon,
  branding: StarIcon,
};

// Reveal delays follow the 3-col rows (`.rv`, `.rv.d1`, `.rv.d2`).
const ROW_DELAYS: (RevealDelay | undefined)[] = [undefined, 1, 2];

// Prototype `#servicios`: centred head + 3×2 grid of hairline cards (2 cols ≤1080, 1 ≤820).
// The cards (name, text, tags) are CMS data (`getServices`, D-038); only the head is copy.
// The cards' own `transition` (background only) overrides the reveal's opacity/transform
// transition, as `.svc` overrides `.rv` in the prototype: they appear without the fade.
export async function Servicios() {
  const locale = (await getLocale()) as Locale;
  const [t, services] = await Promise.all([
    getTranslations("servicios"),
    getServices(locale),
  ]);

  return (
    <section
      id="servicios"
      data-section="servicios"
      className="relative py-section"
    >
      <div className="wrap">
        <div className="mx-auto max-w-sh text-center" {...reveal()}>
          <Eyebrow centered className="mb-6">
            {t("eyebrow")}
          </Eyebrow>
          <h2 className="text-title font-light">{t.rich("title", rich)}</h2>
        </div>
        {/* Grid lines: top+left on the wrapper, right+bottom on each card. */}
        <div className="mt-16 grid grid-cols-1 border-t border-l border-line nav:grid-cols-2 wide:grid-cols-3">
          {services.map(({ key, name, text, tags }, i) => {
            const Icon = ICONS[key];
            return (
              <div
                key={key}
                {...reveal(ROW_DELAYS[i % 3])}
                className="group relative border-r border-b border-line p-[clamp(30px,3.4vw,52px)] transition-[background] duration-600 ease-fotmark after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-left after:[transform:scaleX(0)] after:bg-[linear-gradient(90deg,var(--acc),var(--acc2))] after:[transition:transform_.6s_var(--ease-fotmark)] hover:bg-bg2 hover:after:[transform:scaleX(1)]"
              >
                <div className="mb-[34px] flex items-center justify-between">
                  <span className="text-index font-normal text-acc">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="size-[34px] text-ink2 opacity-70 [transition:color_.5s,opacity_.5s,transform_.6s_var(--ease-fotmark)] group-hover:[transform:translateY(-2px)] group-hover:text-acc group-hover:opacity-100">
                    <Icon />
                  </span>
                </div>
                <h3 className="mb-[14px] text-service font-normal">{name}</h3>
                <p className="mb-6 min-h-[52px] text-desc leading-[1.8] text-mut">
                  {text}
                </p>
                <div className="text-label leading-[2.05] tracking-[.04em] text-ink2 opacity-72">
                  {tags.split("·").map((tag, j) => (
                    <Fragment key={j}>
                      {j > 0 && (
                        <span className="mx-[5px] text-dim">{" · "}</span>
                      )}
                      {tag.trim()}
                    </Fragment>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
