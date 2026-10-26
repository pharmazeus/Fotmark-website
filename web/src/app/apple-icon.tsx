import { brandIcon } from "@/components/brand/brand-icon";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// iOS rounds the corners itself, so the glyph keeps a wider margin than the favicon's.
export default function AppleIcon() {
  return brandIcon(size, 120);
}
