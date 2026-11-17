"use client";

import { useEffect } from "react";

const PENDING = "[data-reveal]:not([data-in])";
// The prototype's `threshold: .14`. A block taller than ~7 screens (the gallery grid on a
// phone) can never show 14% of itself, so it also counts as in view once it fills 14% of
// the viewport. Steps of 1% make the observer report while such a block scrolls in.
const SHARE = 0.14;
const THRESHOLDS = Array.from({ length: 15 }, (_, step) => step / 100);

// One IntersectionObserver for every `[data-reveal]` block (prototype `.rv`): adds
// `data-in` the first time a block enters the viewport. A MutationObserver picks up
// blocks added later (client navigation, live CMS refreshes), so none stays hidden.
export function RevealObserver() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const rootHeight = entry.rootBounds?.height ?? window.innerHeight;
          const inView =
            entry.intersectionRatio >= SHARE ||
            entry.intersectionRect.height >= SHARE * rootHeight;
          if (!inView) continue;
          entry.target.setAttribute("data-in", "");
          io.unobserve(entry.target);
        }
      },
      { threshold: THRESHOLDS, rootMargin: "0px 0px -8% 0px" },
    );
    const observe = (root: ParentNode) =>
      root.querySelectorAll(PENDING).forEach((el) => io.observe(el));

    observe(document);
    const mo = new MutationObserver((records) => {
      for (const record of records)
        for (const node of record.addedNodes) {
          if (!(node instanceof Element)) continue;
          if (node.matches(PENDING)) io.observe(node);
          observe(node);
        }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      io.disconnect();
    };
  }, []);

  return null;
}
