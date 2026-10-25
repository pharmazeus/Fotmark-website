import { describe, expect, it } from "vitest";
import { serviceKeys } from "@/features/contact/model";
import { contactSchema, stripHeaderBreaks } from "@/features/contact/schema";
import {
  CONTACT_MAX_AGE_MS,
  CONTACT_MIN_AGE_MS,
  createContactToken,
  verifyContactToken,
} from "@/features/contact/token";

const secret = "a-secure-test-secret-that-is-over-32-characters";
const valid = {
  name: "Ada Lovelace",
  contact: "ada@example.com",
  businessType: "Hotel",
  service: "fotografia",
  message: "A useful project brief.",
  consent: "on",
  locale: "en",
  utmSource: "qr",
  utmMedium: "print",
  utmCampaign: "card",
  website: "",
  startedAt: "token",
};

describe("contact input", () => {
  it("accepts every stable service key", () => {
    for (const service of serviceKeys) {
      expect(contactSchema.safeParse({ ...valid, service }).success).toBe(true);
    }
  });
  it("requires consent and rejects the honeypot", () => {
    expect(
      contactSchema.safeParse({ ...valid, consent: undefined }).success,
    ).toBe(false);
    expect(contactSchema.safeParse({ ...valid, website: "spam" }).success).toBe(
      false,
    );
  });
  it("enforces message boundaries and contact shape", () => {
    expect(
      contactSchema.safeParse({ ...valid, message: "short" }).success,
    ).toBe(false);
    expect(
      contactSchema.safeParse({ ...valid, contact: "not-a-contact" }).success,
    ).toBe(false);
    expect(
      contactSchema.safeParse({ ...valid, contact: "+34 600 000 000" }).success,
    ).toBe(true);
  });
  it("strips CR/LF from mail headers", () => {
    expect(stripHeaderBreaks("Hello\r\nBcc: attacker@example.com")).toBe(
      "Hello Bcc: attacker@example.com",
    );
  });
});

describe("signed form timing token", () => {
  const issuedAt = 2_000_000_000_000;
  const token = createContactToken(secret, issuedAt);
  it("accepts a valid token", () => {
    expect(
      verifyContactToken(token, secret, issuedAt + CONTACT_MIN_AGE_MS),
    ).toEqual({ ok: true });
  });
  it("rejects too-fast, expired and modified tokens", () => {
    expect(verifyContactToken(token, secret, issuedAt + 100)).toMatchObject({
      reason: "too-fast",
    });
    expect(
      verifyContactToken(token, secret, issuedAt + CONTACT_MAX_AGE_MS + 1),
    ).toMatchObject({ reason: "expired" });
    expect(
      verifyContactToken(`${token}x`, secret, issuedAt + CONTACT_MIN_AGE_MS),
    ).toMatchObject({ reason: "signature" });
  });
});
