import "server-only";

// Minimal Notion REST client. API version 2026-03-11 (databases expose
// data sources; trashed pages use `in_trash`).
const NOTION_VERSION = "2026-03-11";
const API = "https://api.notion.com/v1";

export class NotionError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export function notionToken() {
  return process.env.NOTION_TOKEN;
}

export async function notion<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const token = notionToken();
  if (!token) throw new NotionError(500, "NOTION_TOKEN is not set");

  for (let attempt = 0; ; attempt++) {
    const res = await fetch(`${API}${path}`, {
      method: init.method ?? "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Notion-Version": NOTION_VERSION,
        ...(init.body ? { "Content-Type": "application/json" } : {}),
      },
      body: init.body ? JSON.stringify(init.body) : undefined,
      cache: "no-store",
    });
    if (res.status === 429 && attempt < 3) {
      const wait = Number(res.headers.get("retry-after") ?? 1) * 1000;
      await new Promise((r) => setTimeout(r, wait));
      continue;
    }
    if (!res.ok) throw new NotionError(res.status, `${init.method ?? "GET"} ${path}: ${res.status} ${await res.text()}`);
    return res.json() as Promise<T>;
  }
}

export type NotionPage = {
  id: string;
  in_trash?: boolean;
  last_edited_time: string;
  properties: Record<string, NotionProperty>;
};

type RichText = { plain_text: string }[];
type NotionFile = { name: string; type: "file"; file: { url: string } } | { name: string; type: "external"; external: { url: string } };

export type NotionProperty =
  | { type: "title"; title: RichText }
  | { type: "rich_text"; rich_text: RichText }
  | { type: "number"; number: number | null }
  | { type: "checkbox"; checkbox: boolean }
  | { type: "select"; select: { name: string } | null }
  | { type: "files"; files: NotionFile[] }
  | { type: "relation"; relation: { id: string }[] }
  | { type: string; [key: string]: unknown };

export async function queryAll(dataSourceId: string, body: Record<string, unknown> = {}) {
  const pages: NotionPage[] = [];
  let cursor: string | undefined;
  do {
    const res = await notion<{ results: NotionPage[]; has_more: boolean; next_cursor: string | null }>(
      `/data_sources/${dataSourceId}/query`,
      { method: "POST", body: { ...body, page_size: 100, ...(cursor ? { start_cursor: cursor } : {}) } },
    );
    pages.push(...res.results);
    cursor = res.has_more && res.next_cursor ? res.next_cursor : undefined;
  } while (cursor);
  return pages;
}

// Property readers -------------------------------------------------------

export function text(page: NotionPage, name: string): string {
  const prop = page.properties[name];
  if (!prop) return "";
  if (prop.type === "title") return (prop.title as RichText).map((t) => t.plain_text).join("").trim();
  if (prop.type === "rich_text") return (prop.rich_text as RichText).map((t) => t.plain_text).join("").trim();
  return "";
}

export function num(page: NotionPage, name: string): number | null {
  const prop = page.properties[name];
  return prop?.type === "number" ? (prop.number as number | null) : null;
}

export function checkbox(page: NotionPage, name: string): boolean {
  const prop = page.properties[name];
  return prop?.type === "checkbox" ? Boolean(prop.checkbox) : false;
}

export function select(page: NotionPage, name: string): string | null {
  const prop = page.properties[name];
  return prop?.type === "select" ? ((prop.select as { name: string } | null)?.name ?? null) : null;
}

export function relationIds(page: NotionPage, name: string): string[] {
  const prop = page.properties[name];
  return prop?.type === "relation" ? (prop.relation as { id: string }[]).map((r) => r.id) : [];
}

export function firstFileUrl(page: NotionPage, name: string): string | null {
  const prop = page.properties[name];
  if (prop?.type !== "files") return null;
  const file = (prop.files as NotionFile[])[0];
  if (!file) return null;
  return file.type === "file" ? file.file.url : file.external.url;
}
