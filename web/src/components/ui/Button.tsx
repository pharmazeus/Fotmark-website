import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

type Props = ComponentProps<"a"> & {
  variant?: keyof typeof VARIANTS;
  arrow?: boolean;
};

const VARIANTS = {
  default: "",
  // Prototype `.btn.solid`: gold border, kept on hover (it wins over `.btn:hover`).
  solid: "[--btn-border-hover:var(--acc)] [--btn-border:var(--acc)]",
};

// Prototype `.btn` as a link: hairline border, gold fill slides up on hover, arrow ↗ nudges.
export function Button({
  variant = "default",
  arrow = true,
  className,
  children,
  ...props
}: Props) {
  return (
    <a className={cn("btn", VARIANTS[variant], className)} {...props}>
      {children}
      {arrow && (
        <span className="ar font-glyph" aria-hidden="true">
          ↗
        </span>
      )}
    </a>
  );
}
