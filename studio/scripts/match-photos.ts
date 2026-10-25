/**
 * Step 3: match the 41 original portfolio photos to the 41 gallery frames of the approved prototype.
 *
 *   node studio/scripts/match-photos.ts          (from the repo root; plain Node 24, erasable TypeScript only)
 *
 * Inputs (outside the repo, read-only, never copied into it):
 *   ../fotmark_website.html   prototype with every gallery photo embedded as a data URI (parsed here, never opened)
 *   ../Foto website/          the 41 originals (JPG/PNG, EXIF orientation applied via sharp().rotate())
 *
 * Outputs (gitignored, studio/scripts/.out/):
 *   photo-map.json     one entry per frame, in order; read by seed.ts (field names are a contract)
 *   match-details.json extra diagnostics per frame (hashes, margins, flags, EXIF presence), not part of the contract
 *   match-report.md    the table plus the list of unmatched / ambiguous items
 *   previews/NN.jpg    800px long-side JPEG of each matched original (EXIF stripped)
 *
 * Matching: 64-bit dHash plus a 16x16 z-normalised grayscale thumbnail, compared on a "fill" resize so crops
 * show up as distance. When aspect ratios differ the original is cropped to the frame's ratio at several
 * offsets and the best variant wins. The one-to-one assignment is optimal (Hungarian algorithm).
 *
 * Alt texts and caption translations below are DRAFTS for Illia's review (ES first, then EN / UA).
 */
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import sharp from "sharp";

const pad2 = (n: number) => String(n).padStart(2, "0");
const round = (n: number, d = 3) => Math.round(n * 10 ** d) / 10 ** d;

// ---------------------------------------------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------------------------------------------

const HERE = import.meta.dirname;
const WORKSPACE = resolve(HERE, "../../..");
const HTML_PATH =
  process.env.FOTMARK_PROTOTYPE_HTML ?? join(WORKSPACE, "fotmark_website.html");
const ORIGINALS_DIR =
  process.env.FOTMARK_ORIGINALS_DIR ?? join(WORKSPACE, "Foto website");
const OUT_DIR = join(HERE, ".out");
const PREVIEWS_DIR = join(OUT_DIR, "previews");

// ---------------------------------------------------------------------------------------------------------------
// Types and drafts (captions, alt texts)
// ---------------------------------------------------------------------------------------------------------------

type Locale = "es" | "en" | "uk";
type Localized = Record<Locale, string>;

const CATEGORY_BY_CODE: Record<string, string> = {
  gas: "gastronomia",
  jap: "japones",
  beb: "bebidas",
  eve: "eventos",
  inm: "inmobiliaria",
  int: "interiores",
  ret: "retratos",
};

/** ES captions are the prototype's `.cap` text, verbatim. EN / UA are drafts (terms follow web/src/messages). */
const CAPTION_TRANSLATIONS: Record<string, { en: string; uk: string }> = {
  Gastronomía: { en: "Food", uk: "Гастрономія" },
  Japonés: { en: "Japanese", uk: "Японська кухня" },
  Bebidas: { en: "Drinks", uk: "Напої" },
  Coctelería: { en: "Cocktails", uk: "Коктейлі" },
  Producto: { en: "Product", uk: "Продукт" },
  Eventos: { en: "Events", uk: "Події" },
  Inmobiliaria: { en: "Real estate", uk: "Нерухомість" },
  Interiores: { en: "Interiors", uk: "Інтер’єри" },
  Retratos: { en: "Portraits", uk: "Портрети" },
  "Marca personal": { en: "Personal brand", uk: "Особистий бренд" },
};

/**
 * Draft alt texts keyed by prototype order (0-40). Written from the 800px previews of the matched originals.
 * No client or venue is named unless the photo itself shows it.
 */
const draft = (es: string, en: string, uk: string): Localized => ({
  es,
  en,
  uk,
});

