import "server-only";
import {
  createImageUrlBuilder,
  type SanityImageSource,
} from "@sanity/image-url";
import { env } from "@/env";

// Server-side URL building. For `next/image`, pass the URL to `sanityImageLoader`
// (image-loader.ts) or use <SanityImage> (SanityImage.tsx); import the loader from its own
// module in client code so `@/env` and the URL builder stay out of the browser bundle.

const builder = createImageUrlBuilder({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET,
});

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

type Crop = {
  top: number | null;
  bottom: number | null;
  left: number | null;
  right: number | null;
};

type ResolvableImage = {
  asset: {
    _id: string;
    metadata: {
      dimensions: { width: number; height: number } | null;
    } | null;
  } | null;
  crop?: Crop | null;
} | null;

export type ResolvedImage = {
  // Un-resized CDN URL (carries `rect=` when the editor cropped); next/image adds the width.
  url: string;
  // Intrinsic size after the editor's crop, so width / height is the ratio that is displayed.
  width: number;
  height: number;
};

/**
 * One image from a query result → what a component needs. Returns null when the asset or its
 * dimensions are missing (a broken or half-uploaded document), so callers can skip it.
 */
export function resolveImage(image: ResolvableImage): ResolvedImage | null {
  const asset = image?.asset;
  const dimensions = asset?.metadata?.dimensions;
  if (!asset || !dimensions) return null;

  const crop = image?.crop;
  const left = Math.round((crop?.left ?? 0) * dimensions.width);
  const top = Math.round((crop?.top ?? 0) * dimensions.height);
  // Same rounding as @sanity/image-url, so the URL's rect and these numbers agree.
  const width = Math.round(
    dimensions.width - (crop?.right ?? 0) * dimensions.width - left,
  );
  const height = Math.round(
    dimensions.height - (crop?.bottom ?? 0) * dimensions.height - top,
  );
  if (width <= 0 || height <= 0) return null;

  const source: SanityImageSource = crop
    ? {
        asset: { _ref: asset._id },
        crop: {
          top: crop.top ?? 0,
          bottom: crop.bottom ?? 0,
          left: crop.left ?? 0,
          right: crop.right ?? 0,
        },
      }
    : { asset: { _ref: asset._id } };

  return {
    url: urlFor(source).url(),
    width,
    height,
  };
}
