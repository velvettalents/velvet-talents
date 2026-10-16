import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { paths } from "@/lib/paths";
import { PageHeader } from "@/components/page-header";
import { ArrowRight } from "@/components/icons";
import { Button } from "@/components/ui/button";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.coverings.title, description: dict.coverings.paragraphs[0] };
}

export default async function CoveringsPage() {
  const locale = await getLocale();
  const dict = await getDictionary();
  const t = dict.coverings;

  return (
    <>
      <PageHeader title={t.title} eyebrow={t.subtitle} crumbs={[{ href: paths.home(locale), label: dict.nav.home }]} />
      <section className="container-page grid items-start gap-12 py-16 lg:grid-cols-2">
        <div className="relative aspect-[16/9] overflow-hidden bg-cream">
          <Image src="/images/site/laminacao.jpg" alt={t.subtitle} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
        </div>
        <div>
          {t.paragraphs.map((p, i) => (
            <p key={p} className={i === 0 ? "font-display text-2xl leading-snug" : "mt-5 leading-7 text-ink-soft"}>
              {p}
            </p>
          ))}
          <ol className="mt-10 grid grid-cols-3 gap-px border border-line bg-line text-center">
            {t.steps.map((step, i) => (
              <li key={step} className="bg-white px-3 py-5">
                <span className="block font-display text-2xl text-sand tabular-nums">0{i + 1}</span>
                <span className="mt-1 block text-xs tracking-wide uppercase">{step}</span>
              </li>
            ))}
          </ol>
          <Button asChild size="xl" className="mt-10 w-full sm:w-auto">
            <Link href={paths.contact(locale)}>
              {t.cta} <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
