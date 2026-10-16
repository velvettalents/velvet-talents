// Imports the product catalogue from the current WordPress/WooCommerce site
// into src/data/catalog.json and downloads product images into public/.
// Usage: node scripts/import-wordpress.mjs [--skip-images]

import { mkdir, writeFile, access } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ORIGIN = "https://velvet-talents.com";
const ROOT = path.resolve(import.meta.dirname, "..");
const IMAGE_DIR = path.join(ROOT, "public/images/products");
const OUT_FILE = path.join(ROOT, "src/data/catalog.json");
const skipImages = process.argv.includes("--skip-images");

const CATEGORY_META = {
  "tecidotejadilho": { en: "Headliner Fabrics", order: 1 },
  "tecido-tejadilho-bielastico": { en: "Two-Way Stretch Headliner Fabrics", order: 2 },
  "pasha": { en: "Pasha", order: 3 },
  "alcantara": { en: "Alcantara", order: 4 },
  "napas": { en: "Automotive Vinyl", order: 5 },
  "pele-sintetica": { en: "Synthetic Leather", order: 6 },
  "tecidos_bancos": { en: "Seat Fabrics", order: 7 },
  "tecidos-de-portas": { en: "Door Fabrics", order: 8 },
  "espumas": { en: "Foams", order: 9 },
  "alcatifas": { en: "Carpets", order: 10 },
  "cola": { en: "Adhesive", order: 11 },
};

const CATEGORY_PT_NAMES = {
  "tecidotejadilho": "Tecidos para Tejadilho",
  "tecido-tejadilho-bielastico": "Tecidos Tejadilho Bielástico",
  "tecidos_bancos": "Tecidos para Bancos",
};

const CATEGORY_IMAGE_EXT = {
  "tecidos_bancos": "png",
  "tecidos-de-portas": "png",
  "alcantara": "png",
  "tecido-tejadilho-bielastico": "png",
  "pasha": "png",
};

// Ordered phrase-level translations for the short product descriptions.
const DESCRIPTION_RULES = [
  [/^Tecido com o toque aveludado, com bastante elasticidade, ideal para tejadilhos de automóvel a imitar Alcantara\.$/i,
    "Velvet-touch fabric with high elasticity, ideal for car headliners as an Alcantara alternative."],
  [/^Tecido (preto|antracite|cinzento|azulado|acastanhado|bege) elástico para portas, o tecido em tricot\.$/i,
    (_, c) => `${capitalize(COLOURS[c.toLowerCase()])} stretch knit fabric for door panels.`],
  [/^Tecido Veludo (.+) com 1\.50 de Altura$/i, (_, c) => `${translateColour(c)} velvet fabric, 1.50 m wide.`],
  [/^Pele Sintética com 1\.40 de Largura$/i, "Synthetic leather, 1.40 m wide."],
  [/^Tecido com 1\.80 de Largura$/i, "Fabric, 1.80 m wide."],
  [/^Alcantara 1\.40 Largura$/i, "Alcantara, 1.40 m wide."],
  [/^PVC AUTOMÓVEL COM LARGURA DE 1\.40$/i, "Automotive PVC vinyl, 1.40 m wide."],
  [/^Tejadilho piquet largura de 1\.50 com muita elasticidade\.$/i, "Piqué headliner fabric, 1.50 m wide, highly elastic."],
  [/^Tejadilho piquet largura de 1\.50$/i, "Piqué headliner fabric, 1.50 m wide."],
  [/^Tejadilho cardado largura de ([\d.]+)$/i, (_, w) => `Brushed headliner fabric, ${w} m wide.`],
  [/^Espuma de (\d+) M\/M com tricot$/i, (_, n) => `${n} mm foam with knit backing.`],
  [/^Alcatifa para forrar carrinhas\. Altura de 2mts\.$/i, "Carpet for van lining, 2 m wide."],
  [/^Cola de Pistola, ideal para tejadilhos\.$/i, "Spray-gun adhesive, ideal for headliners."],
  [/^Tecido Original (.+?)( com 1\.50 de Largura)?$/i, (_, m, w) => `Original ${m} fabric${w ? ", 1.50 m wide" : ""}.`],
  [/^Réplica Tecido (.+?) com 1\.40 de Largura$/i, (_, m) => `${m} replica fabric, 1.40 m wide.`],
];

const COLOURS = {
  preto: "black", antracite: "anthracite", cinzento: "grey", azulado: "bluish",
  acastanhado: "brownish", bege: "beige", "cinza azulado": "bluish grey",
  "cinza claro": "light grey", marinho: "navy", vermelho: "red", grafito: "graphite",
  castanho: "brown", amarelo: "yellow", branco: "white", azul: "blue", cinza: "grey",
};

const NAME_RULES = [
  [/^Tecido Tejadilho Bielástico /i, "Two-Way Stretch Headliner "],
  [/^Tecido Tejadilho /i, "Headliner Fabric "],
  [/^Tecido Banco Original /i, "Original Seat Fabric "],
  [/^Tecido Banco /i, "Seat Fabric "],
  [/^Tecido Porta /i, "Door Fabric "],
  [/^Tecido Veludo /i, "Velvet Fabric "],
  [/^Pele sintética /i, "Synthetic Leather "],
  [/^Espuma (\d+) M\/M com tricot$/i, (_, n) => `Foam ${n} mm with Knit Backing`],
  [/^Alcatifa /i, "Carpet "],
  [/^Napa /i, "Vinyl "],
  [/^Cola /i, "Adhesive "],
  [/^Réplica /i, "Replica "],
];

