import catalog from "@/data/catalog.json";
import type { Locale } from "@/i18n/config";

type Localized = Record<Locale, string>;

export type Category = {
  slug: string;
  name: Localized;
  image: string;
  order: number;
};

export type Product = {
  slug: string;
  category: string;
  name: Localized;
  description: Localized;
  image: string | null;
};

export const categories: Category[] = catalog.categories;
export const products = catalog.products as Product[];

export function getCategory(slug: string) {
  return categories.find((c) => c.slug === slug);
}

export function getProductsByCategory(slug: string) {
  return products.filter((p) => p.category === slug);
}

export function getProduct(category: string, slug: string) {
  return products.find((p) => p.category === category && p.slug === slug);
}

export function countByCategory(slug: string) {
  return getProductsByCategory(slug).length;
}