const ALT_DRAFTS: Record<number, Localized> = {
  0: draft(
    "Gambas en aceite con ajo servidas en una fuente blanca sobre fondo negro, fotografía gastronómica en Málaga",
    "Prawns in garlic oil served in a white dish on a black background, food photography in Málaga",
    "Креветки в олії з часником у білій таріллі на чорному тлі, гастрономічне фото у Малазі",
  ),
  1: draft(
    "Asistente con una lata verde en la mano durante un evento al atardecer, con grúas del puerto al fondo",
    "Guest holding a green can at an evening event, with port cranes in the background",
    "Гість тримає зелену банку на вечірньому заході біля порту, позаду видно портові крани",
  ),
  2: draft(
    "Rolls de sushi gratinados con jengibre y wasabi sobre una hoja verde, fotografía para restaurante japonés en Málaga",
    "Baked sushi rolls with pickled ginger and wasabi on a green leaf, photography for a Japanese restaurant in Málaga",
    "Запечені суші-роли з імбиром і васабі на зеленому листку, фото для японського ресторану у Малазі",
  ),
  3: draft(
    "Lata de cerveza artesanal Blinkers Brew Amber Ale entre rocas, con el cielo al fondo",
    "Can of Blinkers Brew Amber Ale craft beer wedged between rocks, with the sky behind",
    "Банка крафтового пива Blinkers Brew Amber Ale між скелями на тлі неба",
  ),
  4: draft(
    "Sala de restaurante con sillas de terciopelo rojo, lámpara de cristal y cocina abierta al fondo",
    "Restaurant dining room with red velvet chairs, a crystal chandelier and an open kitchen behind",
    "Зал ресторану з червоними оксамитовими кріслами, кришталевою люстрою та відкритою кухнею позаду",
  ),
  5: draft(
    "Roll de sushi con pescado sellado junto a una botella negra de cerámica y un plato de salsa de soja",
    "Sushi roll topped with seared fish beside a black ceramic bottle and a dish of soy sauce",
    "Суші-рол з обсмаженою рибою поруч із чорною керамічною пляшкою та блюдцем із соєвим соусом",
  ),
  6: draft(
    "Cóctel rojo con pajitas de rayas en vaso de cristal tallado, con la barra del bar desenfocada al fondo",
    "Red cocktail with striped straws in a cut-glass tumbler, the bar blurred behind",
    "Червоний коктейль зі смугастими трубочками в склянці з гранованого скла, бар розмитий позаду",
  ),
  7: draft(
    "Villa moderna blanca con piscina infinita y tumbonas bajo un cielo azul, fotografía inmobiliaria en la Costa del Sol",
    "Modern white villa with an infinity pool and sun loungers under a blue sky, property photography on the Costa del Sol",
    "Сучасна біла вілла з басейном-інфініті та шезлонгами під блакитним небом, фото нерухомості на Costa del Sol",
  ),
  8: draft(
    "Carne en salsa con puré de patata, brotes y cebollino servida en un plato blanco, fotografía gastronómica",
    "Meat in sauce with mashed potato, micro herbs and chives on a white plate, food photography",
    "М’ясо в соусі з картопляним пюре, мікрозеленню та шніт-цибулею на білій тарілці, гастрономічне фото",
  ),
  9: draft(
    "Roll de sushi con aguacate y láminas de almendra sobre una barra de restaurante japonés, fondo desenfocado",
    "Sushi roll with avocado and flaked almonds on a Japanese restaurant counter, soft-focus background",
    "Суші-рол з авокадо та мигдальними пелюстками на стійці японського ресторану, розмите тло",
  ),
  10: draft(
    "Bolsa de papel y latas de cerveza Blinkers Brew de distintos colores sobre la arena de una playa",
    "Paper bag and cans of Blinkers Brew beer in different colours standing in beach sand",
    "Паперовий пакет і банки пива Blinkers Brew різних кольорів у піску на пляжі",
  ),
  11: draft(
    "Retrato de marca personal: mujer con blazer fucsia y un ramo de flores envuelto en papel lila, en la calle",
    "Personal brand portrait: woman in a fuchsia blazer holding a bouquet wrapped in lilac paper, on a street",
    "Портрет для особистого бренду: жінка в піджаку кольору фуксії з букетом у бузковому папері на вулиці",
  ),
  12: draft(
    "Grupo de jóvenes bailando en una fiesta al atardecer junto al mar, con las manos en alto",
    "Young guests dancing at a seaside party at sunset, hands in the air",
    "Молоді гості танцюють на вечірці біля моря на заході сонця, підвівши руки вгору",
  ),
  13: draft(
    "Interior luminoso con arcos de ladrillo visto, paredes blancas, una silla negra y un gong decorativo",
    "Bright interior with exposed-brick arches, white walls, a black chair and a decorative gong",
    "Світлий інтер’єр з арками з цегли, білими стінами, чорним стільцем і декоративним гонгом",
  ),
  14: draft(
    "Cruasán untado con mermelada de fresa junto a un batido de fresa con nata, en una mesa de desayuno",
    "Croissant spread with strawberry jam beside a strawberry milkshake with cream, on a breakfast table",
    "Круасан із полуничним джемом поруч із полуничним молочним коктейлем з вершками на столі для сніданку",
  ),
  15: draft(
    "Cóctel rojizo con hielo en un vaso de cristal tallado, plano inclinado con luces de bar desenfocadas",
    "Reddish cocktail with ice in a cut-glass tumbler, tilted shot with blurred bar lights",
    "Червонуватий коктейль з льодом у склянці з гранованого скла, нахилений кадр із розмитими вогнями бару",
  ),
  16: draft(
    "Retrato de un chef con chaquetilla blanca, delantal marrón y guantes negros, apoyado en una mesa de madera",
    "Portrait of a chef in a white jacket, brown apron and black gloves, leaning on a wooden table",
    "Портрет шеф-кухаря в білому кітелі, коричневому фартусі та чорних рукавичках біля дерев’яного столу",
  ),
  17: draft(
    "Dos personas brindando con latas de colores sobre una fila de latas, con palmeras y el puerto al fondo",
    "Two people toasting with coloured cans above a row of cans, with palm trees and the harbour behind",
    "Двоє людей цокаються кольоровими банками над рядом банок, позаду пальми та порт",
  ),
  18: draft(
    "Dormitorio minimalista en tonos crema con cama grande, lámpara de mesilla e iluminación lineal en el techo",
    "Minimalist cream-toned bedroom with a large bed, bedside lamp and linear ceiling lighting",
    "Мінімалістична спальня в кремових тонах із великим ліжком, лампою та лінійним світлом на стелі",
  ),
  19: draft(
    "Mesa de brunch con tostada de huevo revuelto y salmón ahumado, bagels, salchichas y tostada de aguacate",
    "Brunch table with scrambled egg and smoked salmon on toast, bagels, sausages and avocado toast",
    "Стіл для бранчу: тост з яєчнею-бовтанкою та копченим лососем, бейгли, сосиски й тост з авокадо",
  ),
  20: draft(
    "Mano con palillos sostiene un maki cubierto de huevas rojas, con wasabi y jengibre en un restaurante japonés",
    "Hand lifting a roe-topped sushi roll with chopsticks, with wasabi and ginger, in a Japanese restaurant",
    "Рука з паличками піднімає суші-рол з червоною ікрою, поруч васабі та імбир у японському ресторані",
  ),
  21: draft(
    "Mano sosteniendo en alto una lata de Blinkers Brew Athletic IPA sin alcohol contra el follaje",
    "Hand holding up a can of alcohol-free Blinkers Brew Athletic IPA against green foliage",
    "Рука піднімає банку безалкогольного Blinkers Brew Athletic IPA на тлі зеленого листя",
  ),
  22: draft(
    "Ponentes debatiendo en el escenario de un congreso, con el público en silueta y una pantalla gigante al fondo",
    "Speakers on a conference stage, the audience in silhouette and a large screen behind",
    "Спікери на сцені конференції, глядачі в силуеті на передньому плані та великий екран позаду",
  ),
  23: draft(
    "Piscina y jardín con palmeras de una vivienda con vistas a las montañas, fotografía inmobiliaria en la Costa del Sol",
    "Pool and palm garden of a home with mountain views, property photography on the Costa del Sol",
    "Басейн і сад із пальмами біля будинку з видом на гори, фото нерухомості на Costa del Sol",
  ),
  24: draft(
    "Plato de carne en salsa con puré de patata y brotes, con cuchillo y tenedor, en primer plano",
    "Close-up of meat in sauce with mashed potato and micro herbs, with knife and fork",
    "Крупний план м’яса в соусі з картопляним пюре та мікрозеленню, з ножем і виделкою",
  ),
  25: draft(
    "Copa de cerveza rubia con espuma y el logotipo de Blinkers Brew, sobre una mesa al sol",
    "Glass of golden beer with a foamy head and the Blinkers Brew logo, on a table in the sun",
    "Келих золотистого пива з піною та логотипом Blinkers Brew на столі під сонцем",
  ),
  26: draft(
    "Estantería iluminada con botellas de licores entre arcos de madera en la barra de un bar",
    "Lit shelving with spirits bottles between wooden arches behind a bar",
    "Підсвічені полиці з пляшками міцних напоїв між дерев’яними арками за барною стійкою",
  ),
  27: draft(
    "Invitado con gafas, una lata verde y un vaso en las manos en una fiesta al atardecer junto al mar",
    "Guest in glasses holding a green can and a cup at a seaside party at sunset",
    "Гість в окулярах із зеленою банкою та стаканчиком на вечірці біля моря на заході сонця",
  ),
  28: draft(
    "Carne asada sobre patatas con tomate cherry y una ramita de romero, servida en un plato blanco",
    "Roast meat on potatoes topped with a cherry tomato and a sprig of rosemary, on a white plate",
    "Запечене м’ясо на картоплі з помідором черрі та гілочкою розмарину на білій тарілці",
  ),
  29: draft(
    "Mujer tumbada con gorra blanca y una lata en la mano, rodeada de latas de colores frente a un edificio de cristal",
    "Woman lying down in a white cap holding a can, surrounded by coloured cans in front of a glass building",
    "Жінка в білій кепці лежить із банкою в руці серед кольорових банок біля скляної будівлі",
  ),
  30: draft(
    "Hombre con gafas de espejo y camisa blanca riendo con una lata verde en las manos, con el mar al fondo",
    "Man in mirrored sunglasses and a white shirt laughing with a green can, the sea behind him",
    "Чоловік у дзеркальних окулярах і білій сорочці сміється із зеленою банкою в руках, позаду море",
  ),
  31: draft(
    "Bocados empanados rellenos de queso fundido, con un palillo y hierbas frescas sobre fondo oscuro",
    "Breaded bites filled with melted cheese, with a cocktail stick and fresh herbs against a dark background",
    "Паніровані закуски з розплавленим сиром, зубочистка та свіжа зелень на темному тлі",
  ),
  32: draft(
    "Cóctel morado con menta fresca en un vaso de cristal tallado, con luz natural de fondo",
    "Purple cocktail topped with fresh mint in a cut-glass tumbler, in natural light",
    "Фіолетовий коктейль зі свіжою м’ятою в склянці з гранованого скла при природному світлі",
  ),
  33: draft(
    "Retrato de un hombre con gorro negro y gafas de sol en la cubierta de un barco, con palmeras detrás",
    "Portrait of a man in a black beanie and sunglasses on a boat deck, with palm trees behind",
    "Портрет чоловіка в чорній шапці та сонцезахисних окулярах на палубі судна, позаду пальми",
  ),
  34: draft(
    "Mujer con disfraz de sirena, de conchas y tela irisada, sostiene una lata de Blinkers Brew en un evento",
    "Woman in a mermaid costume of shells and iridescent fabric holding a can of Blinkers Brew at an event",
    "Жінка в костюмі русалки з мушель і переливчастої тканини тримає банку Blinkers Brew на заході",
  ),
  35: draft(
    "Rolls de sushi cubiertos de salsa cremosa y cebollino sobre una hoja verde, en plato blanco con jengibre",
    "Sushi rolls topped with creamy sauce and chives on a green leaf, on a white plate with pickled ginger",
    "Суші-роли з вершковим соусом і шніт-цибулею на зеленому листку, на білій тарілці з імбиром",
  ),
  36: draft(
    "Lata fría de Blinkers Brew Helles con gotas de condensación sobre madera blanca, con follaje desenfocado",
    "Chilled can of Blinkers Brew Helles with condensation drops on white painted wood, blurred foliage behind",
    "Охолоджена банка Blinkers Brew Helles із краплями конденсату на білому дереві, позаду розмите листя",
  ),
  37: draft(
    "Mujer sonriente con una lata rosa en la mano en un evento al aire libre decorado con medusas colgantes y macramé",
    "Smiling woman holding a pink can at an outdoor event decorated with hanging jellyfish lamps and macramé",
    "Усміхнена жінка з рожевою банкою на заході просто неба, прикрашеному підвісними медузами та макраме",
  ),
  38: draft(
    "Lata de Blinkers Brew Weizen con gotas de condensación sobre una mesa blanca, con edificios y gente desenfocados",
    "Can of Blinkers Brew Weizen with condensation drops on a white table, blurred buildings and people behind",
    "Банка Blinkers Brew Weizen із краплями конденсату на білому столі, позаду розмиті будівлі та люди",
  ),
  39: draft(
    "Casa blanca de una planta con terraza, piscina y suelo de terracota bajo un cielo azul, fotografía inmobiliaria",
    "Single-storey white house with a terrace, pool and terracotta paving under a blue sky, property photography",
    "Білий одноповерховий будинок із терасою, басейном і теракотовим покриттям під блакитним небом, фото нерухомості",
  ),
  40: draft(
    "Lata de Blinkers Brew Amber Ale junto a un reno decorativo blanco sobre una bandeja de cristal",
    "Can of Blinkers Brew Amber Ale beside a white decorative reindeer on a glass tray",
    "Банка Blinkers Brew Amber Ale поруч із білим декоративним оленем на скляній таці",
  ),
};

