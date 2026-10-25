// Compile-time guard: en/uk must define every key of the source es.json.
// (Extra keys are caught by the key-parity unit test, Step 4.)
import type es from "./es.json";
import en from "./en.json";
import uk from "./uk.json";

type Shape<T> = { [K in keyof T]: T[K] extends string ? string : Shape<T[K]> };

export const translations = { en, uk } satisfies Record<
  string,
  Shape<typeof es>
>;
