import { reveal, type RevealDelay } from "@/components/ui/reveal";
import { cn } from "@/lib/cn";
import type { Testimonial } from "@/sanity/content-types";
import { ClientLogo } from "./ClientLogo";

type Props = {
  testimonial: Testimonial;
  delay?: RevealDelay;
};

// Prototype `.tcard`. Its own `transition:background .5s` overrides `.rv`, so the card
// appears without the fade (Q-25). Longhands, not the shorthand: the `.d1`/`.d2`
// transition-delay still applies to the hover, as it does in the prototype.
export function TestimonialCard({ testimonial, delay }: Props) {
  const { quote, client, subtitle } = testimonial;
  // No logo (DJ Levitt): no logo slot, and the name is set larger and in its own case
  // (the prototype's inline `font-size:17px;letter-spacing:.06em;text-transform:none`).
  const textOnly = client.logo === null;

  return (
    <figure
      {...reveal(delay)}
      className="flex flex-col bg-bg1 p-[clamp(34px,3.4vw,50px)] transition-[background] duration-500 hover:bg-bg2"
    >
      {/* .qm: decorative opening mark. */}
      <div
        aria-hidden="true"
        className="mb-[20px] text-[60px] leading-[.6] text-acc opacity-40"
      >
        “
      </div>
      {/* .q */}
      <blockquote className="mb-[32px] flex-1 text-[length:clamp(17px,1.6vw,20px)] leading-[1.7] font-light text-ink">
        {quote}
      </blockquote>
      {/* .who */}
      <figcaption className="flex items-center gap-[16px]">
        {client.logo && (
          <div className="flex h-[40px] shrink-0 items-center">
            <ClientLogo
              name={client.name}
              logo={client.logo}
              maxHeight={40}
              decorative
              className="opacity-75"
            />
          </div>
        )}
        <div
          className={cn(
            "text-ink",
            textOnly
              ? "text-[17px] tracking-[.06em]"
              : "text-label tracking-label uppercase",
          )}
        >
          {client.name}
          <small className="mt-[4px] block text-fine tracking-[.06em] text-dim normal-case">
            {subtitle}
          </small>
        </div>
      </figcaption>
    </figure>
  );
}
