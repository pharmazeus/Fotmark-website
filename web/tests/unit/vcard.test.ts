import { describe, expect, it } from "vitest";
import { buildVCard, cardRegion } from "@/features/card/vcard";

describe("cardRegion", () => {
  it("keeps the region after the last separator", () => {
    expect(cardRegion("Málaga · Costa del Sol")).toBe("Costa del Sol");
    expect(cardRegion("Малага · Costa del Sol")).toBe("Costa del Sol");
    expect(cardRegion("Costa del Sol")).toBe("Costa del Sol");
    expect(cardRegion("")).toBe("");
  });
});

const input = {
  name: "FOTMARK",
  note: "Fotografía & Marketing · Málaga, Costa del Sol",
  phone: "+34 672 463 000",
  whatsapp: "+34 672 463 000",
  email: "hola@example.com",
  instagram: "@fotmark.es",
  website: "https://fotmark.es/",
};

describe("buildVCard", () => {
  const card = buildVCard(input);
  const lines = card.split("\r\n");

  it("is a CRLF vCard 3.0 company card", () => {
    expect(lines[0]).toBe("BEGIN:VCARD");
    expect(lines[1]).toBe("VERSION:3.0");
    expect(lines).toContain("FN:FOTMARK");
    expect(lines).toContain("X-ABShowAs:COMPANY");
    expect(card.endsWith("END:VCARD\r\n")).toBe(true);
    expect(card.replace(/\r\n/g, "")).not.toContain("\n");
  });

  it("normalizes contacts with the site's link helpers", () => {
    expect(lines).toContain("TEL;TYPE=CELL,VOICE:+34672463000");
    expect(lines).toContain("EMAIL;TYPE=INTERNET:hola@example.com");
    expect(lines).toContain("URL:https://fotmark.es/");
    expect(lines).toContain(
      "X-SOCIALPROFILE;TYPE=instagram:https://instagram.com/fotmark.es",
    );
  });

  it("escapes vCard text values", () => {
    expect(lines).toContain(
      "NOTE:Fotografía & Marketing · Málaga\\, Costa del Sol",
    );
    expect(buildVCard({ ...input, note: "a;b\\c\nd" })).toContain(
      "NOTE:a\\;b\\\\c\\nd",
    );
  });
});