// ---------------------------------------------------------------------------------------------------------------
// Prototype frames
// ---------------------------------------------------------------------------------------------------------------

type Frame = {
  order: number;
  code: string;
  category: string;
  caption: string;
  dataAr: number;
  bytes: Buffer;
};

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_m, n: string) => String.fromCodePoint(Number(n)));
}

function parseFrames(htmlPath: string): Frame[] {
  const html = readFileSync(htmlPath, "utf8");
  const gridStart = html.indexOf('id="grid"');
  if (gridStart < 0)
    throw new Error("Gallery grid (#grid) not found in the prototype");
  const re =
    /<div class="cell" data-c="([a-z]+)" data-ar="([0-9.]+)" data-i="(\d+)"[^>]*><img src="data:image\/[a-z]+;base64,([A-Za-z0-9+/=]+)"[^>]*>[\s\S]*?<div class="cap"><span>([^<]*)<\/span>/g;
  const frames: Frame[] = [];
  for (const m of html.slice(gridStart).matchAll(re)) {
    const [, code = "", ar = "", i = "", b64 = "", cap = ""] = m;
    const category = CATEGORY_BY_CODE[code];
    if (!category)
      throw new Error(`Unknown category code "${code}" at data-i=${i}`);
    frames.push({
      order: Number(i),
      code,
      category,
      caption: decodeEntities(cap).trim(),
      dataAr: Number(ar),
      bytes: Buffer.from(b64, "base64"),
    });
  }
  frames.sort((a, b) => a.order - b.order);
  frames.forEach((f, idx) => {
    if (f.order !== idx)
      throw new Error(`Frame order gap: expected ${idx}, got ${f.order}`);
  });
  return frames;
}

