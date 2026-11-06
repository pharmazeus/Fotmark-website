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
  services: z
    .array(z.enum(serviceKeys))
    .min(1)
    .max(serviceKeys.length)
    .transform((keys) => [...new Set(keys)]),
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
export function contactInputFromFormData(
  formData: FormData,
): Record<string, unknown> {
  return {
    ...Object.fromEntries(formData.entries()),
    // The service checkboxes share one name; `fromEntries` would keep only the last one.
    services: formData.getAll("services"),
  };
}

export function stripHeaderBreaks(value: string) {
  return value.replace(/[\r\n]+/g, " ").trim();
}
