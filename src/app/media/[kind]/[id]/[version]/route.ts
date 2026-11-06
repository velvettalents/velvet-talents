import sharp from "sharp";
import { firstFileUrl, notion, NotionError, type NotionPage } from "@/lib/notion/client";
import { MEDIA_PROPERTY, type MediaKind } from "@/lib/notion/schema";

// Serves files stored in Notion under stable URLs. Notion's own file URLs are
// signed and expire after an hour, so this route looks up a fresh one.
// Images are re-encoded (max 1600px WebP) and cached by the CDN for a year;
// the [version] segment changes whenever the file changes. PDFs redirect to
// the signed URL with a short CDN cache, because they can be tens of MB.

const PDF_REDIRECT_CACHE = "public, max-age=0, s-maxage=1800";
const IMAGE_CACHE = "public, max-age=31536000, immutable";
const ID_PATTERN = /^[0-9a-f-]{32,36}$/i;

export async function GET(_request: Request, ctx: RouteContext<"/media/[kind]/[id]/[version]">) {
  const { kind, id } = await ctx.params;
  if (!(kind in MEDIA_PROPERTY) || !ID_PATTERN.test(id)) {
    return new Response("Not found", { status: 404 });
  }

  let fileUrl: string | null;
  try {
    const page = await notion<NotionPage>(`/pages/${id}`);
    if (page.in_trash) return new Response("Not found", { status: 404 });
    fileUrl = firstFileUrl(page, MEDIA_PROPERTY[kind as MediaKind]);
  } catch (error) {
    const status = error instanceof NotionError && (error.status === 404 || error.status === 400) ? 404 : 502;
    return new Response(status === 404 ? "Not found" : "Upstream error", { status });
  }
  if (!fileUrl) return new Response("Not found", { status: 404 });

  if (kind === "catalogue-pdf") {
    return new Response(null, { status: 302, headers: { Location: fileUrl, "Cache-Control": PDF_REDIRECT_CACHE } });
  }

  const upstream = await fetch(fileUrl);
  if (!upstream.ok) return new Response("Upstream error", { status: 502 });

  const image = await sharp(Buffer.from(await upstream.arrayBuffer()))
    .rotate()
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();

  return new Response(new Uint8Array(image), {
    headers: { "Content-Type": "image/webp", "Cache-Control": IMAGE_CACHE },
  });
}
