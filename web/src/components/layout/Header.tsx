import { getTranslations } from "next-intl/server";
import { Monogram } from "@/components/brand/Monogram";
import { getSettings } from "@/lib/settings-fallback";
import { BRAND, NAV_SECTIONS } from "@/lib/site";
import { HeaderClient } from "./HeaderClient";

export async function Header() {
  const [t, settings] = await Promise.all([getTranslations(), getSettings()]);

  return (
    <HeaderClient
      brand={
        <>
          {/* max-w-full: the prototype's `img{max-width:100%}` lets the brand shrink when the nav crowds it */}
          <Monogram className="w-[22px] max-w-full text-monogram opacity-95" />
          <span className="font-serif text-brand font-medium max-nav:text-[18px]">
            {BRAND}
          </span>
        </>
      }
      links={NAV_SECTIONS.map((id) => ({ id, label: t(`nav.${id}`) }))}
      menuFoot={[settings.location, settings.email, settings.instagram]}
      labels={{
        home: t("a11y.home"),
        nav: t("a11y.mainNav"),
        open: t("a11y.openMenu"),
        close: t("a11y.closeMenu"),
      }}
    />
  );
}