// ---------------------------------------------------------------------------------------------------------------
// Fingerprints
// ---------------------------------------------------------------------------------------------------------------

type Raw = { data: Buffer; width: number; height: number };

const WORK_SIZE = 640;
const THUMB = 16;

/** Decode, apply EXIF orientation, shrink to <= 640px and return raw 8-bit sRGB pixels. */
async function loadRaw(input: string | Buffer): Promise<Raw> {
  const { data, info } = await sharp(input, {
    failOn: "none",
    limitInputPixels: false,
  })
    .rotate()
    .resize(WORK_SIZE, WORK_SIZE, { fit: "inside", withoutEnlargement: true })
    .flatten({ background: "#000000" })
    .toColourspace("srgb")
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

type Fingerprint = {
  dhash: Uint8Array; // 64 bits
  thumb: Float32Array; // 256 z-normalised grayscale values
};

type Rect = { left: number; top: number; width: number; height: number };

async function grayRaw(
  raw: Raw,
  rect: Rect | null,
  w: number,
  h: number,
  rotate: 0 | 90 | 270,
): Promise<Buffer> {
  let img = sharp(raw.data, {
    raw: { width: raw.width, height: raw.height, channels: 3 },
  });
  if (rotate) img = img.rotate(rotate);
  if (rect) img = img.extract(rect);
  return img
    .greyscale()
    .resize(w, h, { fit: "fill", kernel: "cubic" })
    .raw()
    .toBuffer();
}

function zNormalize(bytes: Uint8Array): Float32Array {
  const out = new Float32Array(bytes.length);
  let mean = 0;
  for (let i = 0; i < bytes.length; i++) mean += bytes[i] ?? 0;
  mean /= bytes.length;
  let variance = 0;
  for (let i = 0; i < bytes.length; i++)
    variance += ((bytes[i] ?? 0) - mean) ** 2;
  const sd = Math.sqrt(variance / bytes.length) || 1;
  for (let i = 0; i < bytes.length; i++) out[i] = ((bytes[i] ?? 0) - mean) / sd;
  return out;
}

async function fingerprint(
  raw: Raw,
  rect: Rect | null,
  rotate: 0 | 90 | 270 = 0,
): Promise<Fingerprint> {
  // sharp applies rotate() before extract(), so a rect must be given in rotated coordinates
  const [d, t] = await Promise.all([
    grayRaw(raw, rect, 9, 8, rotate),
    grayRaw(raw, rect, THUMB, THUMB, rotate),
  ]);
  const dhash = new Uint8Array(64);
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++)
      dhash[y * 8 + x] = (d[y * 9 + x] ?? 0) > (d[y * 9 + x + 1] ?? 0) ? 1 : 0;
  }
  const thumb = zNormalize(t);
  return { dhash, thumb };
}

function hamming(a: Uint8Array, b: Uint8Array): number {
  let n = 0;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) n++;
  return n;
}

/** RMS difference of two z-normalised thumbnails: ~0 for the same picture, ~1.2-1.4 for unrelated ones. */
function thumbDistance(a: Float32Array, b: Float32Array): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += ((a[i] ?? 0) - (b[i] ?? 0)) ** 2;
  return Math.sqrt(s / a.length);
}

const THUMB_WEIGHT = 20;
const combine = (ham: number, thumb: number): number =>
  ham + THUMB_WEIGHT * thumb;

// ---------------------------------------------------------------------------------------------------------------
// Pair scoring
// ---------------------------------------------------------------------------------------------------------------

type PairScore = { ham: number; thumb: number; cost: number; variant: string };

type Original = {
  file: string;
  path: string;
  raw: Raw;
  width: number; // after EXIF orientation, full resolution
  height: number;
  full: Fingerprint;
};

type FrameFp = { frame: Frame; ratio: number; fp: Fingerprint };

const AR_TOLERANCE = 0.015;
const CROP_OFFSETS = [0, 0.25, 0.5, 0.75, 1];

function score(a: Fingerprint, b: Fingerprint, variant: string): PairScore {
  const ham = hamming(a.dhash, b.dhash);
  const thumb = thumbDistance(a.thumb, b.thumb);
  return { ham, thumb, cost: combine(ham, thumb), variant };
}

/** Crop rect (in `raw` coordinates) giving the target aspect ratio, anchored at `offset` (0..1) along the long axis. */
function cropRect(
  w: number,
  h: number,
  targetRatio: number,
  offset: number,
): Rect {
  if (w / h > targetRatio) {
    const cw = Math.max(1, Math.round(h * targetRatio));
    return {
      left: Math.round((w - cw) * offset),
      top: 0,
      width: cw,
      height: h,
    };
  }
  const ch = Math.max(1, Math.round(w / targetRatio));
  return { left: 0, top: Math.round((h - ch) * offset), width: w, height: ch };
}

