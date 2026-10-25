// Visual parity: screenshot each section of the approved prototype and of the app at
// 390/820/1440 px and diff them. Spec: .agents/skills/prototype-parity/SKILL.md.
//
//   pnpm parity [--section hero] [--url http://localhost:3000] [--proto <file>]
//               [--theme light] [--locale en|uk] [--widths 390,820] [--no-isolate]
//
// Needs the web dev server running. Output: <repo>/.parity/<section>-<width>-{proto,app,diff}.png

import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { pathToFileURL } from "node:url";
import pixelmatch from "pixelmatch";
import pngjs from "pngjs";
import { chromium, type Page } from "playwright";

const { PNG } = pngjs;

const repo = path.resolve(import.meta.dirname, "../../..");
const outDir = path.join(repo, ".parity");

const { values: args } = parseArgs({
  allowNegative: true,
  options: {
    section: { type: "string" },
    url: { type: "string", default: "http://localhost:3000" },
    proto: {
      type: "string",
      default: path.resolve(repo, "../fotmark_website.html"),
    },
    theme: { type: "string", default: "dark" },
    locale: { type: "string", default: "es" },
    widths: { type: "string", default: "390,820,1440" },
    // Hide everything before the section while shooting it (see `isolate`).
    isolate: { type: "boolean", default: true },
  },
});

const MAX_DIFF = 0.5; // % of mismatched pixels per section
const MAX_HEIGHT_DELTA = 2; // px

// prototype selector → app `[data-section]`
const SECTIONS: [proto: string, app: string][] = [
  ["header", "header"],
  ["#top", "hero"],
  [".marq", "marquee"],
  ["#quehacemos", "quehacemos"],
  ["#servicios", "servicios"],
  ["#proceso", "proceso"],
  ["#sectores", "sectores"],
  [".why", "porque"],
  [".appr", "enfoque"],
  ["#proyectos", "proyectos"],
  ["#clientes", "clientes"],
  ["#sobre", "sobre"],
  ["#contacto", "contacto"],
  ["footer", "footer"],
];

// Freeze motion at its end state and hide noise. Photos and brand marks are masked:
// we compare layout, type and lines; the image pipeline legitimately differs.
const FREEZE_CSS = `
*,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;animation-iteration-count:1!important;transition:none!important}
.rv,[data-reveal]{opacity:1!important;transform:none!important}
.grain,.prog,[data-grain],[data-progress],[data-skip-link]{display:none!important}
header{position:absolute!important}
img,[data-brand-mark]{opacity:0!important}
nextjs-portal{display:none!important}
[data-parity-hidden]{display:none!important}
`;

const PREFIX: Record<string, string> = { es: "", en: "/en", uk: "/ua" };
const compareMode = args.theme === "dark" && args.locale === "es";
const widths = args.widths.split(",").map(Number);
const sections = SECTIONS.filter(
  ([, app]) => !args.section || app === args.section,
);

if (!sections.length) {
  console.error(`Unknown section "${args.section}".`);
  process.exit(2);
}
if (compareMode && !fs.existsSync(args.proto)) {
  console.error(`Prototype not found: ${args.proto} (pass --proto).`);
  process.exit(2);
}
fs.mkdirSync(outDir, { recursive: true });

type Row = { section: string; width: number; result: string; ok: boolean };
const rows: Row[] = [];

async function prepare(page: Page, url: string) {
  await page.goto(url, { waitUntil: "networkidle" });
  await page.addStyleTag({ content: FREEZE_CSS });
  if (args.theme !== "dark") {
    await page.evaluate(
      (t) => (document.documentElement.dataset.theme = t),
      args.theme,
    );
  }
  await page.evaluate(async () => {
    window.scrollTo(0, 0);
    await document.fonts.ready;
    await new Promise((r) =>
      requestAnimationFrame(() => requestAnimationFrame(r)),
    );
  });
}

