import { useEffect, useState } from "react";

// The prototype re-lays out 140ms after the last `resize`.
const DEBOUNCE_MS = 140;

// Width of `element` (`clientWidth`, as the prototype reads it). `initial` is used for the
// server render and until the first measurement, which is applied at once; later resizes
// are debounced. While `paused` the observer is off, and it measures again on resume.
export function useContainerWidth(
  element: HTMLElement | null,
  initial: number,
  paused = false,
): number {
  const [width, setWidth] = useState(initial);

  useEffect(() => {
    if (!element || paused) return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    let measured = false;
    const apply = () => {
      // A hidden element reports 0: keep the last layout (the prototype's `if(!w) return`).
      if (element.clientWidth > 0) setWidth(element.clientWidth);
    };

    const observer = new ResizeObserver(() => {
      clearTimeout(timer);
      if (measured) timer = setTimeout(apply, DEBOUNCE_MS);
      else {
        measured = true;
        apply();
      }
    });
    observer.observe(element);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [element, paused]);

  return width;
}
