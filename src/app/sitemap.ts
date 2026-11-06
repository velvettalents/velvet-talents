import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";
import { getCatalog } from "@/lib/catalog";
import { paths } from "@/lib/paths";
import { site } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { categories, products } = await getCatalog();
  const pages = [
    paths.home, paths.products, paths.coverings, paths.catalogs, paths.about,
    paths.contact, paths.howToOrder, paths.privacy, paths.cookies,
  ];

  const entry = (build: (l: (typeof locales)[number]) => string) => ({
    url: `${site.url}${build("pt")}`,
    alternates: { languages: Object.fromEntries(locales.map((l) => [l, `${site.url}${build(l)}`])) },
  });

  return [
    ...pages.map((page) => entry(page)),
    ...categories.map((c) => entry((l) => paths.category(l, c.slug))),
    ...products.map((p) => entry((l) => paths.product(l, p.category, p.slug))),
  ];
}
