import type { Metadata } from "next";
import Image from "next/image";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { paths } from "@/lib/paths";
import { catalogues } from "@/lib/site";
import { PageHeader } from "@/components/page-header";
import { DocumentIcon } from "@/components/icons";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.catalogs.title, description: dict.catalogs.intro };
}

export default async function CatalogsPage() {
  const locale = await getLocale();
  const dict = await getDictionary();

  return (
    <>
      <PageHeader title={dict.catalogs.title} intro={dict.catalogs.intro} crumbs={[{ href: paths.home(locale), label: dict.nav.home }]} />
      <section className="container-page py-14">
        <ul className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
          {catalogues.map((catalogue) => (
            <li key={catalogue.id}>
              <a href={catalogue.pdf} target="_blank" rel="noopener noreferrer" className="group block">
                <div className="relative aspect-square overflow-hidden bg-cream">
                  <Image src={catalogue.cover} alt="" fill sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw" className="object-cover transition duration-500 group-hover:scale-105" />
                </div>
                <h2 className="mt-3 text-sm font-medium">{catalogue.title[locale]}</h2>
                <span className="mt-1 inline-flex items-center gap-1.5 text-xs text-ink-muted group-hover:text-ink">
                  <DocumentIcon className="h-4 w-4" /> {dict.catalogs.open}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
