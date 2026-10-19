import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { getCatalog, getCategory, getProduct, getProductsByCategory } from "@/lib/catalog";
import { format, paths } from "@/lib/paths";
import { site } from "@/lib/site";
import { InquiryForm } from "@/components/inquiry-form";
import { ProductCard } from "@/components/product-card";
import { ArrowLeft, MailIcon, PhoneIcon } from "@/components/icons";
import { AvailabilityBadge } from "@/components/availability-badge";

export async function generateStaticParams() {
  const { products } = await getCatalog();
  return products.map((p) => ({ category: p.category, slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/products/[category]/[slug]">): Promise<Metadata> {
  const { category, slug } = await params;
  const locale = await getLocale();
  const product = await getProduct(category, slug);
  if (!product) return {};
  return {
    title: product.name[locale],
    description: product.description[locale],
    openGraph: product.image ? { images: [product.image] } : undefined,
  };
}

export default async function ProductPage({ params }: PageProps<"/[lang]/products/[category]/[slug]">) {
  const { category: categorySlug, slug } = await params;
  const locale = await getLocale();
  const dict = await getDictionary();
  const [product, category, siblings] = await Promise.all([
    getProduct(categorySlug, slug),
    getCategory(categorySlug),
    getProductsByCategory(categorySlug),
  ]);
  if (!product || !category) notFound();

  const related = siblings
    .filter((p) => p.slug !== slug)
    .slice(0, 4);

  return (
    <>
      <section className="container-page py-10 sm:py-14">
        <Link href={paths.category(locale, category.slug)} className="mb-6 inline-flex min-h-11 items-center gap-2 text-sm text-ink-muted hover:text-ink">
          <ArrowLeft /> {format(dict.products.backToCategory, { category: category.name[locale] })}
        </Link>
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative aspect-square overflow-hidden bg-cream lg:sticky lg:top-24 lg:self-start">
            {product.image && (
              <Image src={product.image} alt={product.name[locale]} fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
            )}
          </div>
          <div>
            <Link href={paths.category(locale, category.slug)} className="eyebrow hover:text-ink">
              {category.name[locale]}
            </Link>
            <h1 className="mt-3 font-display text-4xl leading-tight font-medium sm:text-5xl">{product.name[locale]}</h1>
            {product.description[locale] && <p className="mt-5 text-lg leading-8 text-ink-soft">{product.description[locale]}</p>}
            <div className="mt-6 flex flex-wrap gap-2">
              {product.availability && <AvailabilityBadge availability={product.availability} label={dict.products.availability[product.availability]} />}
              <p className="inline-flex items-center border border-line px-3 py-1.5 text-xs tracking-wide text-ink-muted uppercase">
                {dict.products.priceOnRequest}
              </p>
            </div>

            <div className="mt-10 border-t border-line pt-10">
              <h2 className="font-display text-2xl font-medium">{dict.products.requestQuote}</h2>
              <p className="mt-2 mb-6 text-sm leading-6 text-ink-soft">{dict.products.quoteIntro}</p>
              <InquiryForm
                kind="quote"
                locale={locale}
                product={`${product.name.pt} (${category.name.pt})`}
                productId={product.id}
                labels={dict.forms}
                submitLabel={dict.forms.send}
                privacyHref={paths.privacy(locale)}
              />
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-soft">
                <a href={site.phones[0].href} className="inline-flex items-center gap-2 hover:text-ink">
                  <PhoneIcon className="h-4 w-4" /> {site.phones[0].display}
                </a>
                <a href={`mailto:${site.email}`} className="inline-flex items-center gap-2 hover:text-ink">
                  <MailIcon className="h-4 w-4" /> {site.email}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="border-t border-line bg-cream/60">
          <div className="container-page py-14">
            <h2 className="mb-8 font-display text-3xl font-medium">{dict.products.related}</h2>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 sm:gap-x-5">
              {related.map((p) => (
                <li key={p.slug}>
                  <ProductCard product={p} locale={locale} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
