// Balanced masonry (decision D-005): the prototype's `layout()` as a pure function, with no
// DOM. Photos keep their own aspect ratio and are dealt into columns so the columns end at
// nearly the same height. Same rules, same arithmetic order, so the result matches the
// prototype column for column (see tests/unit/gallery-layout.test.ts).

// Space between columns and between cells in a column (`.grid` / `.col` gap).
export const GALLERY_GAP = 14;

// The fine-tune pass limit (`pass<80`).
const MAX_PASSES = 80;

type Box = { aspectRatio: number };
type Entry<T> = { item: T; order: number; height: number };

// Columns by container width (not viewport): ≥1080 → 4, ≥700 → 3, else 2. From six photos
// on, fewer photos mean fewer columns so each column stays well filled.
export function galleryColumnCount(width: number, count: number): number {
  let cols = width >= 1080 ? 4 : width >= 700 ? 3 : 2;
  if (count >= 6) cols = Math.min(cols, Math.max(2, Math.round(count / 2.2)));
  return cols;
}

// `items` must be in their original (CMS) order: it is the order each column is returned
// in. Returns `galleryColumnCount()` columns (empty ones included, they still take their
// share of the width), or no columns when there are no items or no width yet.
export function layoutColumns<T extends Box>(
  items: readonly T[],
  width: number,
  gap: number = GALLERY_GAP,
): T[][] {
  if (!(width > 0) || items.length === 0) return [];

  const cols = galleryColumnCount(width, items.length);
  const colWidth = (width - gap * (cols - 1)) / cols;

  const entries: Entry<T>[] = items.map((item, order) => ({
    item,
    order,
    // An unusable ratio counts as square (`parseFloat(ar) || 1`).
    height: colWidth / (item.aspectRatio || 1) + gap,
  }));

  const heights: number[] = Array.from({ length: cols }, () => 0);
  const buckets: Entry<T>[][] = Array.from({ length: cols }, () => []);
  const heightOf = (col: number) => heights[col] ?? 0;
  const bucketOf = (col: number) => buckets[col] ?? [];

  // Each photo goes into the column that is currently shortest (the first, on a tie).
  for (const entry of entries) {
    let shortest = 0;
    for (let k = 1; k < cols; k++)
      if (heightOf(k) < heightOf(shortest)) shortest = k;
    bucketOf(shortest).push(entry);
    heights[shortest] = heightOf(shortest) + entry.height;
  }

  // Fine-tune: relocate photos out of the tallest column while it narrows the spread
  // between the tallest and the shortest column by more than a pixel.
  for (let pass = 0; pass < MAX_PASSES; pass++) {
    let tallest = 0;
    let shortest = 0;
    for (let i = 1; i < cols; i++) {
      if (heightOf(i) > heightOf(tallest)) tallest = i;
      if (heightOf(i) < heightOf(shortest)) shortest = i;
    }
    const source = bucketOf(tallest);
    if (tallest === shortest || source.length < 2) break;

    const spread = heightOf(tallest) - heightOf(shortest);
    let gain = 0;
    let pick = -1;
    let dest = -1;
    source.forEach((candidate, s) => {
      for (let d = 0; d < cols; d++) {
        if (d === tallest) continue;
        const trial = heights.slice();
        trial[tallest] = (trial[tallest] ?? 0) - candidate.height;
        trial[d] = (trial[d] ?? 0) + candidate.height;
        const newSpread = Math.max(...trial) - Math.min(...trial);
        if (spread - newSpread > gain + 1) {
          gain = spread - newSpread;
          pick = s;
          dest = d;
        }
      }
    });
    if (pick < 0) break;

    const [moved] = source.splice(pick, 1);
    if (!moved) break;
    bucketOf(dest).push(moved);
    heights[tallest] = heightOf(tallest) - moved.height;
    heights[dest] = heightOf(dest) + moved.height;
  }

  // Keep each column in the original photo order.
  return buckets.map((bucket) =>
    bucket.sort((a, b) => a.order - b.order).map((entry) => entry.item),
  );
}
