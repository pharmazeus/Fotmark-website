import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  children: ReactNode;
  // Prototype `.eyebrow.c`: a dash on both sides, for centred section heads.
  centered?: boolean;
  className?: string;
};

export function Eyebrow({ children, centered, className }: Props) {
  return (
    <div className={cn("eyebrow", centered && "eyebrow-c", className)}>
      {children}
    </div>
  );
}
