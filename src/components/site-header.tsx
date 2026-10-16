import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { paths } from "@/lib/paths";
import { LanguageSwitcher } from "./language-switcher";
import { MobileMenu } from "./mobile-menu";
import { NavLink } from "./nav-link";

export function SiteHeader({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const items = [
    { href: paths.home(locale), label: dict.nav.home },
    { href: paths.products(locale), label: dict.nav.products },
    { href: paths.coverings(locale), label: dict.nav.coverings },
    { href: paths.catalogs(locale), label: dict.nav.catalogs },
    { href: paths.about(locale), label: dict.nav.about },
    { href: paths.contact(locale), label: dict.nav.contact },
  ];

  return (
    <header className="sticky top-0 z-50 h-[var(--header-h)] border-b border-line bg-white/95 backdrop-blur [--header-h:72px]">
      <div className="container-page flex h-full items-center justify-between gap-6">
        <Link href={paths.home(locale)} className="shrink-0" aria-label="Velvet Talents">
          <Image src="/brand/logo-trimmed.png" alt="Velvet Talents" width={1200} height={454} priority className="h-10 w-auto" />
        </Link>
        <nav aria-label={dict.nav.menu} className="hidden items-center gap-7 text-sm lg:flex">
          {items.map((item) => (
            <NavLink key={item.href} href={item.href} className="transition-colors">
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <LanguageSwitcher current={locale} label={dict.nav.language} />
          <MobileMenu items={items} labels={{ menu: dict.nav.menu, close: dict.nav.close }} />
        </div>
      </div>
    </header>
  );
}