async function pairScore(f: FrameFp, o: Original): Promise<PairScore> {
  const oRatio = o.raw.width / o.raw.height;
  const sameOrientation =
    f.ratio > 1 === oRatio > 1 ||
    Math.abs(f.ratio - 1) < 0.05 ||
    Math.abs(oRatio - 1) < 0.05;
  const candidates: PairScore[] = [];

  if (Math.abs(f.ratio / oRatio - 1) <= AR_TOLERANCE) {
    candidates.push(score(f.fp, o.full, "full"));
  } else if (sameOrientation) {
    for (const off of CROP_OFFSETS) {
      const fp = await fingerprint(
        o.raw,
        cropRect(o.raw.width, o.raw.height, f.ratio, off),
      );
      candidates.push(score(f.fp, fp, `crop@${off}`));
    }
  } else {
    // Orientation differs: still score the crop variants, then try the original turned by 90 degrees.
    for (const off of CROP_OFFSETS) {
      const fp = await fingerprint(
        o.raw,
        cropRect(o.raw.width, o.raw.height, f.ratio, off),
      );
      candidates.push(score(f.fp, fp, `crop@${off}`));
    }
    for (const rot of [90, 270] as const) {
      const rw = o.raw.height;
      const rh = o.raw.width;
      const rr = rw / rh;
      const rect =
        Math.abs(f.ratio / rr - 1) <= AR_TOLERANCE
          ? null
          : cropRect(rw, rh, f.ratio, 0.5);
      const fp = await fingerprint(o.raw, rect, rot);
      candidates.push(score(f.fp, fp, `rot${rot}`));
    }
  }
  return candidates.reduce((best, c) => (c.cost < best.cost ? c : best));
}

// ---------------------------------------------------------------------------------------------------------------
// Crop recovery: where the prototype shows a tighter or different crop than the original, find that crop so it can
// be reproduced with a Sanity image crop (fractions trimmed from each edge, as in Sanity's `crop` object).
// ---------------------------------------------------------------------------------------------------------------

type SuggestedCrop = {
  left: number;
  right: number;
  top: number;
  bottom: number;
  rms: number;
};

async function refineCrop(frameRaw: Raw, orig: Raw): Promise<SuggestedCrop> {
  const ratio = frameRaw.width / frameRaw.height;
  const W = 48;
  const H = Math.max(1, Math.round(W / ratio));
  const target = zNormalize(await grayRaw(frameRaw, null, W, H, 0));
  // largest rect with the frame's ratio that fits in the original
  const fitW =
    orig.width / orig.height > ratio ? orig.height * ratio : orig.width;
  const rectAt = (s: number, px: number, py: number): Rect => {
    const width = Math.max(8, Math.min(orig.width, Math.round(fitW * s)));
    const height = Math.max(
      8,
      Math.min(orig.height, Math.round(width / ratio)),
    );
    return {
      left: Math.round((orig.width - width) * px),
      top: Math.round((orig.height - height) * py),
      width,
      height,
    };
  };
  const evalRect = async (rect: Rect): Promise<number> => {
    const g = zNormalize(await grayRaw(orig, rect, W, H, 0));
    let sum = 0;
    for (let i = 0; i < g.length; i++)
      sum += ((g[i] ?? 0) - (target[i] ?? 0)) ** 2;
    return Math.sqrt(sum / g.length);
  };
  let best = { rms: Number.POSITIVE_INFINITY, s: 1, px: 0.5, py: 0.5 };
  const tryParams = async (s: number, px: number, py: number) => {
    const rms = await evalRect(rectAt(s, px, py));
    if (rms < best.rms) best = { rms, s, px, py };
  };
  for (let s = 0.5; s <= 1.0001; s += 0.025) {
    for (let xi = 0; xi <= 8; xi++)
      for (let yi = 0; yi <= 12; yi++)
        await tryParams(Math.min(s, 1), xi / 8, yi / 12);
  }
  const c = best;
  for (let s = c.s - 0.03; s <= c.s + 0.0301; s += 0.005) {
    for (let px = c.px - 0.1; px <= c.px + 0.1001; px += 0.025) {
      for (let py = c.py - 0.1; py <= c.py + 0.1001; py += 0.025) {
        await tryParams(
          Math.min(1, s),
          Math.min(1, Math.max(0, px)),
          Math.min(1, Math.max(0, py)),
        );
      }
    }
  }
  const r = rectAt(best.s, best.px, best.py);
  return {
    left: round(r.left / orig.width, 3),
    right: round((orig.width - r.left - r.width) / orig.width, 3),
    top: round(r.top / orig.height, 3),
    bottom: round((orig.height - r.top - r.height) / orig.height, 3),
    rms: round(best.rms, 3),
  };
}

// ---------------------------------------------------------------------------------------------------------------
// Optimal assignment (Hungarian algorithm, rows <= columns, minimise total cost)
// ---------------------------------------------------------------------------------------------------------------

function hungarian(cost: number[][]): number[] {
  const n = cost.length;
  const m = cost[0]?.length ?? 0;
  if (n > m) throw new Error("hungarian: more rows than columns");
  const INF = Number.POSITIVE_INFINITY;
  const u = new Array<number>(n + 1).fill(0);
  const v = new Array<number>(m + 1).fill(0);
  const p = new Array<number>(m + 1).fill(0); // p[j] = row assigned to column j (1-based)
  const way = new Array<number>(m + 1).fill(0);
  for (let i = 1; i <= n; i++) {
    p[0] = i;
    let j0 = 0;
    const minv = new Array<number>(m + 1).fill(INF);
    const used = new Array<boolean>(m + 1).fill(false);
    do {
      used[j0] = true;
      const i0 = p[j0] ?? 0;
      let delta = INF;
      let j1 = 0;
      for (let j = 1; j <= m; j++) {
        if (used[j]) continue;
        const cur = (cost[i0 - 1]?.[j - 1] ?? INF) - (u[i0] ?? 0) - (v[j] ?? 0);
        if (cur < (minv[j] ?? INF)) {
          minv[j] = cur;
          way[j] = j0;
        }
        if ((minv[j] ?? INF) < delta) {
          delta = minv[j] ?? INF;
          j1 = j;
        }
      }
      for (let j = 0; j <= m; j++) {
        if (used[j]) {
          u[p[j] ?? 0] = (u[p[j] ?? 0] ?? 0) + delta;
          v[j] = (v[j] ?? 0) - delta;
        } else {
          minv[j] = (minv[j] ?? INF) - delta;
        }
      }
      j0 = j1;
    } while ((p[j0] ?? 0) !== 0);
    do {
      const j1 = way[j0] ?? 0;
      p[j0] = p[j1] ?? 0;
      j0 = j1;
    } while (j0 !== 0);
  }
  const rowToCol = new Array<number>(n).fill(-1);
  for (let j = 1; j <= m; j++) {
    const row = p[j] ?? 0;
    if (row > 0) rowToCol[row - 1] = j - 1;
  }
  return rowToCol;
}

