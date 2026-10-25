import type { Category, PortfolioItem } from "@/sanity/content-types";

// The gallery renders what `getPortfolio(locale)` / `getCategories(locale)` return
// (architecture.md §4). Text is already in the page locale; `aspectRatio` is the ratio of the
// displayed (cropped) image.
export type GalleryPhoto = PortfolioItem;
export type GalleryCategory = Category;
