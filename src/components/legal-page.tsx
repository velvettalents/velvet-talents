import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { getLegalHtml } from "@/lib/legal";
import { paths } from "@/lib/paths";
import { PageHeader } from "./page-header";

export async function LegalPage({ doc }: { doc: "privacy" | "cookies" }) {
  const locale = await getLocale();
  const dict = await getDictionary();
  const html = await getLegalHtml(doc, locale);
  const title = doc === "privacy" ? dict.legal.privacyTitle : dict.legal.cookiesTitle;

  return (
    <>
      <PageHeader title={title} crumbs={[{ href: paths.home(locale), label: dict.nav.home }]} />
      {/* Trusted, repository-authored HTML from src/content/legal. */}
      <div className="container-page py-14">
        <article className="prose-legal" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </>
  );
}
