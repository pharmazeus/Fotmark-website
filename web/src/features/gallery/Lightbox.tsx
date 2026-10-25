"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";
import { GalleryImage } from "./GalleryImage";
import type { GalleryPhoto } from "./types";

export type LightboxLabels = {
  label: string;
  close: string;
  prev: string;
  next: string;
};

type Props = {
  open: boolean;
  // The photos the current filter shows, in order, and the one on screen.
  photos: readonly GalleryPhoto[];
  index: number;
  labels: LightboxLabels;
  onIndexChange: (index: number) => void;
  onClose: () => void;
};

// Controls: 1px `--line2` squares (`.lb-x`, `.lb-nav`) in the button's own font (weight 400,
// `line-height: normal`), each with the transition list it has in the prototype. The nav
// background uses `--lb-nav` / `--lb-nav-hover`, dark in both themes like `--lb-bg`.
const CONTROL =
  "absolute cursor-pointer border border-line2 font-glyph leading-[normal] font-normal text-ink hover:border-acc hover:text-acc";
const CLOSE =
  "top-[22px] right-[26px] size-11 text-[19px] leading-none [transition:border-color_.35s,color_.35s,transform_.35s] hover:[transform:rotate(90deg)]";
const NAV =
  "top-1/2 size-[42px] -translate-y-1/2 bg-(--lb-nav) text-[18px] [transition:border-color_.35s,color_.35s,background_.35s] hover:bg-(--lb-nav-hover) lb:size-[52px]";

// Prototype `.lb`: full-screen photo viewer, as a native modal `<dialog>`. `open` is the
// state and the dialog follows it; Esc closes it natively and its `close` event reports
// back. Focus is trapped inside and returns to the cell that opened it. The fade in and
// out is CSS only (`@starting-style` + discrete `display` / `overlay` transitions).
export function Lightbox({
  open,
  photos,
  index,
  labels,
  onIndexChange,
  onClose,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  // A modal dialog doesn't stop the page behind it from scrolling.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const count = photos.length;
  const photo = photos[index];
  const go = (to: number) => {
    if (count > 0) onIndexChange((to + count) % count);
  };

  return (
    <dialog
      ref={dialogRef}
      aria-label={labels.label}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) dialogRef.current?.close();
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") go(index - 1);
        else if (event.key === "ArrowRight") go(index + 1);
      }}
      className="group/lb m-0 size-full max-h-none max-w-none items-center justify-center overflow-hidden border-0 bg-(--lb-bg) p-0 text-ink opacity-0 backdrop-blur-[14px] transition-[opacity,display,overlay] transition-discrete duration-[450ms] ease-fotmark backdrop:bg-transparent open:flex open:opacity-100 starting:open:opacity-0"
    >
      {/* The photo comes first in the DOM so the controls paint above it: its `transform`
          makes it a stacking layer, and in the prototype (photo after the ← button) the photo
          covers that button at ≤700px, where it is 94vw wide. Tab order is unchanged. */}
      {photo && (
        <GalleryImage
          key={photo.id}
          photo={photo}
          variant="lightbox"
          className="[transform:scale(.97)] [box-shadow:var(--lb-shadow)] [transition:transform_.45s_var(--ease-fotmark),opacity_.3s] group-open/lb:[transform:scale(1)]"
        />
      )}
      <button
        type="button"
        aria-label={labels.close}
        onClick={() => dialogRef.current?.close()}
        className={cn(CONTROL, CLOSE)}
      >
        ✕
      </button>
      <button
        type="button"
        aria-label={labels.prev}
        onClick={() => go(index - 1)}
        className={cn(CONTROL, NAV, "left-[10px] lb:left-[26px]")}
      >
        ←
      </button>
      <button
        type="button"
        aria-label={labels.next}
        onClick={() => go(index + 1)}
        className={cn(CONTROL, NAV, "right-[10px] lb:right-[26px]")}
      >
        →
      </button>
      <div
        aria-live="polite"
        className="absolute inset-x-0 bottom-[26px] text-center text-micro tracking-[.28em] text-mut uppercase"
      >
        {photo?.caption}
        <b className="ml-[14px] font-normal text-acc">
          {index + 1} / {count}
        </b>
      </div>
    </dialog>
  );
}
