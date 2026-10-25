// Read-only check for security.md §9: no EXIF / GPS / XMP / IPTC in what visitors download.
// Fetches every portfolio photo and client logo from the Sanity CDN twice (the stored master
// and the derivative the site's image loader asks for) and inspects them with sharp.
//
//   pnpm --filter studio exec sanity exec scripts/verify-cdn.ts -- [--sample 5]
//   pnpm --filter studio exec sanity exec scripts/verify-cdn.ts -- --file ./some.jpg   (local file)
//
// Needs no token (the dataset is public) and writes nothing. Exit code 1 if metadata is found.

import { readFile } from "node:fs/promises";
import { getCliClient } from "sanity/cli";
import sharp from "sharp";

const args = process.argv.slice(2);
const fileIndex = args.indexOf("--file");
const sampleIndex = args.indexOf("--sample");
const sample = sampleIndex >= 0 ? Number(args[sampleIndex + 1]) : Infinity;

type Finding = {
  label: string;
  format?: string;
  bytes: number;
  leaks: string[];
};

async function inspect(label: string, buffer: Buffer): Promise<Finding> {
  const meta = await sharp(buffer).metadata();
  const leaks = (["exif", "xmp", "iptc", "tifftagPhotoshop"] as const).filter(
    (key) => meta[key] !== undefined,
  );
  return { label, format: meta.format, bytes: buffer.length, leaks };
}

async function download(url: string, accept: string): Promise<Buffer> {
  const response = await fetch(url, { headers: { accept } });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return Buffer.from(await response.arrayBuffer());
}

const findings: Finding[] = [];

if (fileIndex >= 0) {
  const file = args[fileIndex + 1];
  if (!file) throw new Error("--file needs a path");
  findings.push(await inspect(file, await readFile(file)));
} else {
  const client = getCliClient({ apiVersion: "2026-10-01", useCdn: false });
  const rows = await client.fetch<Array<{ id: string; url: string | null }>>(
    `*[_type in ["portfolioItem", "client"]]{
      "id": _id,
      "url": coalesce(image.asset, logo.asset)->url
    }[defined(url)]`,
  );
  console.log(
    `Checking ${Math.min(rows.length, sample)} of ${rows.length} images…`,
  );
  for (const row of rows.slice(0, sample)) {
    if (!row.url) continue;
    // Same parameters as web/src/sanity/image-loader.ts, asking for the modern format first.
    const derivative = `${row.url}?w=1600&q=90&auto=format&fit=max`;
    findings.push(
      await inspect(`${row.id} master`, await download(row.url, "image/*")),
    );
    findings.push(
      await inspect(
        `${row.id} derivative`,
        await download(derivative, "image/avif,image/webp,image/*"),
      ),
    );
  }
}

for (const finding of findings) {
  const status = finding.leaks.length === 0 ? "ok  " : "LEAK";
  console.log(
    `${status} ${finding.label} (${finding.format}, ${(finding.bytes / 1e3).toFixed(0)} kB)` +
      (finding.leaks.length ? `: ${finding.leaks.join(", ")}` : ""),
  );
}
const leaking = findings.filter((finding) => finding.leaks.length > 0);
console.log(
  `\n${findings.length} files checked, ${leaking.length} with metadata.`,
);
if (leaking.length > 0) process.exit(1);
