"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, type Locale } from "@/i18n/config";

export function LanguageSwitcher({ current, label }: { current: Locale; label: string }) {
  const pathname = usePathname();

  return (
    <nav aria-label={label} className="flex items-center gap-1 text-xs font-medium tracking-wider">
      {locales.map((locale, i) => {
        const href = pathname.replace(/^\/(pt|en)(?=\/|$)/, `/${locale}`);
        const active = locale === current;
        return (
          <span key={locale} className="flex items-center gap-1">
            {i > 0 && <span aria-hidden className="text-line">/</span>}
            <Link
              href={href}
              hrefLang={locale}
              lang={locale}
              aria-current={active ? "true" : undefined}
              className={`flex h-11 min-w-9 items-center justify-center uppercase transition-colors ${active ? "text-ink" : "text-ink-muted hover:text-ink"}`}
            >
              {locale}
            </Link>
          </span>
        );
      })}
    </nav>
  );
}
