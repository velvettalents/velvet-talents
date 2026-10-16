import type { Metadata } from "next";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { categories, getCategory, products } from "@/lib/catalog";
import { paths } from "@/lib/paths";
import { PageHeader } from "@/components/page-header";
import { ProductBrowser } from "@/components/product-browser";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.products.title, description: dict.products.intro };
}

export default async function ProductsPage() {
  const locale = await getLocale();
  const dict = await getDictionary();

  const items = products.map((p) => ({
    slug: p.slug,
    name: p.name[locale],
    category: p.category,
    categoryName: getCategory(p.category)?.name[locale] ?? "",
    image: p.image,
    href: paths.product(locale, p.category, p.slug),
  }));

  return (
    <>
      <PageHeader
        title={dict.products.title}
        intro={dict.products.intro}
        crumbs={[{ href: paths.home(locale), label: dict.nav.home }]}
      />
      <section className="container-page py-12">
        <ProductBrowser
          items={items}
          categories={categories.map((c) => ({ slug: c.slug, name: c.name[locale] }))}
          labels={{
            search: dict.products.searchLabel,
            placeholder: dict.products.searchPlaceholder,
            all: dict.products.allCategories,
            noResults: dict.products.noResults,
            category: dict.products.category,
          }}
        />
      </section>
    </>
  );
}
