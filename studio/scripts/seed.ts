// One-off content seed for the hosted Sanity project (D-036).
//
//   pnpm --filter studio exec sanity exec scripts/seed.ts --with-user-token -- --dry-run
//   pnpm --filter studio exec sanity exec scripts/seed.ts --with-user-token            (writes!)
//   … -- --replace   only when documents with these ids already exist and may be overwritten
//
// Authentication is the logged-in developer's own token (`--with-user-token`, `sanity login`):
// no write token is stored anywhere. `--dry-run` writes nothing: it encodes the images in
// memory, reads the dataset (read-only) and prints exactly what a real run would do.
//
// What a real run does:
//   1. uploads every gallery photo (re-encoded, see encodePhoto) and the client logos as assets,
//   2. creates or replaces 67 documents in one transaction: 1 settings, 7 category, 6 client,
//      6 testimonial, 6 service, 41 portfolioItem, all with deterministic ids so a re-run never duplicates,
//   3. refuses to start if any target document already exists, unless `--replace` is given
//      (replacing discards edits made in Studio since the last seed, including list order).
//
// Inputs (read-only): scripts/.out/photo-map.json + match-details.json (from match-photos.ts),
// the original photos it points at, and ../../clients/*.webp in the workspace folder.

import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { SanityClient } from "sanity";
import { getCliClient } from "sanity/cli";
import sharp from "sharp";
import { CATEGORIES, CLIENTS, SERVICES, TESTIMONIALS } from "./seed-data";
import {
  buildDocuments,
  LANGS,
  pad2,
  type Assets,
  type Crop,
  type Lang,
} from "./seed-docs";

// ---------------------------------------------------------------------------------------
// Configuration

const STUDIO_DIR = process.env.SANITY_BASE_PATH ?? process.cwd();
const OUT_DIR = path.join(STUDIO_DIR, "scripts", ".out");
const CLIENTS_DIR = path.resolve(STUDIO_DIR, "..", "..", "clients");

const API_VERSION = "2026-10-01";

// Photo masters: the long side is capped (the originals are 4672–7008 px), nothing is upscaled.
// 3200 px keeps a 2x lightbox sharp; the Sanity CDN derives every smaller size from it.
const MAX_LONG_SIDE = 3200;
const JPEG = {
  quality: 92,
  mozjpeg: true,
  progressive: true,
  chromaSubsampling: "4:4:4",
} as const;
// Same tolerance the matcher uses to decide that a frame is cropped relative to its original.
const RATIO_TOLERANCE = 0.015;

const args = process.argv.slice(2);
const KNOWN_FLAGS = new Set(["--dry-run", "--replace"]);
const unknownFlags = args.filter((arg) => !KNOWN_FLAGS.has(arg));
if (unknownFlags.length > 0) {
  console.error(
    `Unknown argument(s): ${unknownFlags.join(" ")}. Known: ${[...KNOWN_FLAGS].join(" ")}`,
  );
  process.exit(2);
}
const DRY_RUN = args.includes("--dry-run");
const REPLACE = args.includes("--replace");

// ---------------------------------------------------------------------------------------
// Types and small helpers

type PhotoMapEntry = {
  order: number;
  category: string;
  caption: Record<Lang, string>;
  alt: Record<Lang, string>;
  aspectRatio: number;
  original: string;
  distance?: number;
};

type MatchDetail = {
  order: number;
  recoveredCrop?: (Crop & { rms?: number }) | null;
};

const problems: string[] = []; // block a real run
const warnings: string[] = []; // reported only

const mb = (bytes: number) => `${(bytes / 1e6).toFixed(2)} MB`;

async function readJson<T>(file: string): Promise<T | undefined> {
  try {
    return JSON.parse(await readFile(file, "utf8")) as T;
  } catch {
    return undefined;
  }
}

// ---------------------------------------------------------------------------------------
// Images

