import { describe, expect, it } from "vitest";
import {
  GALLERY_GAP,
  galleryColumnCount,
  layoutColumns,
} from "@/features/gallery/layout";
import type { GalleryPhoto } from "@/features/gallery/types";
import { fixtureCategories, fixtureItems } from "./gallery-fixture";

// Expected columns were produced by running the prototype's own `layout()`
// (.agents/reference/prototype.html) in a browser on the same 41 cells: one case per
// container width and filter (`all` or the category prefix), each column listing the
// cells' `data-i` (their index in the full set). Container widths: 346 / 738 / 1176 are
// the real `#grid` widths at 390 / 820 / 1440 px viewports; 390 / 820 / 1440 are the
// literal widths; 699 / 700 / 1079 / 1080 sit on the column-count thresholds.
const CATEGORY_OF_FILTER: Record<string, string> = {
  gas: "gastronomia",
  jap: "japones",
  beb: "bebidas",
  eve: "eventos",
  inm: "inmobiliaria",
  int: "interiores",
  ret: "retratos",
};

// prettier-ignore
const PROTOTYPE_CASES: [width: number, filter: string, columns: number[][]][] = [
  [346, "all", [[0,2,3,5,7,9,11,13,14,16,18,20,22,24,26,28,31,33,35,36,38],[1,4,6,8,10,12,15,17,19,21,23,25,27,29,30,32,34,37,39,40]]],
  [346, "gas", [[14,24,31],[0,8,19,28]]],
  [346, "jap", [[2,9,35],[5,20]]],
  [346, "beb", [[3,10,21,29,36,40],[6,15,25,32,38]]],
  [346, "eve", [[1,17,30,37],[12,22,27,34]]],
  [346, "inm", [[7,23],[18,39]]],
  [346, "int", [[4],[13,26]]],
  [346, "ret", [[11,33],[16]]],
  [738, "all", [[0,4,7,8,12,16,19,21,25,28,32,35,36,39],[1,5,9,11,14,17,22,23,26,29,30,33,37,40],[2,3,6,10,13,15,18,20,24,27,31,34,38]]],
  [738, "gas", [[0,19,24],[8,28],[14,31]]],
  [738, "jap", [[2,20],[5],[9,35]]],
  [738, "beb", [[3,15,29,38],[6,21,32,40],[10,25,36]]],
  [738, "eve", [[1,22,34],[12,27,37],[17,30]]],
  [738, "inm", [[7,39],[18],[23]]],
  [738, "int", [[4],[13],[26]]],
  [738, "ret", [[11],[16],[33]]],
  [1176, "all", [[0,5,10,14,18,20,26,30,34,39,40],[1,7,9,12,17,22,24,28,33,38],[2,4,8,13,15,19,23,25,29,32,36],[3,6,11,16,21,27,31,35,37]]],
  [1176, "gas", [[0,19,24],[8,28],[14,31]]],
  [1176, "jap", [[2,35],[5],[9],[20]]],
  [1176, "beb", [[21,38],[6,25,40],[10,29,36],[3,15,32]]],
  [1176, "eve", [[1,30],[12,34],[17,37],[22,27]]],
  [1176, "inm", [[7],[18],[23],[39]]],
  [1176, "int", [[4],[13],[26],[]]],
  [1176, "ret", [[11],[16],[33],[]]],
  [390, "all", [[0,2,3,5,7,9,11,13,14,16,18,20,22,24,26,28,31,33,35,36,38],[1,4,6,8,10,12,15,17,19,21,23,25,27,29,30,32,34,37,39,40]]],
  [390, "gas", [[14,24,31],[0,8,19,28]]],
  [390, "jap", [[2,9,35],[5,20]]],
  [390, "beb", [[3,10,21,29,36,40],[6,15,25,32,38]]],
  [390, "eve", [[1,17,30,37],[12,22,27,34]]],
  [390, "inm", [[7,23],[18,39]]],
  [390, "int", [[4],[13,26]]],
  [390, "ret", [[11,33],[16]]],
  [820, "all", [[0,4,7,8,12,16,19,21,25,28,32,35,36,39],[1,5,9,11,14,17,22,23,26,29,30,33,37,40],[2,3,6,10,13,15,18,20,24,27,31,34,38]]],
  [820, "gas", [[0,19,24],[8,28],[14,31]]],
  [820, "jap", [[2,20],[5],[9,35]]],
  [820, "beb", [[3,15,29,38],[6,21,32,40],[10,25,36]]],
  [820, "eve", [[1,22,34],[12,27,37],[17,30]]],
  [820, "inm", [[7,39],[18],[23]]],
  [820, "int", [[4],[13],[26]]],
  [820, "ret", [[11],[16],[33]]],
  [1440, "all", [[0,5,10,14,18,20,26,30,34,39,40],[1,7,9,12,17,22,24,28,33,38],[2,4,8,13,15,19,23,25,29,32,36],[3,6,11,16,21,27,31,35,37]]],
  [1440, "gas", [[0,19,24],[8,28],[14,31]]],
  [1440, "jap", [[2,35],[5],[9],[20]]],
  [1440, "beb", [[21,38],[6,25,40],[10,29,36],[3,15,32]]],
  [1440, "eve", [[1,30],[12,34],[17,37],[22,27]]],
  [1440, "inm", [[7],[18],[23],[39]]],
  [1440, "int", [[4],[13],[26],[]]],
  [1440, "ret", [[11],[16],[33],[]]],
  [699, "all", [[0,2,3,5,7,9,11,13,14,16,18,19,21,23,25,27,29,30,32,34,37,39,40],[1,4,6,8,10,12,15,17,20,22,24,26,28,31,33,35,36,38]]],
  [699, "gas", [[14,24,31],[0,8,19,28]]],
  [699, "jap", [[2,9,35],[5,20]]],
  [699, "beb", [[3,10,21,29,36,40],[6,15,25,32,38]]],
  [699, "eve", [[1,17,30,37],[12,22,27,34]]],
  [699, "inm", [[7,23],[18,39]]],
  [699, "int", [[4],[13,26]]],
  [699, "ret", [[11,33],[16]]],
  [700, "all", [[0,4,7,8,12,16,19,21,25,28,32,35,36,39],[1,5,9,11,14,17,22,23,26,29,30,33,37,40],[2,3,6,10,13,15,18,20,24,27,31,34,38]]],
  [700, "gas", [[0,19,24],[8,28],[14,31]]],
  [700, "jap", [[2,20],[5],[9,35]]],
  [700, "beb", [[3,15,29,38],[6,21,32,40],[10,25,36]]],
  [700, "eve", [[1,22,34],[12,27,37],[17,30]]],
  [700, "inm", [[7,39],[18],[23]]],
  [700, "int", [[4],[13],[26]]],
  [700, "ret", [[11],[16],[33]]],
  [1079, "all", [[0,4,7,8,12,16,19,21,25,28,32,35,36,39],[1,5,9,11,14,17,22,23,26,29,30,33,37,40],[2,3,6,10,13,15,18,20,24,27,31,34,38]]],
  [1079, "gas", [[0,19,24],[8,28],[14,31]]],
  [1079, "jap", [[2,20],[5],[9,35]]],
  [1079, "beb", [[3,15,29,38],[6,21,32,40],[10,25,36]]],
  [1079, "eve", [[1,22,34],[12,27,37],[17,30]]],
  [1079, "inm", [[7,39],[18],[23]]],
  [1079, "int", [[4],[13],[26]]],
  [1079, "ret", [[11],[16],[33]]],
  [1080, "all", [[0,5,10,14,18,20,26,30,34,39,40],[1,7,9,12,17,22,24,28,33,38],[2,4,8,13,15,19,23,25,29,32,36],[3,6,11,16,21,27,31,35,37]]],
  [1080, "gas", [[0,19,24],[8,28],[14,31]]],
  [1080, "jap", [[2,35],[5],[9],[20]]],
  [1080, "beb", [[21,38],[6,25,40],[10,29,36],[3,15,32]]],
  [1080, "eve", [[1,30],[12,34],[17,37],[22,27]]],
  [1080, "inm", [[7],[18],[23],[39]]],
  [1080, "int", [[4],[13],[26],[]]],
  [1080, "ret", [[11],[16],[33],[]]],
];