// Some WordPress descriptions are typed in capitals; keep acronyms like PVC.
function sentenceCase(s) {
  if (!s || s !== s.toUpperCase()) return s;
  const lower = s.toLowerCase().replace(/\bpvc\b/g, "PVC").replace(/\bgt\b/g, "GT");
  return `${capitalize(lower)}${/[.!?]$/.test(lower) ? "" : "."}`;
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function translateColour(c) {
  return capitalize(COLOURS[c.toLowerCase()] ?? c);
}

function applyRules(text, rules) {
  for (const [pattern, replacement] of rules) {
    if (pattern.test(text)) return text.replace(pattern, replacement);
  }
  return null;
}

function translateName(name) {
  let out = applyRules(name, NAME_RULES) ?? name;
  out = out.replace(/\b(Marinho|Vermelho|Grafito|Preto|Castanho|Antracite|Amarelo|Bege|Cinzento|Branco|Azul)\b/g,
    (c) => translateColour(c));
  return out;
}

function decodeEntities(s) {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"')
    .replace(/&ldquo;|&rdquo;/g, '"').replace(/&lsquo;|&rsquo;/g, "'")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}

function plainText(html) {
  // The WooCommerce short description embeds a Contact Form 7 form; drop it.
  const withoutForm = html.replace(/<div class="wpcf7[\s\S]*$/, "");
  return decodeEntities(withoutForm.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 velvet-talents-import" } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const text = await res.text();
  // The WP install prints PHP notices before the JSON body.
  const start = text.search(/\[\{|\[\]|\{"/);
  if (start === -1) throw new Error(`No JSON body in ${url}`);
  return JSON.parse(text.slice(start));
}

async function fetchAllProducts() {
  const all = [];
  for (let page = 1; ; page++) {
    const batch = await fetchJson(`${ORIGIN}/wp-json/wc/store/v1/products?per_page=100&page=${page}`).catch(() => []);
    if (!Array.isArray(batch) || batch.length === 0) break;
    all.push(...batch);
    if (batch.length < 100) break;
  }
  return all;
}

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

// Images are re-encoded as 1000px WebP to keep the repository small;
// next/image handles responsive sizes at request time.
async function downloadImage(url, slug) {
  const fileName = `${slug}.webp`;
  const target = path.join(IMAGE_DIR, fileName);
  if (!skipImages && !(await exists(target))) {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 velvet-talents-import" } });
    if (!res.ok) throw new Error(`${res.status} ${url}`);
    await sharp(Buffer.from(await res.arrayBuffer()))
      .resize({ width: 1000, height: 1000, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(target);
  }
  return `/images/products/${fileName}`;
}

// Some products come back without a category from the Store API.
function inferCategory(name) {
  if (/^Napa\b/i.test(name)) return "napas";
  return null;
}

async function main() {
  await mkdir(IMAGE_DIR, { recursive: true });
  await mkdir(path.dirname(OUT_FILE), { recursive: true });

  const [rawCategories, rawProducts] = await Promise.all([
    fetchJson(`${ORIGIN}/wp-json/wc/store/v1/products/categories?per_page=100`),
    fetchAllProducts(),
  ]);

  const categories = rawCategories
    .filter((c) => c.count > 0 && CATEGORY_META[c.slug])
    .map((c) => ({
      slug: c.slug,
      name: { pt: CATEGORY_PT_NAMES[c.slug] ?? decodeEntities(c.name), en: CATEGORY_META[c.slug].en },
      image: `/images/categories/${c.slug}.${CATEGORY_IMAGE_EXT[c.slug] ?? "jpg"}`,
      order: CATEGORY_META[c.slug].order,
    }))
    .sort((a, b) => a.order - b.order);

  const untranslated = new Set();
  const products = [];
  for (const p of rawProducts) {
    const name = decodeEntities(p.name).trim();
    const rawDescription = plainText(p.short_description);
    const description = sentenceCase(rawDescription);
    const descriptionEn = rawDescription ? applyRules(rawDescription, DESCRIPTION_RULES) : "";
    if (rawDescription && descriptionEn === null) untranslated.add(rawDescription);
    const image = p.images[0] ? await downloadImage(p.images[0].src, p.slug) : null;
    products.push({
      slug: p.slug,
      category: p.categories[0]?.slug ?? inferCategory(name),
      name: { pt: name, en: translateName(name) },
      description: { pt: description, en: descriptionEn ?? description },
      image,
    });
  }

  products.sort((a, b) => a.name.pt.localeCompare(b.name.pt, "pt", { numeric: true }));
  await writeFile(OUT_FILE, `${JSON.stringify({ categories, products }, null, 2)}\n`);

  console.log(`Wrote ${categories.length} categories and ${products.length} products to ${path.relative(ROOT, OUT_FILE)}`);
  if (untranslated.size) {
    console.warn("Descriptions without an English rule:");
    for (const d of untranslated) console.warn(`  - ${d}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
