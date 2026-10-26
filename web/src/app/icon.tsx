import { brandIcon } from "@/components/brand/brand-icon";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return brandIcon(size, 52);
}
