import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { locales } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { site } from "@/lib/site";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WhatsAppButton } from "@/components/whatsapp-button";
import "../globals.css";

const body = Inter({ subsets: ["latin"], variable: "--font-body" });
const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-display-serif",
});

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = await getDictionary();
  return {
    metadataBase: new URL(site.url),
    title: { default: dict.meta.title, template: `%s | ${site.name}` },
    description: dict.meta.description,
    openGraph: {
      type: "website",
      siteName: site.name,
      locale: locale === "pt" ? "pt_PT" : "en_GB",
      images: ["/brand/logo.png"],
    },
    // Not indexable until launch (see SITE_INDEXABLE in .env.example).
    robots: process.env.SITE_INDEXABLE === "true" ? undefined : { index: false, follow: false },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  const locale = await getLocale();
  const dict = await getDictionary();

  return (
    <html lang={locale === "pt" ? "pt-PT" : "en"} className={`${body.variable} ${display.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <a href="#content" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:bg-ink focus:px-4 focus:py-2 focus:text-white">
          {dict.nav.skipToContent}
        </a>
        <SiteHeader locale={locale} dict={dict} />
        <main id="content" className="flex-1">
          {children}
        </main>
        <SiteFooter locale={locale} dict={dict} />
        <WhatsAppButton />
      </body>
    </html>
  );
}