// The first N cells at three container widths (0 and 1 item, under and over the six-photo
// column reduction).
// prettier-ignore
const PROTOTYPE_FIRST_N: [width: number, first: number, columns: number[][]][] = [
  [346, 1, [[0],[]]],
  [738, 1, [[0],[],[]]],
  [1176, 1, [[0],[],[],[]]],
  [346, 2, [[0],[1]]],
  [738, 2, [[0],[1],[]]],
  [1176, 2, [[0],[1],[],[]]],
  [346, 3, [[0,2],[1]]],
  [738, 3, [[0],[1],[2]]],
  [1176, 3, [[0],[1],[2],[]]],
  [346, 5, [[0,2,3],[1,4]]],
  [738, 5, [[0,4],[1],[2,3]]],
  [1176, 5, [[0,2],[1],[4],[3]]],
  [346, 6, [[2,3,5],[0,1,4]]],
  [738, 6, [[0,4],[1,5],[2,3]]],
  [1176, 6, [[0,4],[1,5],[2,3]]],
  [346, 7, [[0,2,3,5],[1,4,6]]],
  [738, 7, [[0,2,4],[1,5],[3,6]]],
  [1176, 7, [[0,2,4],[1,5],[3,6]]],
  [346, 8, [[0,2,3,5,7],[1,4,6]]],
  [738, 8, [[0,2,4,7],[1,5],[3,6]]],
  [1176, 8, [[0,5],[1,7],[2,4],[3,6]]],
  [346, 12, [[0,2,3,5,7,9,11],[1,4,6,8,10]]],
  [738, 12, [[4,7,8,9],[0,1,5,11],[2,3,6,10]]],
  [1176, 12, [[0,5,10],[1,7,9],[2,4,8],[3,6,11]]],
];

