import { createHmac, timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { CATALOG_TAG } from "@/lib/catalog";

// Notion webhook: any change in the connected databases refreshes the site.
// Setup: the first request carries a `verification_token`; it is logged here
// so it can be pasted into Notion ("Verify subscription") and stored as
// NOTION_WEBHOOK_SECRET. Later requests are signed with that token.

function validSignature(body: string, header: string | null, secret: string) {
  if (!header) return false;
  const expected = `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`;
  const a = Buffer.from(expected);
  const b = Buffer.from(header);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  const body = await request.text();
  let payload: { verification_token?: string; type?: string };
  try {
    payload = JSON.parse(body);
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  if (payload.verification_token) {
    console.log(`Notion webhook verification token: ${payload.verification_token}`);
    return Response.json({ ok: true });
  }

  const secret = process.env.NOTION_WEBHOOK_SECRET;
  if (!secret || !validSignature(body, request.headers.get("x-notion-signature"), secret)) {
    return new Response("Invalid signature", { status: 401 });
  }

  // Expire immediately so the owner sees the edit on the next page load.
  revalidateTag(CATALOG_TAG, { expire: 0 });
  return Response.json({ revalidated: true, event: payload.type ?? null });
}
