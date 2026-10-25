// The site languages. Spanish comes first: it is the fallback for every localized field
// (web/src/sanity/queries.ts coalesces to "es"). The ids match the site locale codes (`uk`, not `ua`).
export const LANGUAGES = [
  { id: "es", title: "Español" },
  { id: "en", title: "English" },
  { id: "uk", title: "Українська" },
] as const;

export type LanguageId = (typeof LANGUAGES)[number]["id"];