const indexOf = (photo: GalleryPhoto) => fixtureItems.indexOf(photo);
const asIndexes = (columns: GalleryPhoto[][]) =>
  columns.map((column) => column.map(indexOf));
const byFilter = (filter: string) =>
  filter === "all"
    ? fixtureItems
    : fixtureItems.filter((p) => p.category === CATEGORY_OF_FILTER[filter]);

describe("gallery test cells", () => {
  it("are the prototype's 41 cells with unique ids and known categories", () => {
    expect(fixtureItems).toHaveLength(41);
    expect(new Set(fixtureItems.map((p) => p.id)).size).toBe(41);
    const keys = new Set(fixtureCategories.map((c) => c.key));
    expect(keys.size).toBe(7);
    for (const photo of fixtureItems) {
      expect(keys.has(photo.category)).toBe(true);
      expect(photo.aspectRatio).toBeGreaterThan(0);
    }
  });
});

describe("galleryColumnCount", () => {
  it.each([
    [346, 41, 2],
    [699, 41, 2],
    [700, 41, 3],
    [738, 41, 3],
    [1079, 41, 3],
    [1080, 41, 4],
    [1176, 41, 4],
  ])("width %i with %i photos has %i columns", (width, count, cols) => {
    expect(galleryColumnCount(width, count)).toBe(cols);
  });

  it("reduces columns from six photos on: min(cols, max(2, round(n / 2.2)))", () => {
    expect(galleryColumnCount(1176, 5)).toBe(4);
    expect(galleryColumnCount(1176, 6)).toBe(3);
    expect(galleryColumnCount(1176, 7)).toBe(3);
    expect(galleryColumnCount(1176, 8)).toBe(4);
    expect(galleryColumnCount(738, 6)).toBe(3);
    expect(galleryColumnCount(346, 6)).toBe(2);
    expect(galleryColumnCount(1176, 3)).toBe(4);
  });
});

