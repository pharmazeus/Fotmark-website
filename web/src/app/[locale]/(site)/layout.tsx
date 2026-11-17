import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { RevealObserver } from "@/components/layout/RevealObserver";
import { ScrollProgress } from "@/components/layout/ScrollProgress";

// The site's chrome. The route group keeps URLs unchanged; pages outside it (the `/qr`
// business card) get only the locale layout: html, fonts, theme, skip link, grain.
export default function SiteLayout({ children }: LayoutProps<"/[locale]">) {
  return (
    <>
      <ScrollProgress />
      <Header />
      {children}
      <Footer />
      <RevealObserver />
    </>
  );
}
