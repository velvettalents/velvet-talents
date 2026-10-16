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
      ...catalog.products.map((p) => ({
        source: `/produto/${p.slug}{/}?`,
        destination: `/pt/products/${p.category}/${p.slug}`,
        permanent: true,
      })),
    ];
  },
};

export default nextConfig;
