import { describe, expect, it } from "vitest";
import { serviceKeys, type ContactField } from "@/features/contact/model";
import { contactSchema } from "@/features/contact/schema";
import {
  contactErrors,
  contactFields,
  contactValues,
} from "@/features/contact/validate";

const valid = {
  name: "Ada Lovelace",
  contact: "ada@example.com",
  businessType: "Hotel",
  services: ["fotografia"],
  message: "A useful project brief.",
  consent: "on",
  locale: "en",
  website: "",
  startedAt: "token",
};

// The fields the server rejects, as the browser check must report them.
function schemaErrors(raw: Record<string, unknown>): ContactField[] {
  const parsed = contactSchema.safeParse(raw);
  if (parsed.success) return [];
  const fields = new Set(parsed.error.issues.map((issue) => issue.path[0]));
  return contactFields.filter((field) => fields.has(field));
}

function browserErrors(raw: Record<string, unknown>): ContactField[] {
  const errors = contactErrors(contactValues(raw));
  return contactFields.filter((field) => errors[field]);
}

const cases: [string, Record<string, unknown>][] = [
  ["a complete form", {}],
  ["a phone number", { contact: "+34 600 123 456" }],
  ["a phone with brackets", { contact: "(952) 12-34-56" }],
  [
    "an empty form",
    {
      name: "",
      contact: "",
      businessType: "",
      message: "",
      services: [],
      consent: undefined,
    },
  ],
  ["a one-letter name", { name: "A" }],
  ["a name of spaces", { name: "     " }],
  ["a word as contact", { contact: "hello" }],
  ["an email with no domain", { contact: "ada@" }],
  ["a too-short phone", { contact: "1234" }],
  ["no service", { services: [] }],
  ["a short message", { message: "Hi there" }],
  ["a message padded with spaces", { message: "   short    " }],
  ["no consent", { consent: undefined }],
];

describe("browser check of the contact form", () => {
  it.each(cases)("agrees with the server schema on %s", (_, change) => {
    const raw = { ...valid, ...change };
    expect(browserErrors(raw)).toEqual(schemaErrors(raw));
  });

  it("lists the fields in page order, so the first error gets the focus", () => {
    expect(contactFields).toEqual([
      "name",
      "contact",
      "businessType",
      "services",
      "message",
      "consent",
    ]);
  });

  it("bounds what a forged request can send back", () => {
    const values = contactValues({
      name: "x".repeat(500),
      services: [...Array.from({ length: 50 }, () => "dron"), "x".repeat(5000)],
      consent: "yes",
    });
    expect(values.name).toHaveLength(100);
    expect(values.services.length).toBeLessThanOrEqual(serviceKeys.length);
    expect(values.services.every((key) => key === "dron")).toBe(true);
    expect(values.consent).toBe(false);
  });
});
