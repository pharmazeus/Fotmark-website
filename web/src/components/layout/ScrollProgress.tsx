"use client";

import { useEffect, useRef } from "react";

// Gold reading-progress bar. Scales on X instead of animating width (design-system §10.6).
export function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = bar.current;
    if (!el) return;
    const update = () => {
      const root = document.documentElement;
      const max = root.scrollHeight - window.innerHeight;
      el.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div
      ref={bar}
      data-progress=""
      aria-hidden="true"
      // One-off from the prototype `.prog`: gradient and glow. The scale lives in `transform`
      // (set inline on scroll); Tailwind's `scale-x-*` writes the separate `scale` property.
      className="fixed top-0 left-0 z-2100 h-0.5 w-full origin-left [transform:scaleX(0)] bg-[linear-gradient(90deg,var(--accd),var(--acc2))] shadow-[0_0_12px_var(--prog-glow)] transition-transform duration-100 ease-linear"
    />
  );
}
