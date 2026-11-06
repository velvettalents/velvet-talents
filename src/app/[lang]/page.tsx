import Image from "next/image";
import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { getCatalog } from "@/lib/catalog";
import { format, paths } from "@/lib/paths";
import { CategoryCard } from "@/components/category-card";
import { ProductCard } from "@/components/product-card";
import { ArrowRight } from "@/components/icons";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const locale = await getLocale();
  const dict = await getDictionary();
  const t = dict.home;
  const { categories, products } = await getCatalog();
  const featured = products.filter((p) => p.featured).slice(0, 8);
  const countByCategory = (slug: string) => products.filter((p) => p.category === slug).length;
  const countLabel = (n: number) => (n === 1 ? dict.products.countOne : format(dict.products.count, { count: n }));

  return (
    <>
      <section className="relative overflow-hidden bg-cream">
        <div className="container-page grid items-center gap-10 py-16 lg:grid-cols-[1.1fr_1fr] lg:py-24">
          <div>
            <p className="eyebrow mb-5">{t.eyebrow}</p>
            <h1 className="font-display text-4xl leading-[1.1] font-medium text-balance sm:text-5xl lg:text-6xl">{t.heroTitle}</h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-ink-soft text-pretty">{t.heroText}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="xl">
                <Link href={paths.products(locale)}>
                  {t.ctaProducts} <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="xl" variant="outline" className="border-ink bg-transparent">
                <Link href={paths.howToOrder(locale)}>{t.ctaQuote}</Link>
              </Button>
            </div>
          </div>
          <div className="relative aspect-[4/3] w-full sm:aspect-[5/4] lg:aspect-[4/5]">
            <Image src="/images/site/inside-car.jpg" alt="" fill priority sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
            <div aria-hidden className="absolute -bottom-px -left-px h-1/3 w-1/3 border-b-4 border-l-4 border-ink" />
          </div>
        </div>
      </section>

      <section className="container-page grid gap-4 py-12 sm:gap-5 sm:py-16 md:grid-cols-2">
        <FeatureTile
          href={paths.category(locale, "tecidotejadilho")}
          image="/images/products/tecido-tejadilho-a-1.webp"
          title={t.headlinerTitle}
          text={t.headlinerText}
          cta={t.headlinerCta}
        />
        <FeatureTile
          href={paths.category(locale, "napas")}
          image="/images/products/napa-a1.webp"
          title={t.vinylTitle}
          text={t.vinylText}
          cta={t.vinylCta}
        />
      </section>

      <section className="border-y border-line bg-cream/60">
        <div className="container-page py-16">
          <div className="mb-10 max-w-2xl">
            <h2 className="font-display text-3xl font-medium sm:text-4xl">{t.categoriesTitle}</h2>
            <p className="mt-3 text-ink-soft">{t.categoriesText}</p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <li key={category.slug}>
                <CategoryCard category={category} locale={locale} countLabel={countLabel(countByCategory(category.slug))} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-3xl font-medium sm:text-4xl">{t.latestTitle}</h2>
          <Link href={paths.products(locale)} className="inline-flex items-center gap-2 border-b border-ink pb-1 text-sm">
            {t.viewAll} <ArrowRight />
          </Link>
        </div>
        <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-5 sm:gap-y-10 lg:grid-cols-4">
          {featured.map((product) => (
            <li key={product.slug}>
              <ProductCard product={product} locale={locale} />
            </li>
          ))}
        </ul>
      </section>

      <section className="container-page grid gap-5 pb-16 md:grid-cols-2">
        <InfoPanel title={t.aboutTitle} text={t.aboutText} cta={t.aboutCta} href={paths.about(locale)} dark />
        <InfoPanel title={t.quoteTitle} text={t.quoteText} cta={t.quoteCta} href={paths.howToOrder(locale)} />
      </section>

      <section className="bg-ink text-white">
        <div className="container-page py-16">
          <h2 className="mb-10 font-display text-3xl font-medium sm:text-4xl">{t.servicesTitle}</h2>
          <ol className="grid gap-10 md:grid-cols-3">
            {t.services.map((service, i) => (
              <li key={service.title} className="border-t border-white/20 pt-6">
                <span className="font-display text-2xl text-sand tabular-nums">0{i + 1}</span>
                <h3 className="mt-2 text-lg font-medium">{service.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/70">{service.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="container-page grid items-center gap-10 py-16 md:grid-cols-2">
        <div className="relative aspect-[16/9] overflow-hidden">
          <Image src="/images/site/laminacao.jpg" alt={t.laminationTitle} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
        </div>
        <div>
          <h2 className="font-display text-3xl font-medium sm:text-4xl">{t.laminationTitle}</h2>
          <p className="mt-4 max-w-md leading-7 text-ink-soft">{t.laminationText}</p>
          <Link href={paths.coverings(locale)} className="mt-6 inline-flex items-center gap-2 border-b border-ink pb-1 text-sm">
            {t.laminationCta} <ArrowRight />
          </Link>
        </div>
      </section>
    </>
  );
}

function FeatureTile({ href, image, title, text, cta }: { href: string; image: string; title: string; text: string; cta: string }) {
  return (
    <Link href={href} className="group relative flex min-h-72 items-end overflow-hidden bg-ink p-6 text-white sm:min-h-80 sm:p-8">
      <Image src={image} alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover opacity-70 transition duration-700 group-hover:scale-105" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent" />
      <div className="relative">
        <h2 className="max-w-sm font-display text-3xl leading-tight font-medium">{title}</h2>
        <p className="mt-2 max-w-sm text-sm text-white/80">{text}</p>
        <span className="mt-5 inline-flex items-center gap-2 border-b border-white pb-1 text-xs font-medium tracking-[0.15em] uppercase">
          {cta} <ArrowRight />
        </span>
      </div>
    </Link>
  );
}

function InfoPanel({ title, text, cta, href, dark = false }: { title: string; text: string; cta: string; href: string; dark?: boolean }) {
  return (
    <div className={`flex flex-col justify-between gap-8 p-7 sm:p-10 ${dark ? "bg-ink-soft text-white" : "border border-line bg-cream"}`}>
      <div>
        <h2 className="font-display text-3xl font-medium">{title}</h2>
        <p className={`mt-3 leading-7 ${dark ? "text-white/75" : "text-ink-soft"}`}>{text}</p>
      </div>
      <Link href={href} className={`inline-flex w-fit items-center gap-2 border-b pb-1 text-sm ${dark ? "border-white" : "border-ink"}`}>
        {cta} <ArrowRight />
      </Link>
    </div>
  );
}
