import type { Metadata } from "next";
import { getDictionary } from "@/i18n/dictionaries";
import { LegalPage } from "@/components/legal-page";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.legal.cookiesTitle };
}

export default function Page() {
  return <LegalPage doc="cookies" />;
}
