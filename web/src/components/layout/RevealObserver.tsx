"use client";

import { useEffect } from "react";

const PENDING = "[data-reveal]:not([data-in])";

// One IntersectionObserver for every `[data-reveal]` block (prototype `.rv`): adds
// `data-in` the first time a block enters the viewport. A MutationObserver picks up
// blocks added later (client navigation, live CMS refreshes), so none stays hidden.
export function RevealObserver() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-in", "");
          io.unobserve(entry.target);
        }
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" },
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
