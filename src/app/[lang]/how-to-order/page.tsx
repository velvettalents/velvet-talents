import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { paths } from "@/lib/paths";
import { site } from "@/lib/site";
import { PageHeader } from "@/components/page-header";
import { ArrowRight, MailIcon, PhoneIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.howToOrder.title, description: dict.howToOrder.steps[0].text };
}

export default async function HowToOrderPage() {
  const locale = await getLocale();
  const dict = await getDictionary();
  const t = dict.howToOrder;

  return (
    <>
      <PageHeader title={t.title} crumbs={[{ href: paths.home(locale), label: dict.nav.home }]} />
      <section className="container-page py-16">
        <ol className="grid gap-10 md:grid-cols-3">
          {t.steps.map((step, i) => (
            <li key={step.title} className="border-t-2 border-ink pt-6">
              <span className="font-display text-3xl text-sand tabular-nums">0{i + 1}</span>
              <h2 className="mt-2 text-lg font-medium">{step.title}</h2>
              <p className="mt-3 leading-7 text-ink-soft">{step.text}</p>
            </li>
          ))}
        </ol>
        <div className="mt-16 flex flex-col gap-8 bg-cream p-6 sm:p-10 lg:flex-row lg:items-center lg:justify-between">
          <p className="max-w-xl leading-7">{t.resale}</p>
          <div className="flex flex-col gap-3 text-sm">
            <a href={site.phones[0].href} className="inline-flex items-center gap-2 font-medium">
              <PhoneIcon /> {site.phones[0].display}
            </a>
            <a href={`mailto:${site.email}`} className="inline-flex items-center gap-2">
              <MailIcon /> {site.email}
            </a>
          </div>
        </div>
        <Button asChild size="xl" className="mt-12 w-full sm:w-auto">
          <Link href={paths.products(locale)}>
            {dict.home.ctaProducts} <ArrowRight />
          </Link>
        </Button>
      </section>
    </>
  );
}
