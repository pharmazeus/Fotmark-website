import { cn } from "@/lib/cn";

type Props = {
  name: string;
  logo: { width: number; height: number };
  // Testimonial logos repeat the name printed next to them (`alt=""` in the prototype).
  decorative?: boolean;
  className?: string;
};

// A client logo at the height its slot gives it (`h-full`) and its intrinsic aspect ratio,
// like the prototype's `img{height:100%;width:auto;object-fit:contain}`.
// TODO(sanity): the logo files arrive with Sanity (Step 3). Until then this is an empty box
// of the logo's size; swap it for `next/image` + the Sanity loader with the same classes.
export function ClientLogo({ name, logo, decorative, className }: Props) {
  return (
    <span
      {...(decorative
        ? { "aria-hidden": true }
        : { role: "img", "aria-label": name })}
      className={cn("block h-full w-auto object-contain", className)}
      style={{ aspectRatio: `${logo.width} / ${logo.height}` }}
    />
  );
}
