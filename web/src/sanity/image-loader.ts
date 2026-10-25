import type { ImageLoaderProps } from "next/image";

// Client-safe on purpose: no imports besides a type. Anything importing `@/env` or
// `@sanity/image-url` (see image.ts) would ship them to the browser.

// Photo quality is the priority (D-012): never below q85, whatever a call site passes.
export const MIN_IMAGE_QUALITY = 85;
export const DEFAULT_IMAGE_QUALITY = 90;

const SANITY_CDN_HOST = "cdn.sanity.io";

/**
 * `next/image` loader for Sanity CDN URLs (as built by `urlFor()` / `resolveImage()`).
 * Width comes from next/image; the CDN resizes without upscaling (`fit=max`), serves
 * AVIF/WebP when the browser accepts it (`auto=format`) and re-encodes, which also drops
 * EXIF/GPS from the derivative. Existing params (e.g. the `rect` crop) are kept.
 */
export function sanityImageLoader({
  src,
  width,
  quality,
}: ImageLoaderProps): string {
  const url = new URL(src);
  if (url.hostname !== SANITY_CDN_HOST) return src;
  const q = Math.min(
    100,
    Math.max(MIN_IMAGE_QUALITY, Math.round(quality ?? DEFAULT_IMAGE_QUALITY)),
  );
  url.searchParams.set("w", String(Math.round(width)));
  url.searchParams.set("q", String(q));
  url.searchParams.set("auto", "format");
  url.searchParams.set("fit", "max");
  return url.toString();
}
