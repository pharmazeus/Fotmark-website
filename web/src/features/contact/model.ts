export const serviceKeys = [
  "fotografia",
  "video",
  "dron",
  "redes",
  "publicidad",
  "branding",
] as const;

export const contactLocales = ["es", "en", "uk"] as const;

export type ContactField =
  "name" | "contact" | "businessType" | "service" | "message" | "consent";

export type ContactState = {
  status: "idle" | "invalid" | "blocked" | "unavailable" | "failed";
  fieldErrors?: Partial<Record<ContactField, string>>;
};

export const initialContactState: ContactState = { status: "idle" };
