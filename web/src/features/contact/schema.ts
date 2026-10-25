import { z } from "zod";
import { contactLocales, serviceKeys } from "./model";

const contactValue = z
  .string()
  .trim()
  .min(5)
  .max(254)
  .refine(
    (value) =>
      z.email().safeParse(value).success ||
      /^[+()\d][\d\s().-]{6,24}$/.test(value),
    "contact",
  );

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  contact: contactValue,
  businessType: z.string().trim().min(2).max(100),
  service: z.enum(serviceKeys),
  message: z.string().trim().min(10).max(2000),
  consent: z.literal("on"),
  locale: z.enum(contactLocales),
  utmSource: z.string().trim().max(100).optional().default(""),
  utmMedium: z.string().trim().max(100).optional().default(""),
  utmCampaign: z.string().trim().max(100).optional().default(""),
  website: z.string().max(0),
  startedAt: z.string().min(1),
});

export type ContactInput = z.infer<typeof contactSchema>;
export function contactInputFromFormData(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

export function stripHeaderBreaks(value: string) {
  return value.replace(/[\r\n]+/g, " ").trim();
}
