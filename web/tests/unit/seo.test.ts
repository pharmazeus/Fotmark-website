import { describe, expect, it } from "vitest";
import {
  buildMetadata,
  buildStructuredData,
  getLocalizedPath,
} from "@/lib/seo";

const settings = {
  location: "Málaga · Costa del Sol",
  address: ["Málaga, España", "Costa del Sol"],
  phone: "+34 611 280 574",
  whatsapp: "+34 611 280 574",
  email: "fotmark.es@gmail.com",
  instagram: "@fotmark.es",
  founder: "Illia Lutsak",
  stats: { projects: "40+", years: 2 },
};

describe("SEO builders", () => {
  it("builds locale paths without duplicate slashes", () => {
    expect(getLocalizedPath("es", "gracias")).toBe("/gracias");
    expect(getLocalizedPath("uk", "gracias")).toBe("/ua/gracias");
  });
  it("uses a self-canonical and keeps unapproved locales out of hreflang", () => {
    const metadata = buildMetadata("en", {
      title: "Title",
      description: "Description",
    });
    expect(metadata.alternates?.canonical).toBe("http://localhost:3000/en");
    expect(metadata.alternates?.languages).toMatchObject({
      es: "http://localhost:3000/",
      "x-default": "http://localhost:3000/",
    });
    expect(metadata.alternates?.languages).not.toHaveProperty("en");
    expect(metadata.robots).toMatchObject({ index: false, follow: false });
  });
  it("emits only substantiated business data", () => {
    const data = buildStructuredData("es", settings, {
      description: "Creative agency",
      services: ["Photography", "Video"],
    });
    const json = JSON.stringify(data);
    expect(data["@graph"]).toHaveLength(2);
    expect(json).toContain("ProfessionalService");
    expect(json).toContain("Costa del Sol");
    expect(json).not.toContain("streetAddress");
  });
});
