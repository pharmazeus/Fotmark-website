import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/Button";
import {
  ContactForm,
  type ContactFormCopy,
} from "@/features/contact/ContactForm";
import { getLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getLocalizedPath } from "@/lib/seo";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { rich } from "@/components/ui/rich";
import { contactHrefs } from "@/lib/contact";
import { getServices, getSettings } from "@/sanity/fetch";

// The heading's <em> isn't gold: only `.title em` is, and `.cta h2` isn't `.title`.
const titleTags = {
  ...rich,
  em: (chunks: ReactNode) => <em>{chunks}</em>,
};

// Prototype `#contacto` (`/* CTA */`, "Hablemos"): a centred call to action over a
// 1100px radial glow rising from below (`.cta::before`). The block is `.wrap.in.rv`, and
// its `in` class is also the reveal's end state, so the prototype shows it without the
// fade. Ported as is: no reveal (Q-25, same as Enfoque). The email is a CMS fact
// (settings); the contact form replaces this mailto link later (Step 4).
export async function Contacto() {
  const locale = (await getLocale()) as Locale;
  const [t, form, services, settings] = await Promise.all([
    getTranslations("contacto"),
    getTranslations("form"),
    getServices(locale),
    getSettings(locale),
  ]);
  const contacts = contactHrefs(settings);
  const copy: ContactFormCopy = {
    title: form("title"),
    intro: form("intro"),
    name: form("fields.name"),
    contact: form("fields.contact"),
    businessType: form("fields.businessType"),
    service: form("fields.service"),
    servicePlaceholder: form("fields.servicePlaceholder"),
    message: form("fields.message"),
    consent: form("consent.text"),
    privacy: form("consent.link"),
    submit: form("submit"),
    sending: form("sending"),
    whatsapp: form("whatsapp"),
    statuses: {
      blocked: form("status.blocked"),
      unavailable: form("status.unavailable"),
      failed: form("status.failed"),
    },
    errors: {
      name: form("errors.name"),
      contact: form("errors.contact"),
      businessType: form("errors.businessType"),
      service: form("errors.service"),
      message: form("errors.message"),
      consent: form("errors.consent"),
    },
    services: Object.fromEntries(
      services.map(({ key, name }) => [key, name]),
    ) as ContactFormCopy["services"],
  };

  return (
    <section id="contacto" data-section="contacto">
      {/* Exact prototype CTA; the independent form begins after this parity target. */}
      <div
        data-parity-section="contacto"
        className="glow-cta relative overflow-hidden py-section text-center"
      >
        <div className="relative z-1 wrap">
          <Eyebrow centered className="mb-[28px]">
            {t("eyebrow")}
          </Eyebrow>
          <h2 className="text-cta font-light">{t.rich("title", titleTags)}</h2>
          <p className="mx-auto mt-[26px] max-w-[600px] text-body-lg leading-[1.85] text-ink2">
            {t("text")}
          </p>
          <span className="mt-[22px] block text-[length:clamp(17px,2vw,23px)] font-light text-acc2">
            {t("tagline")}
          </span>
          <div>
            {/* `.cta .btn` outranks the ≤820 `.btn` padding, so 19/46 holds at every width. */}
            <Button
              variant="solid"
              href="#formulario"
              className="mt-[44px] [--btn-px:46px] [--btn-py:19px]"
            >
              {t("button")}
            </Button>
          </div>
        </div>
      </div>
      <ContactForm
        locale={locale}
        privacyHref={getLocalizedPath(locale, "privacidad")}
        whatsappHref={contacts.whatsapp}
        copy={copy}
      />
    </section>
  );
}
