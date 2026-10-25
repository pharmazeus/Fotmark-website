import { getTranslations } from "next-intl/server";

const ITEMS = [
  "estrategia",
  "fotografia",
  "video",
  "dron",
  "redes",
  "publicidad",
  "branding",
] as const;

// Endless ticker: the run is rendered twice (with the prototype's space between) for the -50% loop.
export async function Marquee() {
  const t = await getTranslations("marquee");
  const run = ITEMS.map((key) => (
    <span key={key}>
      <span className="mx-2 text-marquee text-ink2">{t(key)}</span>
      <span className="mx-6 text-[.5em] text-acc">✦</span>
    </span>
  ));

  return (
    <div
      data-section="marquee"
      aria-hidden="true"
      className="overflow-hidden border-y border-line bg-bg1 py-5 whitespace-nowrap"
    >
      <div className="inline-block animate-marquee">
        {run} {run}
      </div>
    </div>
  );
}