// ---------------------------------------------------------------------------------------------------------------
// EXIF presence (for security.md section 9; coordinates are never read out)
// ---------------------------------------------------------------------------------------------------------------

type ExifFlags = { gps: boolean; bodySerial: boolean };

function exifFlags(exif: Buffer | undefined): ExifFlags {
  const none: ExifFlags = { gps: false, bodySerial: false };
  if (!exif) return none;
  const start = exif.indexOf("Exif\0\0") === 0 ? 6 : 0;
  const tiff = exif.subarray(start);
  if (tiff.length < 8) return none;
  const little = tiff.toString("latin1", 0, 2) === "II";
  if (!little && tiff.toString("latin1", 0, 2) !== "MM") return none;
  const u16 = (o: number) =>
    little ? tiff.readUInt16LE(o) : tiff.readUInt16BE(o);
  const u32 = (o: number) =>
    little ? tiff.readUInt32LE(o) : tiff.readUInt32BE(o);
  const readIfd = (offset: number): Map<number, number> => {
    const tags = new Map<number, number>();
    if (offset <= 0 || offset + 2 > tiff.length) return tags;
    const count = u16(offset);
    for (let i = 0; i < count; i++) {
      const e = offset + 2 + i * 12;
      if (e + 12 > tiff.length) break;
      tags.set(u16(e), u32(e + 8));
    }
    return tags;
  };
  try {
    const ifd0 = readIfd(u32(4));
    const exifIfd = ifd0.has(0x8769)
      ? readIfd(ifd0.get(0x8769) ?? 0)
      : new Map<number, number>();
    return { gps: ifd0.has(0x8825), bodySerial: exifIfd.has(0xa431) };
  } catch {
    return none;
  }
}

// ---------------------------------------------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------------------------------------------

