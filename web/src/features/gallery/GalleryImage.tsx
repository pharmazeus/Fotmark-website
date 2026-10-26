"use client";

import { useState } from "react";
import { Loader } from "@/components/ui/Loader";
import { cn } from "@/lib/cn";
import { SanityImage } from "@/sanity/SanityImage";
import type { GalleryPhoto } from "./types";

type Props = {
  photo: Pick<GalleryPhoto, "image" | "aspectRatio" | "alt">;
  // `cell`: fills a grid cell (prototype `.cell img`). `lightbox`: the enlarged photo
  // (`.lb-img`, 88vw × 82vh, 94vw × 74vh up to 700px).
  variant: "cell" | "lightbox";
  className?: string;
};

// Hint for the browser's srcset choice; the columns are 4 / 3 / 2 by container width.
const CELL_SIZES = "(min-width: 1081px) 25vw, (min-width: 701px) 33vw, 50vw";
const LIGHTBOX_SIZES = "(min-width: 701px) 88vw, 94vw";

// The photo element, through the Sanity loader (q ≥ 85, `auto=format`, the editor's crop kept).
// Both variants carry the intrinsic size; no LQIP, the cell is flat `--bg3` while loading (D-039). Nothing is
// `preload`ed: the gallery is far below the fold, so `next/image` lazy-loads every cell,
// and the lightbox photo (inside the closed `<dialog>`) loads when it opens.
// Until the photo arrives a `Loader` runs (D-041). The lightbox keys this per photo, so the
// state starts over on every step.
export function GalleryImage({ photo, variant, className }: Props) {
  const { image, aspectRatio, alt } = photo;
  // `next/image` also reports photos that finished before hydration. A failed photo ends
  // the loader too and shows its alt.
  const [loaded, setLoaded] = useState(false);
  const done = () => setLoaded(true);

  if (variant === "cell") {
    // The span reserves the cell's box before the photo arrives (flat `bg-bg3`, as the prototype's `.cell`).
    // The photo is positioned so it paints over the loader even before hydration removes it.
    return (
      <span
        className={cn("relative block w-full bg-bg3", className)}
        style={{ aspectRatio }}
      >
        {loaded ? null : (
          <Loader className="absolute top-1/2 left-1/2 w-[40px] -translate-x-1/2" />
        )}
        <SanityImage
          image={image}
          alt={alt}
          sizes={CELL_SIZES}
          onLoad={done}
          onError={done}
          className="relative block h-full w-full object-cover [filter:saturate(.94)_brightness(.94)] [transition:transform_.9s_var(--ease-fotmark),filter_.6s] group-hover:[transform:scale(1.06)] group-hover:[filter:saturate(1.05)_brightness(1)]"
        />
      </span>
    );
  }

  // The lightbox needs JS anyway, so its photo stays hidden until it has loaded and then
  // fades in; the loader sits in the middle of the dialog.
  return (
    <>
      {loaded ? null : (
        <Loader className="absolute top-1/2 left-1/2 -translate-x-1/2" />
      )}
      <SanityImage
        image={image}
        alt={alt}
        sizes={LIGHTBOX_SIZES}
        onLoad={done}
        onError={done}
        className={cn(
          "block h-auto max-h-[74vh] w-auto max-w-[94vw] object-contain lb:max-h-[82vh] lb:max-w-[88vw]",
          className,
          !loaded && "opacity-0",
        )}
      />
    </>
  );
}
