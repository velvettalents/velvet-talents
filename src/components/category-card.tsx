import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Category } from "@/lib/catalog";
import { paths } from "@/lib/paths";

export function CategoryCard({ category, locale, countLabel }: { category: Category; locale: Locale; countLabel: string }) {
  return (
    <Link href={paths.category(locale, category.slug)} className="group flex items-center gap-4 border border-line bg-white p-3 transition hover:border-ink">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-cream">
        {category.image && <Image src={category.image} alt="" fill sizes="64px" className="object-cover" />}
      </div>
      <div>
        <h3 className="font-medium">{category.name[locale]}</h3>
        <p className="text-xs text-ink-muted">{countLabel}</p>
      </div>
    </Link>
  );
}
