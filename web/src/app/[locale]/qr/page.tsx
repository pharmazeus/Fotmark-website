import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Monogram } from "@/components/brand/Monogram";
import { HeaderControls } from "@/components/layout/HeaderControls";
import { env } from "@/env";
import {
  AddContactIcon,
  GlobeIcon,
  InstagramIcon,
  MailIcon,
  PhoneIcon,
  WhatsAppIcon,
} from "@/features/card/icons";
import { cardRegion } from "@/features/card/vcard";
import { routing } from "@/i18n/routing";
import { contactHrefs } from "@/lib/contact";
import { buildMetadata, getLocalePath } from "@/lib/seo";
import { BRAND } from "@/lib/site";
import { getSettings } from "@/sanity/fetch";

// UTM convention for the printed card (seo.md §7): the QR lands here, the gold button
// carries the visit on to the site.
const SITE_UTM = "?utm_source=qr&utm_medium=print&utm_campaign=tarjeta";
const YEAR = new Date().getFullYear();
const SITE_HOST = new URL(env.NEXT_PUBLIC_SITE_URL).host;

const label = "text-micro font-normal tracking-[.32em] text-mut uppercase";
const action =
  "flex w-full items-center justify-center gap-[12px] px-[20px] text-label font-normal tracking-[.18em] uppercase transition-[color,background-color,border-color] duration-[400ms] ease-fotmark";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/qr">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "card" });
  return buildMetadata(
    locale,
    { title: `${BRAND} — ${t("title")}`, description: t("description") },
    { slug: "qr", noIndex: true },
  );
}

// The business card the printed QR opens (owner-approved mockup, 2026-11-16): brand lockup,
// the website as the main action, contact rows, "save contact" (vCard). No site chrome.
export default async function CardPage({ params }: PageProps<"/[locale]/qr">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const [t, hero, a11y, settings] = await Promise.all([
    getTranslations({ locale, namespace: "card" }),
    getTranslations({ locale, namespace: "hero" }),
    getTranslations({ locale, namespace: "a11y" }),
    getSettings(locale),
  ]);
  const href = contactHrefs(settings);
  const region = cardRegion(settings.location);

  const rows = [
    { key: "call", href: href.tel, value: settings.phone, Icon: PhoneIcon },
    {
      key: "instagram",
      href: href.instagram,
      value: settings.instagram,
      Icon: InstagramIcon,
      external: true,
    },
    {
      key: "whatsapp",
      href: href.whatsapp,
      value: settings.phone,
      Icon: WhatsAppIcon,
      external: true,
    },
    { key: "email", href: href.email, value: settings.email, Icon: MailIcon },
  ] as const;

  return (
    <main
      id="contenido"
      className="mx-auto grid max-w-[420px] gap-[34px] px-gut pt-[18px] pb-[40px]"
    >
      <div className="flex justify-end">
        <HeaderControls
          locale={locale}
          labels={{
            language: a11y("languageSwitcher"),
            theme: {
              toggle: a11y("themeToggle"),
              dark: a11y("switchToDark"),
              light: a11y("switchToLight"),
            },
          }}
        />
      </div>

      <header className="grid justify-items-center gap-[14px] pt-[6px] text-center">
        <Monogram className="w-[40px] text-monogram" />
        <h1 className="mr-[-.3em] font-serif text-[clamp(34px,11vw,46px)] leading-none font-medium tracking-[.3em] text-wordmark">
          {BRAND}
        </h1>
        <p className={label}>{hero("descriptor")}</p>
        <div
          aria-hidden="true"
          className="mt-[6px] mb-[2px] h-px w-[44px] bg-acc opacity-70"
        />
        <p className="text-[15.5px] leading-[1.75] text-balance text-ink2">
          {hero.rich("tagline", { br: () => <br /> })}
        </p>
        {region ? <p className={label}>{region}</p> : null}
      </header>

      <a
        href={`${getLocalePath(locale)}${SITE_UTM}`}
        className={`${action} border border-acc bg-acc py-[17px] text-on-acc hover:border-acc2 hover:bg-acc2`}
      >
        <GlobeIcon className="size-[18px] fill-none stroke-current stroke-[1.4]" />
        {t("website")}
      </a>

      <nav aria-label={t("links")} className="-mt-[10px]">
        <ul className="border-t border-line">
          {rows.map(({ key, href: rowHref, value, Icon, ...row }) => (
            <li key={key} className="border-b border-line">
              <a
                href={rowHref}
                {...("external" in row
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="group grid grid-cols-[22px_minmax(0,1fr)_auto] items-center gap-[16px] px-[2px] py-[16px]"
              >
                <Icon className="size-[18px] fill-none stroke-mut stroke-[1.3]" />
                <span className="grid min-w-0 gap-[2px]">
                  <span className={label}>{t(key)}</span>
                  <span className="text-[16px] [overflow-wrap:anywhere] text-ink transition-colors duration-300 group-hover:text-acc2">
                    {value}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className="font-glyph text-[20px] leading-none text-acc transition-transform duration-[400ms] ease-fotmark group-hover:translate-x-[4px]"
                >
                  →
                </span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <a
        href="/fotmark.vcf"
        className={`${action} border border-line2 py-[16px] text-ink hover:border-acc hover:text-acc2`}
      >
        <AddContactIcon className="size-[18px] fill-none stroke-current stroke-[1.3]" />
        {t("save")}
      </a>

      <footer className="grid justify-items-center gap-[6px] pt-[8px] text-fine tracking-[.14em] text-dim uppercase">
        <span>
          © {YEAR} {BRAND}
        </span>
        <span>{SITE_HOST}</span>
      </footer>
    </main>
  );
}