async function main() {
  mkdirSync(PREVIEWS_DIR, { recursive: true });

  console.log("Parsing prototype frames...");
  const frames = parseFrames(HTML_PATH);
  console.log(`  ${frames.length} frames`);

  const files = readdirSync(ORIGINALS_DIR)
    .filter(
      (f) => /\.(jpe?g|png|webp|tiff?|heic)$/i.test(f) && !f.startsWith("."),
    )
    .sort();
  console.log(`  ${files.length} originals in ${ORIGINALS_DIR}`);

  console.log("Fingerprinting frames...");
  const frameFps: FrameFp[] = [];
  const frameRaws: Raw[] = [];
  for (const frame of frames) {
    const raw = await loadRaw(frame.bytes);
    frameRaws.push(raw);
    frameFps.push({
      frame,
      ratio: raw.width / raw.height,
      fp: await fingerprint(raw, null),
    });
  }

  console.log("Fingerprinting originals (large files, this takes a minute)...");
  const originals: Original[] = [];
  const exifByFile = new Map<string, ExifFlags>();
  for (const file of files) {
    const path = join(ORIGINALS_DIR, file);
    const meta = await sharp(path, {
      failOn: "none",
      limitInputPixels: false,
    }).metadata();
    exifByFile.set(file, exifFlags(meta.exif));
    const swap = (meta.orientation ?? 1) >= 5;
    const raw = await loadRaw(path);
    originals.push({
      file,
      path,
      raw,
      width: swap ? (meta.height ?? 0) : (meta.width ?? 0),
      height: swap ? (meta.width ?? 0) : (meta.height ?? 0),
      full: await fingerprint(raw, null),
    });
    process.stdout.write(".");
  }
  process.stdout.write("\n");

  console.log("Scoring all frame/original pairs...");
  const scores: PairScore[][] = [];
  for (const f of frameFps) {
    const row: PairScore[] = [];
    for (const o of originals) row.push(await pairScore(f, o));
    scores.push(row);
  }

  const assignment = hungarian(scores.map((row) => row.map((s) => s.cost)));

  // ----- per-frame result with margins and flags -----
  type Result = {
    order: number;
    frame: Frame;
    ratioFrame: number;
    original: Original | null;
    pair: PairScore | null;
    marginFrame: number; // cost of the best other original minus the chosen one
    marginOriginal: number; // cost of the best other frame for this original minus the chosen one
    runnerUp: string;
    arDiff: number; // |frame ratio / original ratio - 1|
    crop: SuggestedCrop | null; // recovered crop when the prototype shows a different framing than the original
    flags: string[];
  };
  const results: Result[] = frames.map((frame, i) => {
    const col = assignment[i] ?? -1;
    const original = col >= 0 ? (originals[col] ?? null) : null;
    const pair = col >= 0 ? (scores[i]?.[col] ?? null) : null;
    const ratioFrame = frameFps[i]?.ratio ?? frame.dataAr;
    const flags: string[] = [];
    let marginFrame = Number.POSITIVE_INFINITY;
    let marginOriginal = Number.POSITIVE_INFINITY;
    let runnerUp = "";
    if (original && pair) {
      let best = Number.POSITIVE_INFINITY;
      scores[i]?.forEach((s, j) => {
        if (j !== col && s.cost < best) {
          best = s.cost;
          runnerUp = originals[j]?.file ?? "";
        }
      });
      marginFrame = best - pair.cost;
      scores.forEach((row, k) => {
        if (k !== i)
          marginOriginal = Math.min(
            marginOriginal,
            (row[col]?.cost ?? Infinity) - pair.cost,
          );
      });
      if (Math.min(marginFrame, marginOriginal) < 8)
        flags.push(
          `ambiguous (margin ${round(Math.min(marginFrame, marginOriginal), 1)})`,
        );
      if (pair.variant.startsWith("rot"))
        flags.push(
          `ORIENTATION: matched only after rotating the original (${pair.variant})`,
        );
      if (Math.abs(frame.dataAr / ratioFrame - 1) > 0.005)
        flags.push(
          `data-ar ${frame.dataAr} != decoded frame ${round(ratioFrame, 4)}`,
        );
    } else {
      flags.push("UNMATCHED");
    }
    const arDiff = original
      ? Math.abs(ratioFrame / (original.width / original.height) - 1)
      : 0;
    return {
      order: i,
      frame,
      ratioFrame,
      original,
      pair,
      marginFrame,
      marginOriginal,
      runnerUp,
      arDiff,
      crop: null,
      flags,
    };
  });

  // Where the prototype frame is framed differently from the original, recover that crop and re-score on it.
  for (const r of results) {
    if (!r.original || !r.pair || r.arDiff <= AR_TOLERANCE) continue;
    const frameRaw = frameRaws[r.order];
    if (!frameRaw) continue;
    const crop = await refineCrop(frameRaw, r.original.raw);
    const raw = r.original.raw;
    const rect: Rect = {
      left: Math.round(crop.left * raw.width),
      top: Math.round(crop.top * raw.height),
      width: Math.max(1, Math.round((1 - crop.left - crop.right) * raw.width)),
      height: Math.max(
        1,
        Math.round((1 - crop.top - crop.bottom) * raw.height),
      ),
    };
    const fp = await fingerprint(raw, rect);
    const frameFp = frameFps[r.order];
    if (frameFp) {
      const refined = score(frameFp.fp, fp, "recovered-crop");
      if (refined.cost < r.pair.cost) r.pair = refined;
    }
    r.crop = crop;
    r.flags.push(
      `framing differs: prototype ratio ${round(r.ratioFrame, 3)} vs original ${round(raw.width / raw.height, 3)} (${round(r.arDiff * 100, 1)}%); ` +
        `recovered crop left ${crop.left} right ${crop.right} top ${crop.top} bottom ${crop.bottom} (rms ${crop.rms})`,
    );
  }
  for (const r of results) {
    if (r.pair && (r.pair.ham > 10 || r.pair.thumb > 0.35)) {
      r.flags.unshift(
        `weak match (dHash ${r.pair.ham}, thumb ${round(r.pair.thumb, 2)})`,
      );
    }
  }

  // ----- duplicates among frames / originals -----
  const duplicateNotes: string[] = [];
  for (let a = 0; a < frameFps.length; a++) {
    for (let b = a + 1; b < frameFps.length; b++) {
      const fa = frameFps[a];
      const fb = frameFps[b];
      if (!fa || !fb) continue;
      const ham = hamming(fa.fp.dhash, fb.fp.dhash);
      const th = thumbDistance(fa.fp.thumb, fb.fp.thumb);
      if (ham <= 8 && th < 0.4)
        duplicateNotes.push(
          `frames ${a} and ${b} look alike (dHash ${ham}, thumb ${round(th, 2)})`,
        );
    }
  }
  for (let a = 0; a < originals.length; a++) {
    for (let b = a + 1; b < originals.length; b++) {
      const oa = originals[a];
      const ob = originals[b];
      if (!oa || !ob) continue;
      const ham = hamming(oa.full.dhash, ob.full.dhash);
      const th = thumbDistance(oa.full.thumb, ob.full.thumb);
      if (ham <= 8 && th < 0.4)
        duplicateNotes.push(
          `originals "${oa.file}" and "${ob.file}" look alike (dHash ${ham}, thumb ${round(th, 2)})`,
        );
    }
  }

  const usedCols = new Set(assignment.filter((c) => c >= 0));
  const unusedOriginals = originals
    .filter((_, j) => !usedCols.has(j))
    .map((o) => o.file);

  // ----- alt texts and captions -----
  const missingAlt: number[] = [];
  const missingCaptionTranslation = new Set<string>();
  const photoMap = results.map((r) => {
    const tr = CAPTION_TRANSLATIONS[r.frame.caption];
    if (!tr) missingCaptionTranslation.add(r.frame.caption);
    const alt = ALT_DRAFTS[r.order];
    if (!alt) missingAlt.push(r.order);
    return {
      order: r.order,
      category: r.frame.category,
      caption: { es: r.frame.caption, en: tr?.en ?? "", uk: tr?.uk ?? "" },
      alt: alt ?? { es: "", en: "", uk: "" },
      aspectRatio: r.frame.dataAr,
      original: r.original?.path ?? "",
      distance: r.pair?.ham ?? -1,
    };
  });

  // ----- previews (800px long side, orientation applied, metadata not copied) -----
  console.log("Writing previews...");
  for (const r of results) {
    if (!r.original) continue;
    await sharp(r.original.path, { failOn: "none", limitInputPixels: false })
      .rotate()
      .resize(800, 800, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 82 })
      .toFile(join(PREVIEWS_DIR, `${pad2(r.order)}.jpg`));
  }

  // ----- files -----
  writeFileSync(
    join(OUT_DIR, "photo-map.json"),
    JSON.stringify(photoMap, null, 2) + "\n",
  );
  writeFileSync(
    join(OUT_DIR, "match-details.json"),
    JSON.stringify(
      results.map((r) => ({
        order: r.order,
        file: r.original?.file ?? null,
        dHash: r.pair?.ham ?? null,
        thumb: r.pair ? round(r.pair.thumb, 3) : null,
        cost: r.pair ? round(r.pair.cost, 2) : null,
        variant: r.pair?.variant ?? null,
        marginFrame: round(r.marginFrame, 1),
        marginOriginal: round(r.marginOriginal, 1),
        runnerUp: r.runnerUp,
        recoveredCrop: r.crop,
        frameRatio: round(r.ratioFrame, 4),
        originalRatio: r.original
          ? round(r.original.width / r.original.height, 4)
          : null,
        originalSize: r.original
          ? `${r.original.width}x${r.original.height}`
          : null,
        exif: r.original ? exifByFile.get(r.original.file) : null,
        flags: r.flags,
      })),
      null,
      2,
    ) + "\n",
  );

  // ----- table + report -----
  const header = [
    "order",
    "category",
    "caption",
    "original",
    "dHash",
    "thumb",
    "ratio frame/orig",
    "flags",
  ];
  const rows = results.map((r) => [
    pad2(r.order),
    r.frame.category,
    r.frame.caption,
    r.original?.file ?? "-",
    r.pair ? String(r.pair.ham) : "-",
    r.pair ? r.pair.thumb.toFixed(2) : "-",
    r.original
      ? `${round(r.ratioFrame, 3)} / ${round(r.original.width / r.original.height, 3)}`
      : "-",
    r.flags.length ? r.flags.join("; ") : "ok",
  ]);

  const hams = results.map((r) => r.pair?.ham ?? 99).sort((a, b) => a - b);
  const margins = results
    .map((r) => Math.min(r.marginFrame, r.marginOriginal))
    .sort((a, b) => a - b);
  const confident = results.filter(
    (r) =>
      r.pair &&
      r.pair.ham <= 10 &&
      r.pair.thumb <= 0.35 &&
      Math.min(r.marginFrame, r.marginOriginal) >= 8,
  );
  const exifGps = [...exifByFile.entries()]
    .filter(([, e]) => e.gps)
    .map(([f]) => f);
  const exifSerial = [...exifByFile.entries()]
    .filter(([, e]) => e.bodySerial)
    .map(([f]) => f);

  const problems: string[] = [];
  for (const r of results) {
    const real = r.flags.filter((f) => !f.startsWith("framing differs"));
    if (real.length)
      problems.push(
        `frame ${pad2(r.order)} (${r.frame.caption}) -> ${r.original?.file ?? "nothing"}: ${real.join("; ")}`,
      );
  }
  for (const r of results) {
    const crop = r.flags.filter((f) => f.startsWith("framing differs"));
    if (crop.length)
      problems.push(
        `frame ${pad2(r.order)} (${r.frame.caption}) -> ${r.original?.file}: ${crop.join("; ")}`,
      );
  }
  if (unusedOriginals.length)
    problems.push(
      `originals not used by any frame: ${unusedOriginals.join(", ")}`,
    );
  if (frames.length !== files.length)
    problems.push(
      `count mismatch: ${frames.length} frames vs ${files.length} originals`,
    );
  problems.push(...duplicateNotes);
  if (missingAlt.length)
    problems.push(
      `alt text drafts missing for orders: ${missingAlt.join(", ")}`,
    );
  for (const m of photoMap) {
    for (const loc of ["es", "en", "uk"] as const) {
      if (m.alt[loc].length > 125)
        problems.push(
          `alt ${loc} of frame ${pad2(m.order)} is ${m.alt[loc].length} characters (target <= ~125)`,
        );
    }
  }
  if (missingCaptionTranslation.size)
    problems.push(
      `caption translations missing for: ${[...missingCaptionTranslation].join(", ")}`,
    );

  const md: string[] = [];
  md.push("# Photo match report (Step 3, Q-18)", "");
  md.push(
    `Frames in prototype: ${frames.length} · originals found: ${files.length} · matched: ${results.filter((r) => r.original).length}`,
  );
  md.push(
    `Confident matches (dHash <= 10, thumb <= 0.35, margin >= 8): ${confident.length}/${results.length}`,
  );
  md.push(
    `dHash distance of the chosen pairs: min ${hams[0]}, median ${hams[Math.floor(hams.length / 2)]}, max ${hams[hams.length - 1]} (of 64 bits)`,
  );
  md.push(
    `Smallest margin to the runner-up (cost units): ${round(margins[0] ?? 0, 1)}`,
  );
  md.push(
    `Originals with a GPS block in EXIF: ${exifGps.length}/${files.length} · with a camera body serial: ${exifSerial.length}/${files.length} (camera make/model, software and date tags are still present in the JPEGs and the 5 PNGs carry no EXIF; strip before upload, security.md section 9)`,
    "",
  );
  md.push("## Matches", "");
  md.push(
    `| ${header.join(" | ")} |`,
    `|${header.map(() => "---").join("|")}|`,
  );
  for (const row of rows) md.push(`| ${row.join(" | ")} |`);
  md.push("", "## Unmatched, ambiguous or suspicious", "");
  if (problems.length) for (const p of problems) md.push(`- ${p}`);
  else md.push("- none");
  md.push(
    "",
    "## Draft captions and alt texts (for Illia to review; EN/UA are machine-written drafts)",
    "",
  );
  md.push(
    "| order | caption ES / EN / UK | alt ES | alt EN | alt UK |",
    "|---|---|---|---|---|",
  );
  for (const m of photoMap) {
    md.push(
      `| ${pad2(m.order)} | ${m.caption.es} / ${m.caption.en} / ${m.caption.uk} | ${m.alt.es} | ${m.alt.en} | ${m.alt.uk} |`,
    );
  }
  md.push("");
  writeFileSync(join(OUT_DIR, "match-report.md"), md.join("\n"));

  // ----- console -----
  const widths = header.map((h, c) =>
    Math.max(h.length, ...rows.map((r) => (r[c] ?? "").length)),
  );
  const line = (cells: string[]) =>
    cells.map((cell, c) => cell.padEnd(widths[c] ?? 0)).join("  ");
  console.log("\n" + line(header));
  console.log(widths.map((w) => "-".repeat(w)).join("  "));
  for (const row of rows) console.log(line(row));
  console.log(
    `\nConfident: ${confident.length}/${results.length} · dHash min/median/max: ${hams[0]}/${hams[Math.floor(hams.length / 2)]}/${hams[hams.length - 1]} · min margin ${round(margins[0] ?? 0, 1)}`,
  );
  console.log(
    `EXIF GPS block in ${exifGps.length}/${files.length} originals, body serial in ${exifSerial.length}/${files.length}`,
  );
  console.log("\nUnmatched / ambiguous / suspicious:");
  if (problems.length) for (const p of problems) console.log(`  - ${p}`);
  else console.log("  none");
  console.log(`\nWrote ${join(OUT_DIR, "photo-map.json")}`);
  console.log(
    `Wrote ${join(OUT_DIR, "match-report.md")} and ${PREVIEWS_DIR}/NN.jpg`,
  );
}

await main();
