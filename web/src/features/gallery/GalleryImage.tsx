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
export function GalleryImage({ photo, variant, className }: Props) {
  const { image, aspectRatio, alt } = photo;

  if (variant === "cell") {
    // The span reserves the cell's box before the photo arrives (flat `bg-bg3`, as the prototype's `.cell`).
    return (
      <span
        className={cn("block w-full bg-bg3", className)}
        style={{ aspectRatio }}
      >
        <SanityImage
          image={image}
          alt={alt}
          sizes={CELL_SIZES}
          className="block h-full w-full object-cover [filter:saturate(.94)_brightness(.94)] [transition:transform_.9s_var(--ease-fotmark),filter_.6s] group-hover:[transform:scale(1.06)] group-hover:[filter:saturate(1.05)_brightness(1)]"
        />
      </span>
    );
  }

  return (
    <SanityImage
      image={image}
      alt={alt}
      sizes={LIGHTBOX_SIZES}
      className={cn(
        "block h-auto max-h-[74vh] w-auto max-w-[94vw] object-contain lb:max-h-[82vh] lb:max-w-[88vw]",
        className,
      )}
    />
  );
}
