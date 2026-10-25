import { visionTool } from "@sanity/vision";
import { defineConfig, defineSingleton, isDev } from "sanity";
import { structureTool } from "sanity/structure";
import { internationalizedArray } from "sanity-plugin-internationalized-array";
import { schemaTypes } from "./schemaTypes";
import { LANGUAGES } from "./schemaTypes/languages";
import { structure } from "./structure";

// The only singleton: contacts, stats and default SEO. The id is fixed (`settings`),
// the seed script writes the same one and web/src/sanity/queries.ts reads it by type.
const settingsSingleton = defineSingleton({
  id: "settings",
  documentId: "settings",
  schemaType: "settings",
  title: "Ajustes del sitio",
  icon: () => "⚙️",
});

export default defineConfig({
  name: "default",
  title: "Fotmark",

  projectId: "s8t1xmk2",
  dataset: "production",

  plugins: [
    structureTool({ structure }),
    // Field-level localization: `internationalizedArrayString` / `internationalizedArrayText`.
    internationalizedArray({
      languages: [...LANGUAGES],
      // Spanish is the fallback of every query, so its row always exists and cannot be removed.
      defaultLanguages: ["es"],
      fieldTypes: ["string", "text"],
      languageDisplay: "titleOnly",
    }),
    // GROQ playground: development only, it is not part of the deployed Studio.
    ...(isDev ? [visionTool()] : []),
  ],

  schema: { types: schemaTypes },

  document: {
    singletons: [settingsSingleton],
    // `settings` can be edited but never created, duplicated, deleted or unpublished.
    actions: (prev, { singleton }) =>
      singleton
        ? prev.filter(
            ({ action }) =>
              !["delete", "duplicate", "unpublish"].includes(action ?? ""),
          )
        : prev,
  },
});
