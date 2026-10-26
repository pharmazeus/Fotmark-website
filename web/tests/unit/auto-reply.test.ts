import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AutoReplyEmail } from "@/features/contact/AutoReplyEmail";
import en from "@/messages/en.json";
import es from "@/messages/es.json";
import uk from "@/messages/uk.json";

describe("contact auto-reply", () => {
  it.each([
    ["es", es],
    ["en", en],
    ["uk", uk],
  ])("renders only the fixed %s copy", (_locale, messages) => {
    const copy = messages.form.autoReply;
    const html = renderToStaticMarkup(createElement(AutoReplyEmail, { copy }));
    const text = html
      .replace(/<[^>]+>/g, " ")
      .replace(/&#x27;/g, "'")
      .replace(/&amp;/g, "&")
      .replace(/\s+/g, " ")
      .trim();
    expect(text).toBe(
      `${copy.greeting} ${copy.body} ${copy.signoff}`.replace(/\s+/g, " "),
    );
    expect(copy.subject).toMatch(/FOTMARK/);
  });
});
