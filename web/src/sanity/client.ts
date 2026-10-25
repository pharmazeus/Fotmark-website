import "server-only";
import { createClient } from "next-sanity";
import { env } from "@/env";

// Read-only client for the public dataset (D-036: project s8t1xmk2 on the developer's account).
// `useCdn` + the `published` perspective are also what `defineLive` forces (live.ts).
// No token: nothing here can read drafts or write.
export const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: env.NEXT_PUBLIC_SANITY_API_VERSION,
  useCdn: true,
  perspective: "published",
});
