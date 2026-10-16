import type { Metadata } from "next";
import Image from "next/image";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { paths } from "@/lib/paths";
import { site } from "@/lib/site";
import { PageHeader } from "@/components/page-header";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.about.title, description: dict.about.lead };
}

export default async function AboutPage() {
  const locale = await getLocale();
  const dict = await getDictionary();
  const t = dict.about;

  return (
    <>
      <PageHeader title={t.title} eyebrow={site.legalName} crumbs={[{ href: paths.home(locale), label: dict.nav.home }]} />
      <section className="container-page grid gap-12 py-16 lg:grid-cols-2 lg:gap-20">
        <div>
          <p className="font-display text-2xl leading-snug sm:text-3xl">{t.lead}</p>
          {t.paragraphs.map((p) => (
            <p key={p} className="mt-6 leading-7 text-ink-soft">
              {p}
            </p>
          ))}
          <div className="mt-12">
            <h2 className="eyebrow mb-5">{t.valuesTitle}</h2>
            <ul className="grid grid-cols-2 gap-px border border-line bg-line">
              {t.values.map((value) => (
                <li key={value} className="bg-white px-5 py-4 text-sm font-medium">
                  {value}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-ink-muted">{t.valuesText}</p>
          </div>
        </div>
        <div className="relative aspect-[3/4] overflow-hidden bg-cream lg:sticky lg:top-24 lg:self-start">
          <Image src="/images/site/workshop.jpg" alt={site.legalName} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover object-[50%_70%]" />
        </div>
      </section>
    </>
  );
}
