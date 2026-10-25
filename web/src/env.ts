import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const optionalEmail = z.string().trim().min(1).optional();

export const env = createEnv({
  server: {
    SITE_INDEXABLE: z
      .enum(["true", "false"])
      .default("false")
      .transform((value) => value === "true"),
    CONTACT_FORM_TOKEN_SECRET: z.string().min(32).optional(),
    RESEND_API_KEY: optionalEmail,
    CONTACT_TO_EMAIL: z.email().optional(),
    CONTACT_FROM_EMAIL: optionalEmail,
  },
  client: {
    NEXT_PUBLIC_SITE_URL: z.url().default("http://localhost:3000"),
  },
  runtimeEnv: {
    SITE_INDEXABLE: process.env.SITE_INDEXABLE,
    CONTACT_FORM_TOKEN_SECRET: process.env.CONTACT_FORM_TOKEN_SECRET,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    CONTACT_TO_EMAIL: process.env.CONTACT_TO_EMAIL,
    CONTACT_FROM_EMAIL: process.env.CONTACT_FROM_EMAIL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  },
  emptyStringAsUndefined: true,
});
