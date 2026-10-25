import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: {
    projectId: "s8t1xmk2",
    dataset: "production",
  },
  deployment: {
    // https://fotmark.sanity.studio (first deployed 2026-10-25)
    appId: "v801ym4pbzvwnmfa0e2028fe",
    /**
     * Enable auto-updates for studios.
     * Learn more at https://www.sanity.io/docs/studio/latest-version-of-sanity#k47faf43faf56
     */
    autoUpdates: true,
  },
  // TypeGen (root script `pnpm typegen`): the queries live in web/, the types go next to them.
  // `schema.json` is produced by `sanity schemas extract` (git-ignored, regenerated every run).
  // `overloadClientMethods` stays off: the generated `declare module "@sanity/client"` block
  // needs `@sanity/client` resolvable from web/ (it is only a transitive dependency of
  // next-sanity), so tsc rejects it. fetch.ts casts each result to its generated `*_RESULT` type.
  typegen: {
    path: "../web/src/**/*.{ts,tsx}",
    schema: "schema.json",
    generates: "../web/src/sanity/types.ts",
    overloadClientMethods: false,
  },
});
