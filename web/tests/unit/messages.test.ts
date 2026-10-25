import { describe, expect, it } from "vitest";
import es from "@/messages/es.json";
import en from "@/messages/en.json";
import uk from "@/messages/uk.json";

function keys(value: unknown, prefix = ""): string[] {
  if (!value || typeof value !== "object") return [prefix];
  return Object.entries(value).flatMap(([key, child]) =>
    keys(child, prefix ? `${prefix}.${key}` : key),
  );
}

describe("message catalogues", () => {
  it.each([
    ["en", en],
    ["uk", uk],
  ])("keeps exact key parity for %s", (_locale, messages) => {
    expect(keys(messages).sort()).toEqual(keys(es).sort());
  });
});
