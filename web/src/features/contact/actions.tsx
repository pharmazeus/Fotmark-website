"use server";

import { checkBotId } from "botid/server";
import { redirect } from "next/navigation";
import type { Route } from "next";
import { Resend } from "resend";
import { env } from "@/env";
import { getLocalizedPath } from "@/lib/seo";
import { ContactEmail } from "./ContactEmail";
import type { ContactField, ContactState } from "./model";
import {
  contactInputFromFormData,
  contactSchema,
  stripHeaderBreaks,
} from "./schema";
import { createContactToken, verifyContactToken } from "./token";

export async function issueContactToken() {
  if (!env.CONTACT_FORM_TOKEN_SECRET) return { token: "" };
  return { token: createContactToken(env.CONTACT_FORM_TOKEN_SECRET) };
}

export async function sendContact(
  _previous: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const verification = await checkBotId();
  if (verification.isBot) return { status: "blocked" };

  const raw = contactInputFromFormData(formData);
  if (raw.website !== "" || typeof raw.startedAt !== "string") {
    return { status: "blocked" };
  }
  if (!env.CONTACT_FORM_TOKEN_SECRET) return { status: "unavailable" };
  if (!verifyContactToken(raw.startedAt, env.CONTACT_FORM_TOKEN_SECRET).ok) {
    return { status: "blocked" };
  }

  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Partial<Record<ContactField, string>> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as ContactField | undefined;
      if (field && !(field in fieldErrors)) fieldErrors[field] = issue.code;
    }
    return { status: "invalid", fieldErrors };
  }

  const mockDelivery =
    process.env.NODE_ENV !== "production" &&
    process.env.CONTACT_E2E_MOCK_RESEND === "true";
  const input = parsed.data;
  if (!mockDelivery) {
    const { RESEND_API_KEY, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL } = env;
    if (!RESEND_API_KEY || !CONTACT_TO_EMAIL || !CONTACT_FROM_EMAIL) {
      return { status: "unavailable" };
    }
    const contactIsEmail = zodEmail(input.contact);
    try {
      const resend = new Resend(RESEND_API_KEY);
      const result = await resend.emails.send({
        from: CONTACT_FROM_EMAIL,
        to: CONTACT_TO_EMAIL,
        subject: stripHeaderBreaks(`Fotmark enquiry: ${input.service}`),
        replyTo: contactIsEmail ? stripHeaderBreaks(input.contact) : undefined,
        react: <ContactEmail input={input} />,
      });
      if (result.error) {
        console.error("contact_delivery_failed", { provider: "resend" });
        return { status: "failed" };
      }
    } catch {
      console.error("contact_delivery_failed", { provider: "resend" });
      return { status: "failed" };
    }
  }

  redirect(getLocalizedPath(input.locale, "gracias") as Route);
}

function zodEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
