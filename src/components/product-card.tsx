import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Product } from "@/lib/catalog";
import { paths } from "@/lib/paths";

export function ProductCard({ product, locale, categoryName }: { product: Product; locale: Locale; categoryName?: string }) {
  return (
    <Link href={paths.product(locale, product.category, product.slug)} className="group block">
      <div className="relative aspect-square overflow-hidden bg-cream">
        {product.image && (
          <Image
            src={product.image}
            alt={product.name[locale]}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        )}
      </div>
      <div className="mt-3 space-y-1">
        {categoryName && <p className="text-[11px] tracking-[0.15em] text-ink-muted uppercase">{categoryName}</p>}
        <h3 className="text-sm font-medium group-hover:underline group-hover:decoration-sand group-hover:underline-offset-4">
          {product.name[locale]}
        </h3>
      </div>
    </Link>
  );
}
