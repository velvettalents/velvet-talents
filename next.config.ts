import type { NextConfig } from "next";
import catalog from "./src/data/catalog.json";

// Old WordPress URLs (Portuguese only) mapped to the new routes, so links and
// search results keep working after the switch.
const legacyPages: Record<string, string> = {
  "/loja": "/pt/products",
  "/sobre_nos": "/pt/about",
  "/revestimentos": "/pt/coverings",
  "/catalogos": "/pt/catalogs",
  "/contactos": "/pt/contact",
  "/como-pedir-orcamento": "/pt/how-to-order",
  "/politica-privacidade": "/pt/privacy",
  "/politica-de-cookies": "/pt/cookies",
};

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Images are already small WebP/JPEG files (Notion uploads and /public), and
  // the Vercel Hobby image optimization quota runs out and answers 402, which
  // breaks every image. Serve them as they are instead.
  images: {
    unoptimized: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async redirects() {
    return [
      ...Object.entries(legacyPages).map(([source, destination]) => ({
        source: `${source}{/}?`,
        destination,
        permanent: true,
      })),
      {
        source: "/categoria-produto/:category{/}?",
        destination: "/pt/products/:category",
        permanent: true,
      },
      // Catalogue PDFs and other uploads now live in Notion; old links shared
      // by email or indexed by search engines land on the catalogues page.
      {
        source: "/wp-content/uploads/:path*",
        destination: "/pt/catalogs",
        permanent: true,
      },
      ...catalog.products.map((p) => ({
        source: `/produto/${p.slug}{/}?`,
        destination: `/pt/products/${p.category}/${p.slug}`,
        permanent: true,
      })),
    ];
  },
};

export default nextConfig;
