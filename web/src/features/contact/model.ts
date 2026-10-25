import { SERVICE_KEYS } from "@/sanity/content-types";

// The form's service options are the Studio «Icono» values (one per service document).
export const serviceKeys = SERVICE_KEYS;

export const contactLocales = ["es", "en", "uk"] as const;

export type ContactField =
  "name" | "contact" | "businessType" | "service" | "message" | "consent";

export type ContactState = {
  status: "idle" | "invalid" | "blocked" | "unavailable" | "failed";
  fieldErrors?: Partial<Record<ContactField, string>>;
};

export const initialContactState: ContactState = { status: "idle" };
