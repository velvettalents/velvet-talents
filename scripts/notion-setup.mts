// Creates the Notion databases for the site and imports the current catalogue
// (src/data/catalog.json and the images in public/) into them.
//
// Usage:
//   NOTION_TOKEN=... NOTION_PARENT_PAGE=<page url or id> node scripts/notion-setup.mts
//
// Safe to re-run: progress is stored in scripts/.notion-state.json, so
// databases and rows that already exist are skipped.

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { AVAILABILITY, P, REQUEST_STATUS } from "../src/lib/notion/schema.ts";

const ROOT = path.resolve(import.meta.dirname, "..");
const STATE_FILE = path.join(import.meta.dirname, ".notion-state.json");
const API = "https://api.notion.com/v1";
const NOTION_VERSION = "2026-03-11";

const token = process.env.NOTION_TOKEN;
const parentInput = process.env.NOTION_PARENT_PAGE;
if (!token || !parentInput) {
  console.error("Set NOTION_TOKEN and NOTION_PARENT_PAGE (the URL or id of the page shared with the integration).");
  process.exit(1);
}
const parentId = parentInput.match(/[0-9a-f]{32}|[0-9a-f-]{36}/i)?.[0];
if (!parentId) {
  console.error("Could not find a page id in NOTION_PARENT_PAGE.");
  process.exit(1);
}

type State = {
  dataSources: Partial<Record<"categories" | "products" | "catalogues" | "requests", string>>;
  pages: Record<string, string>;
};

const state: State = await readFile(STATE_FILE, "utf8")
  .then((s) => JSON.parse(s) as State)
  .catch(() => ({ dataSources: {}, pages: {} }));

const saveState = () => writeFile(STATE_FILE, `${JSON.stringify(state, null, 2)}\n`);

// HTTP --------------------------------------------------------------------

// Notion allows about 3 requests per second on average.
let lastRequest = 0;
async function throttle() {
  const wait = lastRequest + 350 - Date.now();
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastRequest = Date.now();
}

async function request<T>(pathname: string, init: { method?: string; json?: unknown; form?: FormData } = {}): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    await throttle();
    const res = await fetch(`${API}${pathname}`, {
      method: init.method ?? (init.json || init.form ? "POST" : "GET"),
      headers: {
        Authorization: `Bearer ${token}`,
        "Notion-Version": NOTION_VERSION,
        ...(init.json ? { "Content-Type": "application/json" } : {}),
      },
      body: init.form ?? (init.json ? JSON.stringify(init.json) : undefined),
    });
    if ((res.status === 429 || res.status >= 500 || res.status === 409) && attempt < 5) {
      const retryAfter = Number(res.headers.get("retry-after") ?? 2 ** attempt);
      await new Promise((r) => setTimeout(r, retryAfter * 1000));
      continue;
    }
    if (!res.ok) throw new Error(`${pathname}: ${res.status} ${await res.text()}`);
    return (await res.json()) as T;
  }
}

async function uploadFile(filePath: string, contentType: string) {
  const filename = path.basename(filePath);
  const upload = await request<{ id: string }>("/file_uploads", { json: { filename, content_type: contentType } });
  const form = new FormData();
  form.append("file", new Blob([await readFile(filePath)], { type: contentType }), filename);
  await request(`/file_uploads/${upload.id}/send`, { form });
  return { type: "file_upload", file_upload: { id: upload.id }, name: filename };
}

