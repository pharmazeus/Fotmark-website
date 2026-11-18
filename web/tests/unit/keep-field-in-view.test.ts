import { describe, expect, it } from "vitest";
import {
  scrollDelta,
  visibleArea,
} from "@/features/contact/useKeepFieldInView";

describe("visibleArea", () => {
  it("is the viewport below the header without a visual viewport", () => {
    expect(visibleArea(null, 800, 70)).toEqual({ top: 70, bottom: 800 });
  });

  it("follows the visual viewport when the keyboard shrinks and WebKit pans it", () => {
    // Keyboard open: 380px visible, panned 300px down the layout viewport, so the fixed
    // header (bottom at 70) has slid off the top of the screen.
    expect(visibleArea({ offsetTop: 300, height: 380 }, 800, 70)).toEqual({
      top: 300,
      bottom: 680,
    });
  });
});

describe("scrollDelta", () => {
  const area = { top: 70, bottom: 450 };

  it("leaves a visible field alone, even one just under the header", () => {
    expect(scrollDelta({ top: 72 }, { top: 100, bottom: 150 }, area)).toBe(0);
  });

  it("brings a field hidden under the header down below it", () => {
    expect(scrollDelta({ top: 20 }, { top: 48, bottom: 98 }, area)).toBe(-66);
  });

  it("brings a field behind the keyboard up under the header", () => {
    expect(scrollDelta({ top: 600 }, { top: 628, bottom: 678 }, area)).toBe(
      514,
    );
  });

  it("only needs a tall textarea's first lines above the keyboard", () => {
    expect(scrollDelta({ top: 300 }, { top: 330, bottom: 600 }, area)).toBe(0);
  });

  it("measures against a panned visual viewport", () => {
    const panned = visibleArea({ offsetTop: 300, height: 380 }, 800, 70);
    expect(scrollDelta({ top: 150 }, { top: 178, bottom: 228 }, panned)).toBe(
      -166,
    );
  });
});
