// Document types the site reads, each the cache tag of its queries in fetch.ts. The publish
// webhook revalidates the tag of the changed document's `_type` (D-039).
export const REVALIDATE_TAGS = [
  "settings",
  "category",
  "portfolioItem",
  "client",
  "testimonial",
  "service",
] as const;

export function tagsForDocumentType(type: unknown): string[] {
  return REVALIDATE_TAGS.includes(type as (typeof REVALIDATE_TAGS)[number])
    ? [type as string]
    : [];
}
