// Bilingue FR/EN systématique (BUILD-SPEC §1, PLATFORM-SPEC §3.6).
// URLs distinctes par langue : /<lang>/... — meilleur SEO, hreflang/canonical (BUILD-SPEC §6.2).

export const locales = ["fr", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "fr";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** The "other" language, used by the FR/EN toggle to point at the equivalent URL. */
export function otherLocale(locale: Locale): Locale {
  return locale === "fr" ? "en" : "fr";
}
