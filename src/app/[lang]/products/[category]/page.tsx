import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { getCatalog, getCategory, getProductsByCategory } from "@/lib/catalog";
import { format, paths } from "@/lib/paths";
import { PageHeader } from "@/components/page-header";
import { ProductCard } from "@/components/product-card";
import Link from "next/link";

export async function generateStaticParams() {
  const { categories } = await getCatalog();
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/products/[category]">): Promise<Metadata> {
  const { category: slug } = await params;
  const locale = await getLocale();
  const category = await getCategory(slug);
  if (!category) return {};
  return { title: category.name[locale] };
}

export default async function CategoryPage({ params }: PageProps<"/[lang]/products/[category]">) {
  const { category: slug } = await params;
  const locale = await getLocale();
  const dict = await getDictionary();
  const [{ categories }, category, items] = await Promise.all([getCatalog(), getCategory(slug), getProductsByCategory(slug)]);
  if (!category) notFound();

  const intro = items.length === 1 ? dict.products.countOne : format(dict.products.count, { count: items.length });

  return (
    <>
      <PageHeader
        title={category.name[locale]}
        intro={intro}
        crumbs={[
          { href: paths.home(locale), label: dict.nav.home },
          { href: paths.products(locale), label: dict.nav.products },
        ]}
      />
      <section className="container-page py-12">
        <nav aria-label={dict.products.category} className="-mx-5 mb-10 flex gap-2 overflow-x-auto px-5 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={paths.category(locale, c.slug)}
              aria-current={c.slug === slug ? "page" : undefined}
              className={`flex h-10 shrink-0 items-center rounded-sm border px-4 text-xs whitespace-nowrap transition ${
                c.slug === slug ? "border-ink bg-ink text-white" : "border-line text-ink-soft hover:border-ink"
              }`}
            >
              {c.name[locale]}
            </Link>
          ))}
        </nav>
        <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-5 sm:gap-y-10 lg:grid-cols-4">
          {items.map((product) => (
            <li key={product.slug}>
              <ProductCard product={product} locale={locale} />
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
