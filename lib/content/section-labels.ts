import type { Locale } from "@/lib/i18n/config";

// Libellés bilingues des sections canoniques (BUILD-SPEC §3.1 / GUIDE-TEMPLATE §3).
// Les ids viennent du parseur (slug du heading `## ...`).
const SECTION_LABELS: Record<string, { fr: string; en: string }> = {
  intro: { fr: "Introduction", en: "Introduction" },
  objectives: { fr: "Ce que tu vas apprendre", en: "What you'll learn" },
  prerequisites: { fr: "Prérequis", en: "Prerequisites" },
  concepts: { fr: "Concepts", en: "Concepts" },
  walkthrough: { fr: "Pas-à-pas", en: "Walkthrough" },
  pitfalls: { fr: "Pièges connus", en: "Known pitfalls" },
  success: { fr: "Tu sais que c'est bon quand…", en: "You're done when…" },
  next: { fr: "Et après ?", en: "What's next?" },
  cheatsheet: { fr: "Aide-mémoire", en: "Cheatsheet" },
  resources: { fr: "Ressources", en: "Resources" },
  troubleshooting: { fr: "Dépannage", en: "Troubleshooting" },
};

export function sectionLabel(id: string, locale: Locale): string {
  return SECTION_LABELS[id]?.[locale] ?? id;
}

// Libellé du titre d'un bloc de code, repris de build.mjs (titleMap).
const CODE_TITLE: Record<string, string> = {
  bash: "shell",
  sh: "shell",
  shell: "shell",
  yaml: "docker-compose.yml",
  yml: "docker-compose.yml",
  env: ".env",
  dockerfile: "Dockerfile",
  json: "JSON",
  text: "text",
};

export function codeTitle(lang: string | null): string {
  if (!lang) return "shell";
  return CODE_TITLE[lang.toLowerCase()] ?? lang;
}
