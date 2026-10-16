import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { paths } from "@/lib/paths";
import { Button } from "@/components/ui/button";

export default async function NotFound() {
  const locale = await getLocale();
  const dict = await getDictionary();
  return (
    <section className="container-page flex min-h-[50vh] flex-col items-start justify-center py-24">
      <p className="eyebrow mb-3">404</p>
      <h1 className="font-display text-4xl font-medium">{dict.notFound.title}</h1>
      <p className="mt-4 text-ink-soft">{dict.notFound.text}</p>
      <Button asChild size="xl" className="mt-8">
        <Link href={paths.home(locale)}>{dict.notFound.back}</Link>
      </Button>
    </section>
  );
}
