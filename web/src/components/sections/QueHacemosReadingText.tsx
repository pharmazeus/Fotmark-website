"use client";

import { useEffect, useRef } from "react";

type Props = {
  text: string;
};

// The replacement artifact lights up words as the paragraph crosses the viewport.
// Direct DOM attributes keep the scroll path out of React's render cycle.
export function QueHacemosReadingText({ text }: Props) {
  const paragraphRef = useRef<HTMLParagraphElement>(null);
  const words = text.trim().split(/\s+/);

  useEffect(() => {
    const paragraph = paragraphRef.current;
    if (!paragraph) return;

    const wordElements = Array.from(
      paragraph.querySelectorAll<HTMLElement>("[data-reading-word]"),
    );
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    const update = () => {
      frame = 0;
      if (reducedMotion.matches) return;

      const rect = paragraph.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const progress = Math.max(
        0,
        Math.min(
          1,
          (viewportHeight * 0.85 - rect.top) /
            (rect.height + viewportHeight * 0.35),
        ),
      );
      const activeCount = Math.round(progress * wordElements.length);

      wordElements.forEach((word, index) => {
        word.toggleAttribute("data-on", index < activeCount);
      });
    };

    const scheduleUpdate = () => {
      if (!frame && !reducedMotion.matches) {
        frame = window.requestAnimationFrame(update);
      }
    };

    const syncMotionPreference = () => {
      if (reducedMotion.matches) {
        paragraph.removeAttribute("data-enhanced");
        wordElements.forEach((word) => word.removeAttribute("data-on"));
        if (frame) window.cancelAnimationFrame(frame);
        frame = 0;
        return;
      }

      paragraph.setAttribute("data-enhanced", "");
      scheduleUpdate();
    };

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    reducedMotion.addEventListener("change", syncMotionPreference);
    syncMotionPreference();

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      reducedMotion.removeEventListener("change", syncMotionPreference);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [text]);

  return (
    <p
      ref={paragraphRef}
      className="-mt-[6px] max-w-[880px] text-[length:clamp(21px,2.5vw,34px)] leading-[1.42] font-light tracking-[-.012em] qh-reading text-ink"
    >
      {words.map((word, index) => (
        <span key={`${word}-${index}`}>
          <span data-reading-word>{word}</span>
          {index < words.length - 1 ? " " : null}
        </span>
      ))}
    </p>
  );
}
