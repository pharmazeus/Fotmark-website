import { cn } from "@/lib/cn";
import { SanityImage } from "@/sanity/SanityImage";

type Props = {
  name: string;
  logo: { url: string; width: number; height: number };
  // The tallest the slot gets, in CSS px (wall `clamp(46px,5.2vw,72px)` → 72, testimonial
  // `h-[40px]` → 40). With the logo's ratio it gives the width the browser should pick from.
  maxHeight: number;
  // Testimonial logos repeat the name printed next to them (`alt=""` in the prototype).
  decorative?: boolean;
  className?: string;
};

// A client logo at the height its slot gives it (`h-full`) and its intrinsic aspect ratio,
// like the prototype's `img{height:100%;width:auto;object-fit:contain}`. The wall's logo
// is the client's name for assistive tech; a testimonial's is decorative. The logos are
// cream on transparent: `.client-logo` turns them black in the light theme (design-system §2.3).
// No LQIP: a blurred placeholder of a transparent logo would flash a box.
export function ClientLogo({
  name,
  logo,
  maxHeight,
  decorative,
  className,
}: Props) {
  return (
    <SanityImage
      image={logo}
      alt={decorative ? "" : name}
      sizes={`${Math.ceil((maxHeight * logo.width) / logo.height)}px`}
      className={cn(
        "block h-full w-auto object-contain client-logo",
        className,
      )}
    />
  );
}
