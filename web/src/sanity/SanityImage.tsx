"use client";

import Image, { type ImageProps } from "next/image";
import { sanityImageLoader } from "./image-loader";

type Props = Omit<
  ImageProps,
  "loader" | "src" | "width" | "height" | "placeholder" | "blurDataURL" | "fill"
> & {
  // A `ResolvedImage` (image.ts) as returned by the data-access functions.
  image: { url: string; width: number; height: number };
};

// `next/image` is a Client Component, so a loader function cannot be passed to it from a
// Server Component. This thin wrapper holds the loader instead: render it from anywhere.
// Pass `sizes` for every use, and `preload` for the one above-the-fold image at most.
export function SanityImage({ image, alt, quality, ...props }: Props) {
  return (
    <Image
      {...props}
      alt={alt}
      loader={sanityImageLoader}
      src={image.url}
      width={image.width}
      height={image.height}
      quality={quality}
    />
  );
}