describe("layoutColumns matches the prototype", () => {
  it.each(PROTOTYPE_CASES)(
    "container %ipx, filter %s",
    (width, filter, expected) => {
      expect(asIndexes(layoutColumns(byFilter(filter), width))).toEqual(
        expected,
      );
    },
  );

  it.each(PROTOTYPE_FIRST_N)(
    "container %ipx, first %i photos",
    (width, first, expected) => {
      expect(
        asIndexes(layoutColumns(fixtureItems.slice(0, first), width)),
      ).toEqual(expected);
    },
  );
});

describe("layoutColumns edge cases", () => {
  it("returns no columns for 0 items", () => {
    expect(layoutColumns([], 1176)).toEqual([]);
  });

  it("returns no columns without a width (not measured, or hidden)", () => {
    expect(layoutColumns(fixtureItems, 0)).toEqual([]);
    expect(layoutColumns(fixtureItems, -10)).toEqual([]);
    expect(layoutColumns(fixtureItems, Number.NaN)).toEqual([]);
  });

  it("keeps empty columns for a single item", () => {
    const [only] = fixtureItems;
    if (!only) throw new Error("fixture is empty");
    expect(layoutColumns([only], 1176)).toEqual([[only], [], [], []]);
    expect(layoutColumns([only], 346)).toEqual([[only], []]);
  });

  it("does not reduce columns below six photos", () => {
    expect(layoutColumns(fixtureItems.slice(0, 5), 1176)).toHaveLength(4);
    expect(layoutColumns(fixtureItems.slice(0, 6), 1176)).toHaveLength(3);
  });

  it("treats an unusable aspect ratio as square", () => {
    const base = fixtureItems.slice(0, 4);
    const broken = base.map((p) => ({ ...p, aspectRatio: 0 }));
    const square = base.map((p) => ({ ...p, aspectRatio: 1 }));
    expect(layoutColumns(broken, 1176).map((c) => c.map((p) => p.id))).toEqual(
      layoutColumns(square, 1176).map((c) => c.map((p) => p.id)),
    );
  });
});

describe("layoutColumns invariants", () => {
  const widths = [346, 738, 1176];

  it.each(widths)(
    "keeps every photo exactly once, in order, at %ipx",
    (width) => {
      for (const filter of ["all", ...Object.keys(CATEGORY_OF_FILTER)]) {
        const items = byFilter(filter);
        const columns = layoutColumns(items, width);
        const flat = columns.flat();
        expect(flat).toHaveLength(items.length);
        expect(new Set(flat).size).toBe(items.length);
        for (const column of columns) {
          const idx = column.map(indexOf);
          expect(idx).toEqual([...idx].sort((a, b) => a - b));
        }
      }
    },
  );

  it.each(widths)("balances the column heights at %ipx", (width) => {
    const columns = layoutColumns(fixtureItems, width);
    const colWidth =
      (width - GALLERY_GAP * (columns.length - 1)) / columns.length;
    const heights = columns.map((column) =>
      column.reduce(
        (sum, p) => sum + colWidth / p.aspectRatio + GALLERY_GAP,
        0,
      ),
    );
    const tallestPhoto = Math.max(
      ...fixtureItems.map((p) => colWidth / p.aspectRatio + GALLERY_GAP),
    );
    expect(Math.max(...heights) - Math.min(...heights)).toBeLessThan(
      tallestPhoto / 2,
    );
  });

  it("is deterministic and leaves its input untouched", () => {
    const items = [...fixtureItems];
    const first = layoutColumns(items, 1176);
    expect(items).toEqual(fixtureItems);
    expect(layoutColumns(items, 1176)).toEqual(first);
  });
});
