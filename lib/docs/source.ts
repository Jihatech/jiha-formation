import "server-only";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { parseGuide } from "@/lib/content/parser";
import type { ParsedGuide } from "@/lib/content/types";
import { docsCategories } from "./categories";

// Les fiches (couche OUVERTE, SEO) vivent dans le repo plateforme :
// content-docs/<categorie>/<slug>.md — format docs/FICHE-TEMPLATE.md.
const DOCS_DIR = join(process.cwd(), "content-docs");

export interface DocMeta {
  id: string;
  slug: string;
  category: string;
  order: number;
  title_fr: string;
  title_en: string;
  description_fr: string;
  description_en: string;
  tags: string[];
  updated?: string;
  related_guide?: string;
}

export interface DocEntry {
  meta: DocMeta;
  doc: ParsedGuide;
}

function toMeta(fm: Record<string, unknown>): DocMeta {
  return {
    id: String(fm.id ?? ""),
    slug: String(fm.slug ?? fm.id ?? ""),
    category: String(fm.category ?? ""),
    order: Number(fm.order ?? 0),
    title_fr: String(fm.title_fr ?? ""),
    title_en: String(fm.title_en ?? ""),
    description_fr: String(fm.description_fr ?? ""),
    description_en: String(fm.description_en ?? ""),
    tags: Array.isArray(fm.tags) ? fm.tags.map(String) : [],
    updated: fm.updated ? String(fm.updated) : undefined,
    related_guide: fm.related_guide ? String(fm.related_guide) : undefined,
  };
}

/** Toutes les fiches, groupées et triées (catégorie.order puis fiche.order). */
export async function getAllDocs(): Promise<DocEntry[]> {
  let categories: string[] = [];
  try {
    categories = await readdir(DOCS_DIR);
  } catch {
    return [];
  }
  const entries: DocEntry[] = [];
  for (const cat of categories) {
    let files: string[] = [];
    try {
      files = await readdir(join(DOCS_DIR, cat));
    } catch {
      continue;
    }
    for (const f of files) {
      if (!f.endsWith(".md")) continue;
      const raw = await readFile(join(DOCS_DIR, cat, f), "utf8");
      const doc = parseGuide(raw);
      entries.push({ meta: toMeta(doc.frontmatter), doc });
    }
  }
  const catOrder = new Map(docsCategories.map((c) => [c.id, c.order]));
  entries.sort(
    (a, b) =>
      (catOrder.get(a.meta.category) ?? 99) -
        (catOrder.get(b.meta.category) ?? 99) ||
      a.meta.order - b.meta.order,
  );
  return entries;
}

export async function getDocsByCategory(
  category: string,
): Promise<DocEntry[]> {
  return (await getAllDocs()).filter((e) => e.meta.category === category);
}

export async function getDoc(
  category: string,
  slug: string,
): Promise<DocEntry | null> {
  try {
    const raw = await readFile(
      join(DOCS_DIR, category, `${slug}.md`),
      "utf8",
    );
    const doc = parseGuide(raw);
    return { meta: toMeta(doc.frontmatter), doc };
  } catch {
    return null;
  }
}

/** Titre de section localisé pour les fiches : `fr | en` → partie selon la langue. */
export function splitSectionTitle(
  raw: string,
  locale: "fr" | "en",
): string {
  const parts = raw.split("|").map((p) => p.trim());
  if (parts.length < 2) return raw;
  return locale === "fr" ? parts[0] : parts[1];
}
