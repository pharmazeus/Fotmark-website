import type { InternationalizedArrayItem } from "sanity-plugin-internationalized-array";
import { LANGUAGES, type LanguageId } from "./languages";

type LocalizedValue = InternationalizedArrayItem<string>[] | undefined;

/**
 * Validation for an internationalized string/text field: every listed language needs a
 * non-empty value. The error names the missing languages and marks the empty rows.
 */
export function requiredIn(languageIds: readonly LanguageId[], label: string) {
  return (value: unknown) => {
    const items = (value as LocalizedValue) ?? [];
    const missing = languageIds.filter(
      (id) => !items.some((item) => item.language === id && item.value?.trim()),
    );
    if (missing.length === 0) return true;
    const names = missing.map(
      (id) => LANGUAGES.find((l) => l.id === id)?.title ?? id,
    );
    return `${label}: falta ${names.join(", ")}`;
  };
}

export const ALL_LANGUAGE_IDS: readonly LanguageId[] = LANGUAGES.map(
  (l) => l.id,
);

// Asset ids look like `image-<sha1>-<width>x<height>-<ext>`: the size is readable without a fetch.
const IMAGE_ASSET_ID = /^image-[a-f0-9]+-(\d+)x(\d+)-[a-z0-9]+$/i;

export function imageLongSide(
  assetRef: string | undefined,
): number | undefined {
  const match = assetRef ? IMAGE_ASSET_ID.exec(assetRef) : null;
  if (!match) return undefined;
  return Math.max(Number(match[1]), Number(match[2]));
}
