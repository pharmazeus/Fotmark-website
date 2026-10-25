import { Fragment, type ComponentType } from "react";
import { getTranslations } from "next-intl/server";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { reveal, type RevealDelay } from "@/components/ui/reveal";
import { rich } from "@/components/ui/rich";
import {
  CameraIcon,
  DroneIcon,
  NetworkIcon,
  StarIcon,
  TargetIcon,
  VideoIcon,
} from "./servicios/icons";

// Prototype order; reveal delays follow the 3-col rows (`.rv`, `.rv.d1`, `.rv.d2`).
const SERVICES: {
  key: "fotografia" | "video" | "dron" | "redes" | "publicidad" | "branding";
  Icon: ComponentType;
  delay?: RevealDelay;
}[] = [
  { key: "fotografia", Icon: CameraIcon },
  { key: "video", Icon: VideoIcon, delay: 1 },
  { key: "dron", Icon: DroneIcon, delay: 2 },
  { key: "redes", Icon: NetworkIcon },
  { key: "publicidad", Icon: TargetIcon, delay: 1 },
  { key: "branding", Icon: StarIcon, delay: 2 },
];

// Prototype `#servicios`: centred head + 3×2 grid of hairline cards (2 cols ≤1080, 1 ≤820).
// The cards' own `transition` (background only) overrides the reveal's opacity/transform
// transition, as `.svc` overrides `.rv` in the prototype: they appear without the fade.
export async function Servicios() {
  const t = await getTranslations("servicios");

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
          {SERVICES.map(({ key, Icon, delay }, i) => (
            <div
              key={key}
              {...reveal(delay)}
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
              <h3 className="mb-[14px] text-service font-normal">
                {t(`items.${key}.name`)}
              </h3>
              <p className="mb-6 min-h-[52px] text-desc leading-[1.8] text-mut">
                {t(`items.${key}.text`)}
              </p>
              <div className="text-label leading-[2.05] tracking-[.04em] text-ink2 opacity-72">
                {t(`items.${key}.tags`)
                  .split("·")
                  .map((tag, j) => (
                    <Fragment key={j}>
                      {j > 0 && (
                        <span className="mx-[5px] text-dim">{" · "}</span>
                      )}
                      {tag.trim()}
                    </Fragment>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
