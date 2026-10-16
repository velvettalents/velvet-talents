import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Locale } from "@/i18n/config";

export async function getLegalHtml(doc: "privacy" | "cookies", locale: Locale) {
  "use cache";
  return readFile(path.join(process.cwd(), "src/content/legal", `${doc}.${locale}.html`), "utf8");
}
