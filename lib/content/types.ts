import type { Locale } from "@/lib/i18n/config";

// Métadonnées d'un guide (front-matter GUIDE-TEMPLATE §1). Champs _fr/_en dupliqués
// pour l'affichage ; champs techniques neutres en langue.
export interface GuideFrontmatter {
  id: string;
  slug: string;
  order: number;
  status: "published" | "coming-soon";
  title_fr: string;
  title_en: string;
  tagline_fr: string;
  tagline_en: string;
  level: "beginner" | "intermediate" | "advanced";
  duration_min: number;
  repo?: string;
  validated_version?: string;
  last_review?: string;
  prerequisites: string[];
  next: string[];
  concepts_fr: string[];
  concepts_en: string[];
  access: "free" | "premium";
  og_description_fr?: string;
  og_description_en?: string;
  [key: string]: unknown;
}

// Bloc de prose bilingue : un par langue (:::lang fr / :::lang en). Contenu = markdown
// (peut inclure du code embarqué propre à cette langue).
export interface ProseNode {
  type: "prose";
  lang: Locale;
  markdown: string;
}

// Bloc de code PARTAGÉ entre les langues (écrit une seule fois, non traduit — §2).
// Rendu verbatim : on ne touche jamais au contenu (CHECKLIST §B : $/$$, guillemets).
export interface CodeNode {
  type: "code";
  lang: string | null;
  content: string;
}

// Schéma : référence par nom (:::figure <nom>) + légendes bilingues.
export interface FigureNode {
  type: "figure";
  name: string;
  caption_fr: string;
  caption_en: string;
}

export type GuideNode = ProseNode | CodeNode | FigureNode;

// Étape du walkthrough (### step-xx) — granularité de progression (PLATFORM-SPEC §3.2).
export interface GuideStep {
  id: string;
  nodes: GuideNode[];
}

export interface GuideSection {
  id: string;
  /** Titre brut du heading `## …` (les fiches utilisent `fr | en` ; les guides, des ids canoniques). */
  title: string;
  /** Nodes avant le premier `### step` (ou tous les nodes pour les sections sans étapes). */
  nodes: GuideNode[];
  steps: GuideStep[];
}

export interface ParsedGuide {
  frontmatter: GuideFrontmatter;
  sections: GuideSection[];
}
