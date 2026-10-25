import { getTranslations } from "next-intl/server";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { reveal } from "@/components/ui/reveal";
import { rich } from "@/components/ui/rich";
import { cn } from "@/lib/cn";
import { getClients, getTestimonials } from "@/lib/content-fallback";
import { ClientLogo } from "./clientes/ClientLogo";
import { TestimonialCard } from "./clientes/TestimonialCard";

// Prototype reveal delays per 3-card row: `.tcard.rv`, `.rv.d1`, `.rv.d2`.
const ROW_DELAYS = [undefined, 1, 2] as const;

// `.wall .lg`: every wall slot, logo or text, has this height (one-off clamp).
const SLOT = "flex h-[clamp(46px,5.2vw,72px)]";

// Prototype `#clientes` (`/* CLIENTS */` + `/* TESTIMONIALS */`): centred head, a hairline
// logo wall, then a 3-col testimonial grid (2 ≤1080, 1 ≤820). Clients and testimonials
// are CMS data (`getClients` / `getTestimonials`); only the head copy is in messages.
export async function Clientes() {
  const [t, clients, testimonials] = await Promise.all([
    getTranslations("clientes"),
    getClients(),
    getTestimonials(),
  ]);

  return (
    <section
      id="clientes"
      data-section="clientes"
      className="relative bg-bg1 py-section"
    >
      <div className="wrap">
        <div {...reveal()} className="mx-auto max-w-sh text-center">
          <Eyebrow centered className="mb-6">
            {t("eyebrow")}
          </Eyebrow>
          <h2 className="text-title font-light">{t.rich("title", rich)}</h2>
        </div>

        {/* .wall: one-off gaps clamp(30px,5vw,72px), 30px 40px ≤820. */}
        <ul
          {...reveal(1)}
          className="mt-[52px] flex flex-wrap items-center justify-center gap-x-[40px] gap-y-[30px] border-y border-line py-[44px] nav:gap-[clamp(30px,5vw,72px)]"
        >
          {clients.map((client) =>
            client.logo ? (
              <li key={client.id} className={cn(SLOT, "group items-center")}>
                <ClientLogo
                  name={client.name}
                  logo={client.logo}
                  className="opacity-50 [transition:opacity_.5s_var(--ease-fotmark),transform_.5s_var(--ease-fotmark)] group-hover:[transform:scale(1.04)] group-hover:opacity-95"
                />
              </li>
            ) : (
              // `.lg.txt`: a client without a logo is set as its name + tagline.
              <li
                key={client.id}
                className={cn(
                  SLOT,
                  "flex-col items-center justify-center text-center text-[length:clamp(17px,1.85vw,25px)] leading-[1.1] font-normal tracking-[.13em] text-ink opacity-50 [transition:opacity_.5s] hover:opacity-95",
                )}
              >
                {client.name}
                {client.tagline && (
                  <small className="mt-[4px] block text-center text-[8.5px] font-normal tracking-[.28em] text-mut">
                    {client.tagline}
                  </small>
                )}
              </li>
            ),
          )}
        </ul>

        {/* .tg: 1px gaps over a --line background draw the hairlines. */}
        <div className="mt-[80px] grid grid-cols-1 gap-px border border-line bg-line nav:grid-cols-2 wide:grid-cols-3">
          {testimonials.map((testimonial, i) => (
            <TestimonialCard
              key={testimonial.id}
              testimonial={testimonial}
              delay={ROW_DELAYS[i % 3]}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
