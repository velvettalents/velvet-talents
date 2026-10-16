"use client";

import Image from "next/image";
import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type Item = { slug: string; name: string; category: string; categoryName: string; image: string | null; href: string };
type CategoryOption = { slug: string; name: string };

const ALL = "all";

const normalize = (value: string) =>
  value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function ProductBrowser({
  items,
  categories,
  labels,
}: {
  items: Item[];
  categories: CategoryOption[];
  labels: { search: string; placeholder: string; all: string; noResults: string; category: string };
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(ALL);
  const deferredQuery = useDeferredValue(query);

  const filtered = useMemo(() => {
    const q = normalize(deferredQuery.trim());
    return items.filter(
      (item) =>
        (category === ALL || item.category === category) &&
        (!q || normalize(`${item.name} ${item.categoryName}`).includes(q)),
    );
  }, [items, category, deferredQuery]);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4">
        <div className="relative max-w-md">
          <SearchIcon aria-hidden className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            aria-label={labels.search}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={labels.placeholder}
            autoComplete="off"
            spellCheck={false}
            className="h-12 rounded-sm bg-white pl-10"
          />
        </div>
        {/* Single scrollable row on phones, wrapping chips from sm up. */}
        <div className="-mx-5 overflow-x-auto px-5 [scrollbar-width:none] sm:mx-0 sm:overflow-visible sm:px-0">
          <ToggleGroup
            type="single"
            value={category}
            onValueChange={(value) => setCategory(value || ALL)}
            aria-label={labels.category}
            variant="chip"
            spacing={2}
            className="w-max sm:w-auto sm:flex-wrap"
          >
            <ToggleGroupItem value={ALL} className="h-10 rounded-sm px-4 text-xs">
              {labels.all}
            </ToggleGroupItem>
            {categories.map((c) => (
              <ToggleGroupItem
                key={c.slug}
                value={c.slug}
                className="h-10 rounded-sm px-4 text-xs whitespace-nowrap"
              >
                {c.name}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </div>

      <p aria-live="polite" className="sr-only">
        {filtered.length}
      </p>

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">{labels.noResults}</p>
      ) : (
        <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-5 sm:gap-y-10 lg:grid-cols-4">
          {filtered.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="group block">
                <div className="relative aspect-square overflow-hidden bg-cream">
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                  )}
                </div>
                <p className="mt-3 text-[11px] tracking-[0.15em] text-ink-muted uppercase">{item.categoryName}</p>
                <h3 className="mt-1 text-sm font-medium group-hover:underline group-hover:decoration-sand group-hover:underline-offset-4">
                  {item.name}
                </h3>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
