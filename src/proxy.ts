import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, hasLocale, locales, type Locale } from "@/i18n/config";
import { getCategory, getProduct } from "@/lib/catalog";

function preferredLocale(request: NextRequest): Locale {
  const header = request.headers.get("accept-language") ?? "";
  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { lang: tag.slice(0, 2).toLowerCase(), q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  return ranked.find((entry) => hasLocale(entry.lang))?.lang as Locale | undefined ?? defaultLocale;
}

// Unknown catalogue paths would otherwise stream a not-found page with a 200
// status (the static shell is sent before the page can call notFound()).
function isUnknownCatalogPath(pathname: string) {
  const match = pathname.match(/^\/[a-z]{2}\/products\/([^/]+)(?:\/([^/]+))?\/?$/);
  if (!match) return false;
  const [, category, slug] = match;
  return slug ? !getProduct(category, slug) : !getCategory(category);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const prefix = locales.find((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (prefix) {
    if (isUnknownCatalogPath(pathname)) {
      return NextResponse.rewrite(new URL(`/${prefix}/404`, request.url), { status: 404 });
    }
    return;
  }

  request.nextUrl.pathname = `/${preferredLocale(request)}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: ["/((?!_next|api|images|brand|icon|favicon|robots.txt|sitemap.xml|.*\\..*).*)"],
};
