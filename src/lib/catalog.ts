import "server-only";
import { createHash } from "node:crypto";
import { cacheLife, cacheTag } from "next/cache";
import snapshot from "@/data/catalog.json";
import type { Locale } from "@/i18n/config";
import { checkbox, firstFileUrl, notionToken, num, queryAll, relationIds, select, text, type NotionPage } from "@/lib/notion/client";
import { AVAILABILITY, P, type MediaKind } from "@/lib/notion/schema";
import { localCatalogues } from "@/lib/site";

type Localized = Record<Locale, string>;

export type Availability = keyof typeof AVAILABILITY;

export type Category = {
  id: string;
  slug: string;
  name: Localized;
  image: string | null;
  order: number;
};

export type Product = {
  id: string;
  slug: string;
  category: string;
  name: Localized;
  description: Localized;
  image: string | null;
  availability: Availability | null;
  featured: boolean;
};

export type Catalogue = {
  id: string;
  title: Localized;
  cover: string | null;
  pdf: string | null;
};

export type Catalog = { categories: Category[]; products: Product[]; catalogues: Catalogue[] };

export const CATALOG_TAG = "catalog";

const dataSources = () => ({
  categories: process.env.NOTION_CATEGORIES_DS,
  products: process.env.NOTION_PRODUCTS_DS,
  catalogues: process.env.NOTION_CATALOGUES_DS,
});

export function isNotionConfigured() {
  const ds = dataSources();
  return Boolean(notionToken() && ds.categories && ds.products && ds.catalogues);
}

export async function getCatalog(): Promise<Catalog> {
  "use cache";
  cacheTag(CATALOG_TAG);
  // Notion webhooks revalidate the tag on every edit; this is the safety net.
  cacheLife("hours");
  return isNotionConfigured() ? loadFromNotion() : loadFromSnapshot();
}

// Notion -----------------------------------------------------------------

const published = (name: string) => ({ filter: { property: name, checkbox: { equals: true } } });

// Notion-hosted file URLs expire after an hour, so pages link to /media/...,
// which resolves a fresh URL on demand. The hash changes when the file does.
function mediaUrl(kind: MediaKind, page: NotionPage, property: string) {
  const url = firstFileUrl(page, property);
  if (!url) return null;
  const version = createHash("sha1").update(new URL(url).pathname).digest("hex").slice(0, 12);
  return `/media/${kind}/${page.id}/${version}`;
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function uniqueSlug(slug: string, taken: Set<string>) {
  let candidate = slug || "item";
  for (let i = 2; taken.has(candidate); i++) candidate = `${slug}-${i}`;
  taken.add(candidate);
  return candidate;
}

const availabilityFromLabel = Object.fromEntries(
  Object.entries(AVAILABILITY).map(([key, label]) => [label, key as Availability]),
);

async function loadFromNotion(): Promise<Catalog> {
  const ds = dataSources();
  const [categoryPages, productPages, cataloguePages] = await Promise.all([
    queryAll(ds.categories!, { ...published(P.category.published), sorts: [{ property: P.category.order, direction: "ascending" }] }),
    queryAll(ds.products!, { ...published(P.product.published), sorts: [{ property: P.product.name, direction: "ascending" }] }),
    queryAll(ds.catalogues!, { ...published(P.catalogue.published), sorts: [{ property: P.catalogue.order, direction: "ascending" }] }),
  ]);

  const categorySlugs = new Set<string>();
  const categories: Category[] = categoryPages.map((page, index) => {
    const pt = text(page, P.category.name);
    return {
      id: page.id,
      slug: uniqueSlug(text(page, P.category.slug) || slugify(pt), categorySlugs),
      name: { pt, en: text(page, P.category.nameEn) || pt },
      image: mediaUrl("category", page, P.category.image),
      order: num(page, P.category.order) ?? index,
    };
  });
  const categoryById = new Map(categories.map((c) => [c.id, c]));

  const productSlugs = new Map<string, Set<string>>();
  const products: Product[] = [];
  for (const page of productPages) {
    const category = relationIds(page, P.product.category).map((id) => categoryById.get(id)).find(Boolean);
    if (!category) continue;
    const pt = text(page, P.product.name);
    const taken = productSlugs.get(category.slug) ?? new Set<string>();
    productSlugs.set(category.slug, taken);
    const descriptionPt = text(page, P.product.description);
    products.push({
      id: page.id,
      slug: uniqueSlug(text(page, P.product.slug) || slugify(pt), taken),
      category: category.slug,
      name: { pt, en: text(page, P.product.nameEn) || pt },
      description: { pt: descriptionPt, en: text(page, P.product.descriptionEn) || descriptionPt },
      image: mediaUrl("product", page, P.product.image),
      availability: availabilityFromLabel[select(page, P.product.availability) ?? ""] ?? null,
      featured: checkbox(page, P.product.featured),
    });
  }
  products.sort((a, b) => a.name.pt.localeCompare(b.name.pt, "pt", { numeric: true }));

  const catalogues: Catalogue[] = cataloguePages.map((page) => {
    const pt = text(page, P.catalogue.name);
    return {
      id: page.id,
      title: { pt, en: text(page, P.catalogue.nameEn) || pt },
      cover: mediaUrl("catalogue-cover", page, P.catalogue.cover),
      pdf: mediaUrl("catalogue-pdf", page, P.catalogue.pdf),
    };
  });

  return { categories, products, catalogues };
}

// Local snapshot (used until Notion is configured) -----------------------

function loadFromSnapshot(): Catalog {
  const categories: Category[] = snapshot.categories.map((c) => ({ ...c, id: c.slug }));
  const products: Product[] = snapshot.products.map((p) => ({
    ...p,
    id: `${p.category}/${p.slug}`,
    availability: null,
    featured: p.category === "napas",
  }));
  return { categories, products, catalogues: localCatalogues };
}

// Helpers ------------------------------------------------------------------

export async function getCategory(slug: string) {
  return (await getCatalog()).categories.find((c) => c.slug === slug);
}

export async function getProductsByCategory(slug: string) {
  return (await getCatalog()).products.filter((p) => p.category === slug);
}

export async function getProduct(category: string, slug: string) {
  return (await getCatalog()).products.find((p) => p.category === category && p.slug === slug);
}
