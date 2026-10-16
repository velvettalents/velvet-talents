import type { Locale } from "@/i18n/config";

export const paths = {
  home: (l: Locale) => `/${l}`,
  products: (l: Locale) => `/${l}/products`,
  category: (l: Locale, category: string) => `/${l}/products/${category}`,
  product: (l: Locale, category: string, slug: string) => `/${l}/products/${category}/${slug}`,
  coverings: (l: Locale) => `/${l}/coverings`,
  catalogs: (l: Locale) => `/${l}/catalogs`,
  about: (l: Locale) => `/${l}/about`,
  contact: (l: Locale) => `/${l}/contact`,
  howToOrder: (l: Locale) => `/${l}/how-to-order`,
  privacy: (l: Locale) => `/${l}/privacy`,
  cookies: (l: Locale) => `/${l}/cookies`,
};

export function format(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ""));
}
