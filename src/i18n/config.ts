export const locales = ["pt", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "pt";

export const localeLabels: Record<Locale, string> = {
  pt: "Português",
  en: "English",
};

export const hasLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value);
