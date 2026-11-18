import { useEffect, type RefObject } from "react";

// Space left between the fixed header and the field's label after a correction.
const GAP = 16;
// The keyboard opens within ~0.5s. Viewport changes after this window come from the person
// scrolling (the toolbars collapse) and must not pull the page back to the field.
const SETTLE_MS = 1200;
const FALLBACK_MS = 450;
const DEBOUNCE_MS = 80;

const CONTROL = "input:not([type='hidden']), textarea";

export type Visible = { top: number; bottom: number };

// What the person can really see, in layout-viewport coordinates (getBoundingClientRect's):
// the visual viewport (the keyboard shrinks it and WebKit pans it) minus the fixed header.
export function visibleArea(
  viewport: { offsetTop: number; height: number } | null,
  innerHeight: number,
  headerBottom: number,
): Visible {
  const top = viewport?.offsetTop ?? 0;
  const bottom = top + (viewport?.height ?? innerHeight);
  return { top: Math.max(top, headerBottom), bottom };
}

// How far to scroll so the field is visible, or 0 when it already is. `box` is what should
// show (the label and the field), `caret` the part that must not hide behind the keyboard.
export function scrollDelta(
  box: { top: number },
  caret: { top: number; bottom: number },
  visible: Visible,
): number {
  const caretBottom = Math.min(caret.bottom, caret.top + 64);
  if (box.top >= visible.top && caretBottom <= visible.bottom) return 0;
  return box.top - (visible.top + GAP);
}

// When a field takes focus, phones scroll it "into view" without knowing about the fixed
// header, and WebKit (Safari and every iOS browser, Chrome included) can land the page
// somewhere else entirely. While the keyboard opens, this checks what the person can see
// and, only if the field is hidden, scrolls so its label sits just under the header. A
// visible field is left alone, so it never fights a browser that got it right.
export function useKeepFieldInView(formRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    const viewport = window.visualViewport;
    let until = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const reveal = () => {
      const field = document.activeElement;
      if (!(field instanceof HTMLElement) || !form.contains(field)) return;
      if (!field.matches(CONTROL)) return;

      // A checkbox only needs its own chip; a typed field brings its label along.
      const box =
        field instanceof HTMLInputElement && field.type === "checkbox"
          ? (field.closest("label") ?? field)
          : (field.closest("[data-field]") ?? field);
      const header = document.getElementById("hd")?.getBoundingClientRect();
      const delta = scrollDelta(
        box.getBoundingClientRect(),
        field.getBoundingClientRect(),
        visibleArea(viewport ?? null, window.innerHeight, header?.bottom ?? 0),
      );
      if (delta) window.scrollBy({ top: delta, behavior: "instant" });
    };

    const schedule = (delay: number) => {
      clearTimeout(timer);
      timer = setTimeout(reveal, delay);
    };
    const onFocus = (event: FocusEvent) => {
      if (!(event.target instanceof HTMLElement)) return;
      if (!event.target.matches(CONTROL)) return;
      until = performance.now() + SETTLE_MS;
      // No viewport change when the keyboard is already open (moving between fields), on
      // desktop, or after the validation focus.
      schedule(FALLBACK_MS);
    };
    // The keyboard resizing the viewport, or WebKit panning it late: check again each time
    // it settles. `reveal` does nothing while the field is visible.
    const onViewportChange = () => {
      if (performance.now() < until) schedule(DEBOUNCE_MS);
    };

    form.addEventListener("focusin", onFocus);
    viewport?.addEventListener("resize", onViewportChange);
    viewport?.addEventListener("scroll", onViewportChange);
    return () => {
      clearTimeout(timer);
      form.removeEventListener("focusin", onFocus);
      viewport?.removeEventListener("resize", onViewportChange);
      viewport?.removeEventListener("scroll", onViewportChange);
    };
  }, [formRef]);
}