type PreparedPhoto = {
  entry: PhotoMapEntry;
  docId: string;
  buffer: Buffer;
  width: number;
  height: number;
  bytesBefore: number;
  sourceFormat: string;
  sourceSize: string;
  hadExif: boolean;
  sourceIcc: boolean;
  crop: Crop | null;
  note: string[];
};

/**
 * Original → upload master: auto-rotate (the EXIF orientation is baked into the pixels),
 * convert embedded ICC profiles (31 sRGB, 5 Display P3) to sRGB and drop ALL metadata
 * (EXIF with camera make/model/date, XMP, IPTC, the profile itself), cap the long side,
 * re-encode as high-quality JPEG. Asserts that nothing but pixels survived.
 */
async function encodePhoto(file: string) {
  const original = await readFile(file);
  const sourceMeta = await sharp(original).metadata();
  const { data, info } = await sharp(original)
    .rotate()
    .resize({
      width: MAX_LONG_SIDE,
      height: MAX_LONG_SIDE,
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg(JPEG)
    .toBuffer({ resolveWithObject: true });

  const out = await sharp(data).metadata();
  const leftovers = (
    ["exif", "xmp", "iptc", "icc", "tifftagPhotoshop", "orientation"] as const
  ).filter((key) => out[key] !== undefined);
  if (leftovers.length > 0) {
    throw new Error(
      `metadata survived re-encoding (${leftovers.join(", ")}): ${path.basename(file)}`,
    );
  }
  if (out.space !== "srgb")
    throw new Error(
      `output is not sRGB (${out.space}): ${path.basename(file)}`,
    );

  return {
    buffer: data,
    width: info.width,
    height: info.height,
    bytesBefore: original.length,
    sourceMeta,
  };
}

async function preparePhotos(
  map: PhotoMapEntry[],
  details: MatchDetail[] | undefined,
): Promise<PreparedPhoto[]> {
  const prepared: PreparedPhoto[] = [];
  for (const entry of map) {
    const docId = `portfolio-${pad2(entry.order)}`;
    const note: string[] = [];
    if (!existsSync(entry.original)) {
      problems.push(`${docId}: original not found: ${entry.original}`);
      continue;
    }
    let encoded: Awaited<ReturnType<typeof encodePhoto>>;
    try {
      encoded = await encodePhoto(entry.original);
    } catch (error) {
      problems.push(
        `${docId}: ${error instanceof Error ? error.message : String(error)}`,
      );
      continue;
    }
    const { sourceMeta } = encoded;

    // The prototype frame is the spec. If it is cropped relative to the original, the matcher
    // recovered that crop; it becomes Sanity's non-destructive crop (the full original is
    // uploaded) plus a centred hotspot.
    const detail = details?.find((d) => d.order === entry.order);
    const rc = detail?.recoveredCrop;
    const crop: Crop | null = rc
      ? { top: rc.top, bottom: rc.bottom, left: rc.left, right: rc.right }
      : null;
    const croppedRatio = crop
      ? (encoded.width * (1 - crop.left - crop.right)) /
        (encoded.height * (1 - crop.top - crop.bottom))
      : encoded.width / encoded.height;
    if (crop)
      note.push(
        `crop L${crop.left} R${crop.right} T${crop.top} B${crop.bottom} → ratio ${croppedRatio.toFixed(4)}`,
      );
    if (
      Math.abs(croppedRatio - entry.aspectRatio) / entry.aspectRatio >
      RATIO_TOLERANCE
    ) {
      warnings.push(
        `${docId}: displayed ratio ${croppedRatio.toFixed(4)} differs from the prototype frame ${entry.aspectRatio}` +
          (crop ? "" : " and match-details.json has no recoveredCrop for it"),
      );
    }
    if (entry.distance !== undefined && entry.distance > 10) {
      warnings.push(
        `${docId}: weak perceptual match (distance ${entry.distance}); check the photo in the report`,
      );
    }
    if (Math.max(encoded.width, encoded.height) < 1600) {
      warnings.push(
        `${docId}: long side ${Math.max(encoded.width, encoded.height)} px < 1600 (Studio shows a warning, still publishable)`,
      );
    }

    prepared.push({
      entry,
      docId,
      buffer: encoded.buffer,
      width: encoded.width,
      height: encoded.height,
      bytesBefore: encoded.bytesBefore,
      sourceFormat: sourceMeta.format ?? "?",
      sourceSize: `${sourceMeta.width}x${sourceMeta.height}`,
      hadExif: Boolean(sourceMeta.exif),
      sourceIcc: Boolean(sourceMeta.icc),
      crop,
      note,
    });
  }
  return prepared;
}

type PreparedLogo = {
  slug: string;
  file: string;
  buffer: Buffer;
  width: number;
  height: number;
};

async function prepareLogos(): Promise<PreparedLogo[]> {
  const logos: PreparedLogo[] = [];
  for (const client of CLIENTS) {
    if (!client.logoFile) continue;
    const file = path.join(CLIENTS_DIR, client.logoFile);
    if (!existsSync(file)) {
      problems.push(`client-${client.slug}: logo not found: ${file}`);
      continue;
    }
    const buffer = await readFile(file);
    const meta = await sharp(buffer).metadata();
    const dirty = (["exif", "xmp", "iptc", "icc"] as const).filter(
      (key) => meta[key] !== undefined,
    );
    if (dirty.length > 0) {
      problems.push(
        `client-${client.slug}: logo carries metadata (${dirty.join(", ")}); strip it before seeding`,
      );
    }
    const width = meta.width ?? 0;
    const height = meta.height ?? 0;
    if (
      client.logoSize &&
      (client.logoSize.width !== width || client.logoSize.height !== height)
    ) {
      warnings.push(
        `client-${client.slug}: logo is ${width}x${height}, the fallback expected ${client.logoSize.width}x${client.logoSize.height}`,
      );
    }
    logos.push({ slug: client.slug, file, buffer, width, height });
  }
  return logos;
}

// ---------------------------------------------------------------------------------------
// Validation of the inputs

function validateMap(map: PhotoMapEntry[]) {
  const knownCategories = new Set(CATEGORIES.map((c) => c.key));
  const orders = new Set<number>();
  for (const entry of map) {
    const id = `portfolio-${pad2(entry.order)}`;
    if (orders.has(entry.order))
      problems.push(`${id}: duplicate order ${entry.order}`);
    orders.add(entry.order);
    if (!knownCategories.has(entry.category))
      problems.push(`${id}: unknown category "${entry.category}"`);
    for (const lang of LANGS) {
      if (!entry.caption?.[lang]?.trim())
        problems.push(`${id}: empty caption.${lang}`);
      if (!entry.alt?.[lang]?.trim())
        problems.push(
          `${id}: empty alt.${lang} (alt is required in all three locales)`,
        );
    }
    if (!(entry.aspectRatio > 0))
      problems.push(`${id}: bad aspectRatio ${entry.aspectRatio}`);
  }
  const sorted = [...orders].sort((a, b) => a - b);
  if (sorted.some((order, index) => order !== index)) {
    warnings.push(
      `photo-map orders are not 0..${map.length - 1} without gaps; the gallery order follows "order"`,
    );
  }
}

// ---------------------------------------------------------------------------------------
// Main

function summarizeAlt(map: PhotoMapEntry[]): string {
  const missing = map.filter((entry) =>
    LANGS.some((lang) => !entry.alt?.[lang]?.trim()),
  );
  return missing.length === 0
    ? "all present"
    : `${missing.length} of ${map.length} entries lack an alt in at least one locale`;
}

async function main() {
  console.log(
    `\nFotmark seed ${DRY_RUN ? "(DRY RUN: nothing is written)" : "(WRITING to the hosted dataset)"}`,
  );

  // 1. Inputs
  const mapFile = path.join(OUT_DIR, "photo-map.json");
  const rawMap = await readJson<PhotoMapEntry[]>(mapFile);
  if (!rawMap || rawMap.length === 0) {
    console.error(
      `\nMissing or empty ${mapFile}. Run scripts/match-photos.ts first.`,
    );
    process.exit(1);
  }
  const map = [...rawMap].sort((a, b) => a.order - b.order);
  const details = await readJson<MatchDetail[]>(
    path.join(OUT_DIR, "match-details.json"),
  );
  if (!details)
    warnings.push(
      "scripts/.out/match-details.json is missing: no photo crop can be applied",
    );
  validateMap(map);

  // 2. Encode (in memory)
  console.log(
    `\nEncoding ${map.length} photos (long side ≤ ${MAX_LONG_SIDE}px, JPEG q${JPEG.quality} 4:4:4, sRGB, no metadata)…`,
  );
  const photos = await preparePhotos(map, details);
  const logos = await prepareLogos();

  // 3. Existing state (read-only)
  const wantedIds = [
    "settings",
    ...CATEGORIES.map((c) => `category-${c.key}`),
    ...CLIENTS.map((c) => `client-${c.slug}`),
    ...TESTIMONIALS.map((t) => `testimonial-${t.clientSlug}`),
    ...SERVICES.map((service) => `service-${service.icon}`),
    ...map.map((entry) => `portfolio-${pad2(entry.order)}`),
  ];
  const client: SanityClient = getCliClient({
    apiVersion: API_VERSION,
    useCdn: false,
  });
  let existing = new Set<string>();
  let existingNote = "";
  try {
    const found = await client.fetch<Array<{ _id: string }>>(
      "*[_id in $ids || _id in $drafts]{_id}",
      {
        ids: wantedIds,
        drafts: wantedIds.map((id) => `drafts.${id}`),
      },
    );
    existing = new Set(found.map((doc) => doc._id));
  } catch (error) {
    existingNote = `could not read the dataset (${error instanceof Error ? error.message : String(error)})`;
    if (!DRY_RUN) problems.push(existingNote);
  }
  const existingTargets = wantedIds.filter((id) => existing.has(id));
  const existingDrafts = wantedIds.filter((id) => existing.has(`drafts.${id}`));
  if (existingTargets.length > 0 && !REPLACE) {
    problems.push(
      `${existingTargets.length} target document(s) already exist (${existingTargets.slice(0, 5).join(", ")}${existingTargets.length > 5 ? ", …" : ""}); ` +
        "pass --replace to overwrite them (discards edits made in Studio, incl. list order)",
    );
  }

  // 4. Report
  const config = client.config();
  console.log(
    `\nTarget: project ${config.projectId}, dataset ${config.dataset}`,
  );
  console.log(
    `Existing: ${existingNote || `${existingTargets.length} of ${wantedIds.length} target ids exist${existingDrafts.length ? `, ${existingDrafts.length} have an open draft (left untouched)` : ""}`}`,
  );

  console.log(
    "\nPhotos (order id category | source → master | size before → after | notes)",
  );
  let before = 0;
  let after = 0;
  for (const photo of photos) {
    before += photo.bytesBefore;
    after += photo.buffer.length;
    const meta = [
      photo.hadExif ? "EXIF stripped" : "no EXIF",
      photo.sourceIcc ? "ICC→sRGB" : "no ICC",
      ...photo.note,
    ].join("; ");
    console.log(
      `  ${pad2(photo.entry.order)} ${photo.docId.padEnd(13)} ${photo.entry.category.padEnd(12)} | ` +
        `${photo.sourceFormat} ${photo.sourceSize} → jpeg ${photo.width}x${photo.height} | ` +
        `${mb(photo.bytesBefore).padStart(9)} → ${mb(photo.buffer.length).padStart(8)} | ${meta}`,
    );
  }
  console.log(
    `  total: ${photos.length} photos, ${mb(before)} → ${mb(after)} (${((after / before) * 100).toFixed(1)}%)`,
  );

  console.log("\nLogos");
  for (const logo of logos) {
    console.log(
      `  client-${logo.slug.padEnd(20)} ${path.basename(logo.file)} ${logo.width}x${logo.height} ${mb(logo.buffer.length)} (uploaded as is, no metadata)`,
    );
  }

  const counts = {
    settings: 1,
    category: CATEGORIES.length,
    client: CLIENTS.length,
    testimonial: TESTIMONIALS.length,
    service: SERVICES.length,
    portfolioItem: photos.length,
  };
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  console.log(
    `\nDocuments (createOrReplace, ${total}): ${Object.entries(counts)
      .map(([type, n]) => `${type} ${n}`)
      .join(", ")}`,
  );
  console.log(
    `  ids: settings; ${CATEGORIES.map((c) => `category-${c.key}`).join(", ")}`,
  );
  console.log(`       ${CLIENTS.map((c) => `client-${c.slug}`).join(", ")}`);
  console.log(
    `       ${TESTIMONIALS.map((t) => `testimonial-${t.clientSlug}`).join(", ")}`,
  );
  console.log(
    `       ${SERVICES.map((service) => `service-${service.icon}`).join(", ")}`,
  );
  console.log(
    `       portfolio-${pad2(map[0]?.order ?? 0)} … portfolio-${pad2(map.at(-1)?.order ?? 0)}`,
  );
  console.log(
    `Assets to upload: ${photos.length} photos + ${logos.length} logos (Sanity de-duplicates identical bytes, so a re-run adds none)`,
  );
  console.log(`Alt texts: ${summarizeAlt(map)}`);
  console.log(
    "Settings: contacts, founder, location, address, service area, stats. No SEO texts (not in the fallbacks; Illia fills them).",
  );

  if (warnings.length > 0)
    console.log(
      `\nWarnings (${warnings.length})\n${warnings.map((w) => `  - ${w}`).join("\n")}`,
    );
  if (problems.length > 0)
    console.log(
      `\nBLOCKING problems (${problems.length}): a real run would stop\n${problems.map((p) => `  - ${p}`).join("\n")}`,
    );

  if (DRY_RUN) {
    console.log(
      `\nDry run finished: nothing was uploaded or written.${problems.length > 0 ? " Fix the blocking problems first." : ""}`,
    );
    return;
  }
  if (problems.length > 0) {
    console.error("\nAborted before writing anything.");
    process.exit(1);
  }
  if (!config.token) {
    console.error(
      "\nNo auth token. Run with `sanity exec scripts/seed.ts --with-user-token` after `sanity login`.",
    );
    process.exit(1);
  }

  // 5. Write: assets first, then one transaction with all documents.
  const assets: Assets = { photos: new Map(), logos: new Map() };
  for (const logo of logos) {
    const asset = await client.assets.upload("image", logo.buffer, {
      filename: `client-${logo.slug}.webp`,
      contentType: "image/webp",
    });
    assets.logos.set(logo.slug, asset._id);
    console.log(`  uploaded logo ${logo.slug} → ${asset._id}`);
  }
  for (const photo of photos) {
    const asset = await client.assets.upload("image", photo.buffer, {
      filename: `${photo.docId}.jpg`,
      contentType: "image/jpeg",
    });
    assets.photos.set(photo.docId, asset._id);
    console.log(`  uploaded ${photo.docId} → ${asset._id}`);
  }

  const docs = buildDocuments(photos, assets);
  const transaction = docs.reduce(
    (tx, doc) => tx.createOrReplace(doc),
    client.transaction(),
  );
  const result = await transaction.commit();
  console.log(
    `\nDone: ${result.results.length} document mutations committed (transaction ${result.transactionId}).`,
  );
}

await main();
