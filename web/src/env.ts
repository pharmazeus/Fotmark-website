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
    // Signs the Sanity publish webhook (app/api/revalidate). Without it the route answers 503.
    SANITY_REVALIDATE_SECRET: z.string().min(32).optional(),
  },
  client: {
    NEXT_PUBLIC_SITE_URL: z.url().default("http://localhost:3000"),
    // Public identifiers, not secrets. The defaults point at the one Fotmark project, so tests,
    // CI and previews work without configuration.
    NEXT_PUBLIC_SANITY_PROJECT_ID: z
      .string()
      .regex(/^[a-z0-9-]+$/)
      .default("s8t1xmk2"),
    NEXT_PUBLIC_SANITY_DATASET: z
      .string()
      .regex(/^[a-z0-9_-]+$/)
      .default("production"),
    NEXT_PUBLIC_SANITY_API_VERSION: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .default("2026-10-01"),
  },
  runtimeEnv: {
    SITE_INDEXABLE: process.env.SITE_INDEXABLE,
    CONTACT_FORM_TOKEN_SECRET: process.env.CONTACT_FORM_TOKEN_SECRET,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    CONTACT_TO_EMAIL: process.env.CONTACT_TO_EMAIL,
    CONTACT_FROM_EMAIL: process.env.CONTACT_FROM_EMAIL,
    SANITY_REVALIDATE_SECRET: process.env.SANITY_REVALIDATE_SECRET,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET,
    NEXT_PUBLIC_SANITY_API_VERSION: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
  },
  emptyStringAsUndefined: true,
});
