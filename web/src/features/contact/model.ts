import { SERVICE_KEYS } from "@/sanity/content-types";

// The form's service options are the Studio «Icono» values (one per service document).
// A visitor can tick several of them.
export const serviceKeys = SERVICE_KEYS;

export const contactLocales = ["es", "en", "uk"] as const;

export type ContactField =
  "name" | "contact" | "businessType" | "services" | "message" | "consent";

// What the visitor typed, sent back with every unsuccessful result: React resets an
// uncontrolled `<form action>` once the action ends, and these become the fields' defaults
// so nothing typed is lost.
export type ContactValues = {
  name: string;
  contact: string;
  businessType: string;
  services: string[];
  message: string;
  consent: boolean;
};

export type ContactState = {
  status: "idle" | "invalid" | "blocked" | "unavailable" | "failed";
  fieldErrors?: Partial<Record<ContactField, string>>;
  values?: ContactValues;
};

export const initialContactState: ContactState = { status: "idle" };
