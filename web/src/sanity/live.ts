import "server-only";
import { defineLive } from "next-sanity/live";
import { client } from "./client";

// `sanityFetch` caches every query by the sync tags Content Lake returns (`sanity:s1:…`) and
// keeps it until those tags are revalidated. Two things can revalidate them:
//   1. `<SanityLive />` mounted in the layout (SSE connection per visitor, see below), or
//   2. a webhook route calling `revalidateTag(tag, "max")` for the custom tags that
//      fetch.ts adds to each query (`tags: [...]`).
// Until one of them exists, published edits show up only after a redeploy.
//
// No tokens on purpose: the dataset is public and we read published content only. A
// `serverToken` makes every `sanityFetch` call `draftMode()` (a dynamic API), which would
// turn the static per-locale pages into dynamic ones. fetch.ts also passes
// `perspective: "published"` + `stega: false` explicitly, so adding a token later (draft
// mode / Visual Editing) does not change how the public pages render.
// `false` instead of `undefined` silences next-sanity's dev warning about the missing tokens.
export const { sanityFetch, SanityLive } = defineLive({
  client,
  serverToken: false,
  browserToken: false,
});
