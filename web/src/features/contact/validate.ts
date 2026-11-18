import { serviceKeys, type ContactField, type ContactValues } from "./model";

// Shared by the Zod schema (server) and the browser check, so both accept the same numbers.
export const PHONE_PATTERN = /^[+()\d][\d\s().-]{6,24}$/;
// Looser than Zod's email check on purpose: the browser only catches obvious slips, and
// the server action stays the authority (a rare disagreement comes back as `invalid`).
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// The field order on the page: the first one in error gets the focus.
export const contactFields: readonly ContactField[] = [
  "name",
  "contact",
  "businessType",
  "services",
  "message",
  "consent",
];

export type ContactErrors = Partial<Record<ContactField, true>>;

// What was typed, from the form's entries. Bounded, so a forged request can't grow it.
export function contactValues(raw: Record<string, unknown>): ContactValues {
  const text = (key: string, max: number) => {
    const value = raw[key];
    return typeof value === "string" ? value.slice(0, max) : "";
  };
  const services = Array.isArray(raw.services) ? raw.services : [];
  return {
    name: text("name", 100),
    contact: text("contact", 254),
    businessType: text("businessType", 100),
    message: text("message", 2000),
    // Only known service keys, so a forged request can't grow what is echoed.
    services: services
      .filter(
        (item): item is string =>
          typeof item === "string" &&
          (serviceKeys as readonly string[]).includes(item),
      )
      .slice(0, serviceKeys.length),
    consent: raw.consent === "on",
  };
}

export function formValues(form: HTMLFormElement): ContactValues {
  const data = new FormData(form);
  return contactValues({
    ...Object.fromEntries(data.entries()),
    services: data.getAll("services"),
  });
}

// The schema's rules (schema.ts) for what a person can get wrong in the browser.
export function contactErrors(values: ContactValues): ContactErrors {
  const errors: ContactErrors = {};
  const contact = values.contact.trim();
  if (values.name.trim().length < 2) errors.name = true;
  if (
    contact.length < 5 ||
    !(EMAIL_PATTERN.test(contact) || PHONE_PATTERN.test(contact))
  )
    errors.contact = true;
  if (values.businessType.trim().length < 2) errors.businessType = true;
  if (values.services.length === 0) errors.services = true;
  if (values.message.trim().length < 10) errors.message = true;
  if (!values.consent) errors.consent = true;
  return errors;
}