// Hide every element before `selector` (at each ancestor level), so the section starts at
// the top of the page in both documents. Otherwise its screenshot depends on the sub-pixel
// height of everything above it, including sections the app hasn't ported yet.
async function isolate(page: Page, selector: string) {
  await page.evaluate((sel) => {
    let node = document.querySelector(sel);
    while (node && node !== document.body) {
      for (let s = node.previousElementSibling; s; s = s.previousElementSibling)
        s.setAttribute("data-parity-hidden", "");
      node = node.parentElement;
    }
  }, selector);
}

async function unisolate(page: Page) {
  await page.evaluate(() => {
    for (const el of document.querySelectorAll("[data-parity-hidden]"))
      el.removeAttribute("data-parity-hidden");
  });
}

async function shoot(page: Page, selector: string, file: string) {
  const el = page.locator(selector).first();
  if (!(await el.count())) return null;
  if (args.isolate) await isolate(page, selector);
  const buf = await el.screenshot({ path: file, animations: "disabled" });
  if (args.isolate) await unisolate(page);
  return PNG.sync.read(buf);
}

function crop(img: InstanceType<typeof PNG>, width: number, height: number) {
  const out = new PNG({ width, height });
  PNG.bitblt(img, out, 0, 0, width, height, 0, 0);
  return out;
}

const browser = await chromium.launch();
try {
  for (const width of widths) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
      deviceScaleFactor: 1,
    });
    const app = await context.newPage();
    await prepare(app, `${args.url}${PREFIX[args.locale] ?? ""}`);

    const hScroll = await app.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    if (hScroll)
      rows.push({
        section: "(page)",
        width,
        result: "horizontal scroll",
        ok: false,
      });

    const proto = compareMode ? await context.newPage() : null;
    if (proto) await prepare(proto, pathToFileURL(args.proto).href);

    for (const [protoSel, name] of sections) {
      const base = path.join(outDir, `${name}-${width}`);
      const suffix = compareMode ? "" : `-${args.theme}-${args.locale}`;
      const a = await shoot(
        app,
        `[data-section="${name}"]`,
        `${base}-app${suffix}.png`,
      );
      if (!a) {
        rows.push({
          section: name,
          width,
          result: "SKIP (not in app yet)",
          ok: true,
        });
        continue;
      }
      if (!proto) {
        rows.push({
          section: name,
          width,
          result: `shot ${a.width}×${a.height}`,
          ok: true,
        });
        continue;
      }
      const p = await shoot(proto, protoSel, `${base}-proto.png`);
      if (!p) {
        rows.push({
          section: name,
          width,
          result: "SKIP (not in prototype)",
          ok: true,
        });
        continue;
      }

      const w = Math.min(a.width, p.width);
      const h = Math.min(a.height, p.height);
      const diff = new PNG({ width: w, height: h });
      const bad = pixelmatch(
        crop(p, w, h).data,
        crop(a, w, h).data,
        diff.data,
        w,
        h,
        {
          threshold: 0.1,
        },
      );
      fs.writeFileSync(`${base}-diff.png`, PNG.sync.write(diff));

      const pct = (bad / (w * h)) * 100;
      const dh = Math.abs(a.height - p.height);
      const sizeOk = a.width === p.width && dh <= MAX_HEIGHT_DELTA;
      const ok = sizeOk && pct <= MAX_DIFF;
      const size = sizeOk
        ? ""
        : ` · size app ${a.width}×${a.height} vs proto ${p.width}×${p.height}`;
      rows.push({
        section: name,
        width,
        result: `${pct.toFixed(3)}%${size}`,
        ok,
      });
    }
    await context.close();
  }
} finally {
  await browser.close();
}

const pad = (s: string, n: number) => s.padEnd(n);
console.log(`\n${pad("section", 12)}${pad("width", 7)}result`);
for (const r of rows) {
  console.log(
    `${pad(r.section, 12)}${pad(String(r.width), 7)}${r.ok ? "" : "FAIL "}${r.result}`,
  );
}
console.log(`\nImages: ${path.relative(process.cwd(), outDir)}/`);

const failed = rows.filter((r) => !r.ok).length;
if (failed) {
  console.error(`${failed} failure(s).`);
  process.exit(1);
}
