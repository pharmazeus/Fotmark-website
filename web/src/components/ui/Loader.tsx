import { cn } from "@/lib/cn";

type Props = { className?: string };

// Photo loading mark in the hero cue's language: a 1px `--line2` hairline with a gold
// segment running across it (D-041). Decorative; with reduced motion it's a static gold line.
// Callers size and place it, and unmount it once the photo has loaded.
export function Loader({ className }: Props) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "pointer-events-none block h-px w-[64px] animate-loader overflow-hidden bg-line2 after:block after:h-full after:w-full after:animate-loader-run after:bg-acc",
        className,
      )}
    />
  );
}
