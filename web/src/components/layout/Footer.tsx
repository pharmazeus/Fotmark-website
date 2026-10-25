import { getLocale, getTranslations } from "next-intl/server";
import { Monogram } from "@/components/brand/Monogram";
import { contactHrefs } from "@/lib/contact";
import { BRAND } from "@/lib/site";
import type { Locale } from "@/i18n/routing";
import { getLocalizedPath } from "@/lib/seo";
import { getSettings } from "@/sanity/fetch";

// Evaluated when the page is prerendered, so a rebuild keeps the © year current.
const YEAR = new Date().getFullYear();

// `.f-col a` / `.f-col span`. The prototype's `.mut` on the spans loses to `.f-col span`
// (higher specificity), so they render ink2 like the links.
const item = "mb-[11px] block text-[14px] text-ink2";
const link = `${item} [transition:color_.3s] hover:text-acc`;
// The prototype's `.f-col h5` as `<h2>`: same look, no skipped heading levels. The h1–h4
// base reset sets line-height 1.05, so the h5's inherited 1.6 is set explicitly.
const heading =
  "mb-[18px] text-[10px] leading-[1.6] font-normal tracking-[.24em] text-dim uppercase";

// Prototype `<footer>` (`/* FOOTER */`): brand + tagline, three link columns, bottom row.
// Phone, email, founder, address, location and socials are CMS facts (settings); only
// labels are copy. No reveal. Columns: 4 (>1080), 2 (821–1080), 1 (≤820).
export async function Footer() {
  const locale = (await getLocale()) as Locale;
  const [t, settings] = await Promise.all([
    getTranslations("footer"),
    getSettings(locale),
  ]);
  const href = contactHrefs(settings);

  return (
    <footer data-section="footer">
      <div
        data-parity-section="footer"
        className="border-t border-line pt-[70px] pb-[40px]"
      >
        <div className="wrap">
          <div className="grid grid-cols-1 gap-[34px] border-b border-line pb-[52px] nav:grid-cols-2 wide:grid-cols-[1.4fr_1fr_1fr_1fr] wide:gap-[40px]">
            <div>
              <div className="mb-[20px] flex items-center gap-[12px]">
                {/* max-w-full: the prototype's `img{max-width:100%}` */}
                <Monogram className="w-[26px] max-w-full text-monogram" />
                {/* One-off brand size (header 20px, hero clamp); Cormorant only for FOTMARK (D-003). */}
                <span className="font-serif text-[22px] font-medium tracking-[.3em]">
                  {BRAND}
                </span>
              </div>
              <p className="max-w-[280px] text-[16px] leading-[1.6] font-light text-mut">
                {t("tagline")}
              </p>
            </div>
            <div>
              <h2 className={heading}>{t("contact")}</h2>
              <a href={href.tel} className={link}>
                {settings.phone}
              </a>
              <a href={href.email} className={link}>
                {settings.email}
              </a>
              <span className={item}>
                {t("founder", { name: settings.founder })}
              </span>
            </div>
            <div>
              <h2 className={heading}>{t("location")}</h2>
              {settings.address.map((line) => (
                <span key={line} className={item}>
                  {line}
                </span>
              ))}
            </div>
            <div>
              <h2 className={heading}>{t("social")}</h2>
              <a
                href={href.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className={link}
              >
                {t("instagram")}
              </a>
              <a
                href={href.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className={link}
              >
                {t("whatsapp")}
              </a>
              <a href={href.email} className={link}>
                {t("email")}
              </a>
            </div>
          </div>
          <div className="mt-[30px] flex flex-wrap justify-between gap-[20px] text-fine tracking-[.1em] text-dim">
            <span>{t("copyright", { year: YEAR })}</span>
            <span>{settings.location}</span>
          </div>
        </div>
      </div>
      <nav
        aria-label={t("legal")}
        className="wrap mt-7 flex flex-wrap gap-x-6 gap-y-3 pb-[40px] text-fine tracking-[.1em] text-dim"
      >
        <a
          className="link-underline"
          href={getLocalizedPath(locale, "aviso-legal")}
        >
          {t("legalNotice")}
        </a>
        <a
          className="link-underline"
          href={getLocalizedPath(locale, "privacidad")}
        >
          {t("privacy")}
        </a>
        <a
          className="link-underline"
          href={getLocalizedPath(locale, "cookies")}
        >
          {t("cookies")}
        </a>
      </nav>
    </footer>
  );
}
