# Velvet Talents

New website for [velvet-talents.com](https://velvet-talents.com), replacing the current WordPress/WooCommerce site. Bilingual (Portuguese and English) product catalogue with quote requests.

## Stack

- Next.js 16 (App Router, Cache Components, Partial Prefetching)
- Tailwind CSS v4 with shadcn/ui (Radix) components themed to the brand
- Notion as content source and request CRM, with `src/data/catalog.json` (imported from WordPress) as fallback

## Getting started

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000. You are redirected to `/pt` or `/en` based on the browser language.

## Structure

| Path | Purpose |
| --- | --- |
| `src/app/[lang]/` | All routes, prefixed with the locale (`pt`, `en`) |
| `src/i18n/dictionaries/*.json` | Interface and page copy per language |
| `src/content/legal/` | Privacy and cookie policies (HTML fragments per language) |
| `src/lib/catalog.ts` | Catalogue data layer: Notion when configured, otherwise the snapshot |
| `src/lib/notion/` | Notion REST client and database schema (property names) |
| `src/app/media/` | Serves Notion images and PDFs under stable, CDN-cached URLs |
| `src/app/api/notion-webhook/` | Refreshes the site when Notion content changes |
| `src/data/catalog.json` | Snapshot of the WordPress catalogue; also drives the legacy redirects |
| `src/components/ui/` | shadcn/ui components |
| `src/lib/site.ts` | Contact details, social links and PDF catalogues |
| `src/proxy.ts` | Locale detection |
| `next.config.ts` | 301 redirects from the old WordPress URLs |

## Notion

The site reads four Notion databases: Categorias, Produtos, Catálogos and Pedidos. Contact and quote forms create a row in Pedidos.

### Setup

1. Create an internal integration at https://www.notion.so/profile/integrations with read content, update content and insert content capabilities. Copy the token.
2. In Notion, create a page (for example "Velvet Talents - Site") and add the integration under ••• > Connections.
3. Create the databases and import the current catalogue (about 4 minutes, safe to re-run):

   ```bash
   NOTION_TOKEN=... NOTION_PARENT_PAGE=<page url> node scripts/notion-setup.mts
   ```

4. Add `NOTION_TOKEN` and the four printed `NOTION_*_DS` ids to `.env.local` and to the Vercel project, then redeploy.

### Instant updates (webhook)

Without a webhook, Notion edits appear within an hour. For near-instant updates:

1. In the integration settings, open Webhooks and create a subscription to `https://<site>/api/notion-webhook` for page and data source events.
2. Notion sends a verification token; it appears in the Vercel function logs as `Notion webhook verification token: ...`. Paste it into "Verify subscription" and save it as `NOTION_WEBHOOK_SECRET`.

### Files

Notion file URLs expire after an hour, so the site links to `/media/<kind>/<page id>/<version>`. That route fetches a fresh URL, re-encodes images to WebP and lets the CDN cache them. Catalogue PDFs redirect to the signed URL; large PDFs can also be added in Notion as external links.

## Re-importing from WordPress

```bash
node scripts/import-wordpress.mjs            # data + images
node scripts/import-wordpress.mjs --skip-images
```

The script reads the WooCommerce Store API, translates product names and descriptions to English with pattern rules, and saves images to `public/images/products/` as 1000px WebP. It lists any description without an English rule.

## Environment variables

See `.env.example`. Without `RESEND_API_KEY` the forms show a "preview version" notice instead of sending email. Until launch every deployment is served with `noindex` and a blocking `robots.txt`; set `SITE_INDEXABLE=true` on the live domain to allow indexing.