const contentTypes: Record<string, string> = { ".webp": "image/webp", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png" };
const uploadPublicFile = (publicPath: string) =>
  uploadFile(path.join(ROOT, "public", publicPath), contentTypes[path.extname(publicPath).toLowerCase()] ?? "application/octet-stream");

// Schema ------------------------------------------------------------------

const title = (content: string) => ({ title: [{ text: { content } }] });
const rich = (content: string) => ({ rich_text: content ? [{ text: { content } }] : [] });
const options = (entries: [string, string][]) => ({ options: entries.map(([name, color]) => ({ name, color })) });

async function ensureDatabase(key: keyof State["dataSources"], name: string, properties: Record<string, unknown>) {
  if (state.dataSources[key]) return state.dataSources[key]!;
  const db = await request<{ data_sources: { id: string }[] }>("/databases", {
    json: {
      parent: { type: "page_id", page_id: parentId },
      title: [{ text: { content: name } }],
      initial_data_source: { properties },
    },
  });
  state.dataSources[key] = db.data_sources[0].id;
  await saveState();
  console.log(`Created database "${name}"`);
  return state.dataSources[key]!;
}

const categoriesDs = await ensureDatabase("categories", "Categorias", {
  [P.category.name]: { title: {} },
  [P.category.nameEn]: { rich_text: {} },
  [P.category.order]: { number: {} },
  [P.category.image]: { files: {} },
  [P.category.published]: { checkbox: {} },
  [P.category.slug]: { rich_text: {} },
});

const productsDs = await ensureDatabase("products", "Produtos", {
  [P.product.name]: { title: {} },
  [P.product.nameEn]: { rich_text: {} },
  [P.product.category]: { relation: { data_source_id: categoriesDs, type: "dual_property", dual_property: {} } },
  [P.product.image]: { files: {} },
  [P.product.description]: { rich_text: {} },
  [P.product.descriptionEn]: { rich_text: {} },
  [P.product.availability]: {
    select: options([
      [AVAILABILITY.available, "green"],
      [AVAILABILITY.onRequest, "yellow"],
      [AVAILABILITY.soldOut, "red"],
    ]),
  },
  [P.product.stock]: { number: {} },
  [P.product.featured]: { checkbox: {} },
  [P.product.published]: { checkbox: {} },
  [P.product.slug]: { rich_text: {} },
});

const cataloguesDs = await ensureDatabase("catalogues", "Catálogos", {
  [P.catalogue.name]: { title: {} },
  [P.catalogue.nameEn]: { rich_text: {} },
  [P.catalogue.cover]: { files: {} },
  [P.catalogue.pdf]: { files: {} },
  [P.catalogue.order]: { number: {} },
  [P.catalogue.published]: { checkbox: {} },
});

const requestsDs = await ensureDatabase("requests", "Pedidos", {
  [P.request.name]: { title: {} },
  [P.request.status]: {
    select: options(REQUEST_STATUS.map((s, i) => [s, ["blue", "yellow", "orange", "green", "gray"][i]] as [string, string])),
  },
  [P.request.type]: { select: options([["Orçamento", "purple"], ["Contacto", "default"]]) },
  [P.request.product]: { relation: { data_source_id: productsDs, type: "single_property", single_property: {} } },
  [P.request.meters]: { rich_text: {} },
  [P.request.email]: { email: {} },
  [P.request.phone]: { phone_number: {} },
  [P.request.company]: { rich_text: {} },
  [P.request.subject]: { rich_text: {} },
  [P.request.message]: { rich_text: {} },
  [P.request.language]: { select: options([["PT", "default"], ["EN", "default"]]) },
  [P.request.received]: { created_time: {} },
});

// Content -----------------------------------------------------------------

type Snapshot = {
  categories: { slug: string; name: { pt: string; en: string }; image: string; order: number }[];
  products: { slug: string; category: string; name: { pt: string; en: string }; description: { pt: string; en: string }; image: string | null }[];
};
const snapshot = JSON.parse(await readFile(path.join(ROOT, "src/data/catalog.json"), "utf8")) as Snapshot;

async function createPage(key: string, dataSourceId: string, properties: Record<string, unknown>) {
  if (state.pages[key]) return state.pages[key];
  const page = await request<{ id: string }>("/pages", {
    json: { parent: { type: "data_source_id", data_source_id: dataSourceId }, properties },
  });
  state.pages[key] = page.id;
  await saveState();
  return page.id;
}

for (const c of snapshot.categories) {
  await createPage(`category:${c.slug}`, categoriesDs, {
    [P.category.name]: title(c.name.pt),
    [P.category.nameEn]: rich(c.name.en),
    [P.category.slug]: rich(c.slug),
    [P.category.order]: { number: c.order },
    [P.category.published]: { checkbox: true },
    [P.category.image]: { files: [await uploadPublicFile(c.image)] },
  });
}
console.log(`Categories: ${snapshot.categories.length}`);

let done = 0;
for (const p of snapshot.products) {
  const key = `product:${p.category}/${p.slug}`;
  if (!state.pages[key]) {
    await createPage(key, productsDs, {
      [P.product.name]: title(p.name.pt),
      [P.product.nameEn]: rich(p.name.en),
      [P.product.slug]: rich(p.slug),
      [P.product.category]: { relation: [{ id: state.pages[`category:${p.category}`] }] },
      [P.product.description]: rich(p.description.pt),
      [P.product.descriptionEn]: rich(p.description.en),
      [P.product.featured]: { checkbox: p.category === "napas" },
      [P.product.published]: { checkbox: true },
      ...(p.image ? { [P.product.image]: { files: [await uploadPublicFile(p.image)] } } : {}),
    });
  }
  done++;
  if (done % 20 === 0) console.log(`Products: ${done}/${snapshot.products.length}`);
}
console.log(`Products: ${snapshot.products.length}`);

const { localCatalogues } = await import("../src/lib/site.ts");
for (const [index, c] of localCatalogues.entries()) {
  await createPage(`catalogue:${c.id}`, cataloguesDs, {
    [P.catalogue.name]: title(c.title.pt),
    [P.catalogue.nameEn]: rich(c.title.en),
    [P.catalogue.order]: { number: index + 1 },
    [P.catalogue.published]: { checkbox: true },
    [P.catalogue.cover]: { files: [await uploadPublicFile(c.cover)] },
    // PDFs are linked, not uploaded: several exceed the 20 MB direct upload limit.
    [P.catalogue.pdf]: { files: [{ type: "external", name: path.basename(c.pdf), external: { url: c.pdf } }] },
  });
}
console.log(`Catalogues: ${localCatalogues.length}`);

// Owner guide, written once at the top of the shared page.
const GUIDE: [string, string][] = [
  ["heading_2", "Como gerir o site"],
  ["paragraph", "Tudo o que está nestas tabelas aparece no site. As alterações ficam visíveis no site em poucos segundos."],
  ["heading_3", "Produtos"],
  ["bulleted_list_item", "Para adicionar um produto, crie uma linha nova em Produtos: preencha o Nome, escolha a Categoria, arraste a fotografia para Imagem e marque Publicado."],
  ["bulleted_list_item", "Para esconder um produto sem o apagar, desmarque Publicado."],
  ["bulleted_list_item", "Disponibilidade aparece no site (Disponível, Sob encomenda ou Esgotado). Stock (m) é só para controlo interno e não aparece no site."],
  ["bulleted_list_item", "Destaque: os produtos marcados aparecem na página inicial (até 8)."],
  ["bulleted_list_item", "Os campos EN são a versão em inglês. Se ficarem vazios, o site mostra o texto em português."],
  ["bulleted_list_item", "Slug é o endereço do produto no site. Não o altere depois de publicado, para não quebrar links."],
  ["heading_3", "Pedidos"],
  ["bulleted_list_item", "Cada formulário enviado no site cria uma linha em Pedidos, com o produto, os metros e os contactos do cliente."],
  ["bulleted_list_item", "Use o Estado para acompanhar cada pedido: Novo, Contactado, Orçamento enviado, Ganho ou Perdido. Dica: crie uma vista em Quadro agrupada por Estado."],
  ["heading_3", "Catálogos e categorias"],
  ["bulleted_list_item", "Em Catálogos, a Capa é a imagem mostrada no site e o PDF é o ficheiro que abre ao clicar."],
  ["bulleted_list_item", "Em Categorias, a Ordem define a sequência no site."],
];

if (!state.pages["guide"]) {
  await request(`/blocks/${parentId}/children`, {
    method: "PATCH",
    json: {
      position: { type: "start" },
      children: GUIDE.map(([type, content]) => ({ type, [type]: { rich_text: [{ text: { content } }] } })),
    },
  });
  state.pages["guide"] = "written";
  await saveState();
  console.log("Wrote the owner guide on the shared page");
}

console.log(`
Done. Add these to .env.local and to the Vercel project:

NOTION_CATEGORIES_DS=${categoriesDs}
NOTION_PRODUCTS_DS=${productsDs}
NOTION_CATALOGUES_DS=${cataloguesDs}
NOTION_REQUESTS_DS=${requestsDs}
`);
