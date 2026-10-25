import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// tailwind-merge must know our @theme scales (globals.css), or it reads `text-nav`
// as a colour and drops it next to `text-ink2`. Keep these lists in sync with @theme.
const twMerge = extendTailwindMerge({
  override: {
    theme: {
      color: [
        "bg",
        "bg1",
        "bg2",
        "bg3",
        "ink",
        "ink2",
        "mut",
        "dim",
        "acc",
        "acc2",
        "accd",
        "line",
        "line2",
        "wordmark",
        "wordmark-sub",
        "monogram",
        "on-acc",
        "header-bg",
        "transparent",
      ],
      text: [
        "wm",
        "descriptor",
        "tagline",
        "hero-loc",
        "cue",
        "intro",
        "title",
        "cta",
        "enfoque",
        "sector",
        "service",
        "lead",
        "marquee",
        "eyebrow",
        "nav",
        "brand",
        "menu",
        "menu-foot",
        "index",
        "card",
        "desc",
        "micro",
        "body-lg",
        "label",
        "fine",
      ],
      tracking: ["label"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
