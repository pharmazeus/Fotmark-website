import { getLocale, getTranslations } from "next-intl/server";
import { Monogram } from "@/components/brand/Monogram";
import { BRAND, NAV_SECTIONS } from "@/lib/site";
import type { Locale } from "@/i18n/routing";
import { getSettings } from "@/sanity/fetch";
import { HeaderControls } from "./HeaderControls";
import { HeaderClient } from "./HeaderClient";

export async function Header() {
  const locale = (await getLocale()) as Locale;
  const [t, settings] = await Promise.all([
    getTranslations(),
    getSettings(locale),
  ]);

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
      controls={
        <HeaderControls
          locale={locale}
          labels={{
            language: t("a11y.languageSwitcher"),
            theme: {
              toggle: t("a11y.themeToggle"),
              dark: t("a11y.switchToDark"),
              light: t("a11y.switchToLight"),
            },
          }}
        />
      }
      labels={{
        home: t("a11y.home"),
        nav: t("a11y.mainNav"),
        open: t("a11y.openMenu"),
        close: t("a11y.closeMenu"),
      }}
    />
  );
}
