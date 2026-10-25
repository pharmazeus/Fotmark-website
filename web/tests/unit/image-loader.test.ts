import { describe, expect, it } from "vitest";
import {
  DEFAULT_IMAGE_QUALITY,
  MIN_IMAGE_QUALITY,
  sanityImageLoader,
} from "@/sanity/image-loader";

const SRC =
  "https://cdn.sanity.io/images/s8t1xmk2/production/abc-2133x3200.jpg?rect=10,20,300,400";

function params(url: string) {
  return new URL(url).searchParams;
}

describe("sanityImageLoader", () => {
  it("never goes below q85 (D-012)", () => {
    expect(
      params(sanityImageLoader({ src: SRC, width: 640, quality: 40 })).get("q"),
    ).toBe(String(MIN_IMAGE_QUALITY));
  });

  it("defaults to q90 and caps at 100", () => {
    expect(params(sanityImageLoader({ src: SRC, width: 640 })).get("q")).toBe(
      String(DEFAULT_IMAGE_QUALITY),
    );
    expect(
      params(sanityImageLoader({ src: SRC, width: 640, quality: 120 })).get(
        "q",
      ),
    ).toBe("100");
  });

  it("sets width, format and fit, and keeps the editor's crop", () => {
    const p = params(sanityImageLoader({ src: SRC, width: 1080 }));
    expect(p.get("w")).toBe("1080");
    expect(p.get("auto")).toBe("format");
    expect(p.get("fit")).toBe("max");
    expect(p.get("rect")).toBe("10,20,300,400");
  });

  it("leaves non-Sanity URLs alone", () => {
    expect(
      sanityImageLoader({ src: "https://example.com/a.jpg", width: 640 }),
    ).toBe("https://example.com/a.jpg");
  });
});
