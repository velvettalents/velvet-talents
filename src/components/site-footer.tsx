import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { paths } from "@/lib/paths";
import { site } from "@/lib/site";
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from "./icons";

export function SiteFooter({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const explore = [
    { href: paths.products(locale), label: dict.nav.products },
    { href: paths.coverings(locale), label: dict.nav.coverings },
    { href: paths.catalogs(locale), label: dict.nav.catalogs },
    { href: paths.about(locale), label: dict.nav.about },
  ];
  const info = [
    { href: paths.howToOrder(locale), label: dict.nav.howToOrder },
    { href: paths.contact(locale), label: dict.nav.contact },
    { href: paths.privacy(locale), label: dict.nav.privacy },
    { href: paths.cookies(locale), label: dict.nav.cookies },
  ];

  return (
    <footer className="mt-auto bg-ink text-white/80">
      <div className="container-page grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-5">
          <Image src="/brand/logo-white.png" alt="Velvet Talents" width={1200} height={454} className="h-12 w-auto" />
          <p className="max-w-xs text-sm leading-6">{dict.footer.tagline}</p>
          <div className="flex gap-3">
            <a href={site.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="rounded-full border border-white/20 p-3 transition hover:border-white hover:text-white">
              <FacebookIcon />
            </a>
            <a href={site.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="rounded-full border border-white/20 p-3 transition hover:border-white hover:text-white">
              <InstagramIcon />
            </a>
            <a href={site.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="rounded-full border border-white/20 p-3 transition hover:border-white hover:text-white">
              <WhatsAppIcon className="h-5 w-5" />
            </a>
          </div>
        </div>
        <FooterColumn title={dict.footer.explore} links={explore} />
        <FooterColumn title={dict.footer.info} links={info} />
        <div>
          <h2 className="mb-4 text-xs font-medium tracking-[0.2em] text-sand uppercase">{dict.footer.contact}</h2>
          <address className="space-y-3 text-sm leading-6 not-italic">
            <p>
              {site.address.street}
              <br />
              {site.address.postalCode} {site.address.city}
            </p>
            <p>
              {site.phones.map((phone) => (
                <a key={phone.href} href={phone.href} className="block hover:text-white">
                  {phone.display}
                </a>
              ))}
              <span className="text-xs text-white/50">({dict.contact.phoneNote})</span>
            </p>
            <p>
              <a href={`mailto:${site.email}`} className="hover:text-white">
                {site.email}
              </a>
            </p>
          </address>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-white/50 sm:flex-row sm:justify-between">
          <p>
            © <CopyrightYear /> {site.legalName}. {dict.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h2 className="mb-4 text-xs font-medium tracking-[0.2em] text-sand uppercase">{title}</h2>
      <ul className="space-y-2 text-sm">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="hover:text-white">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

async function CopyrightYear() {
  "use cache";
  return new Date().getFullYear();
}
