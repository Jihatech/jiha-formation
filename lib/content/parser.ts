import { isLocale } from "@/lib/i18n/config";
import type {
  GuideFrontmatter,
  GuideNode,
  GuideSection,
  GuideStep,
  ParsedGuide,
} from "./types";

const FENCE = /^```(\S*)\s*$/;

/**
 * Parseur de fichier-guide, conforme à GUIDE-TEMPLATE.md.
 * Ne devine pas la grammaire : front-matter YAML (champs _fr/_en),
 * blocs `:::lang fr` / `:::lang en`, code partagé non dupliqué, `:::figure <nom>`.
 */
export function parseGuide(raw: string): ParsedGuide {
  const { frontmatter, body } = splitFrontmatter(raw);
  const sections = parseBody(body);
  return { frontmatter, sections };
}

// ── Front-matter ────────────────────────────────────────────────────────────

function splitFrontmatter(raw: string): {
  frontmatter: GuideFrontmatter;
  body: string;
} {
  const text = raw.replace(/^﻿/, "");
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    throw new Error("Front-matter YAML manquant (--- ... ---).");
  }
  return {
    frontmatter: parseFrontmatter(match[1]),
    body: match[2],
  };
}

function parseFrontmatter(yaml: string): GuideFrontmatter {
  const out: Record<string, unknown> = {};
  for (const rawLine of yaml.split(/\r?\n/)) {
    const line = rawLine.trimEnd();
    // Lignes vides et commentaires (# …) ignorés.
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const rawValue = stripInlineComment(line.slice(idx + 1).trim());
    out[key] = coerce(rawValue);
  }
  return out as GuideFrontmatter;
}

// Retire un commentaire de fin de ligne ` # …`, sans casser les valeurs entre guillemets.
function stripInlineComment(value: string): string {
  if (value.startsWith('"') || value.startsWith("'") || value.startsWith("["))
    return value;
  const hash = value.indexOf(" #");
  return hash === -1 ? value : value.slice(0, hash).trim();
}

function coerce(value: string): unknown {
  if (value === "") return "";
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  if (value.startsWith("[") && value.endsWith("]")) {
    const inner = value.slice(1, -1).trim();
    if (!inner) return [];
    return inner.split(",").map((item) => coerce(item.trim()));
  }
  if (value === "true") return true;
  if (value === "false") return false;
  if (/^-?\d+$/.test(value)) return Number.parseInt(value, 10);
  return value;
}

// ── Corps ─────────────────────────────────────────────────────────────────

function parseBody(body: string): GuideSection[] {
  const lines = body.split(/\r?\n/);
  const sections: GuideSection[] = [];
  let section: GuideSection | null = null;
  let step: GuideStep | null = null;

  // Cible courante où pousser un node : l'étape ouverte, sinon les nodes de section.
  const pushNode = (node: GuideNode) => {
    if (!section) {
      section = { id: "_preamble", nodes: [], steps: [] };
      sections.push(section);
    }
    (step ? step.nodes : section.nodes).push(node);
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Section : ## name
    const sectionMatch = trimmed.match(/^##\s+(.+)$/);
    if (sectionMatch) {
      section = { id: slugifyHeading(sectionMatch[1]), nodes: [], steps: [] };
      sections.push(section);
      step = null;
      i++;
      continue;
    }

    // Étape : ### step-xx (ou tout autre ### → sous-section traitée comme étape)
    const stepMatch = trimmed.match(/^###\s+(.+)$/);
    if (stepMatch) {
      if (!section) {
        section = { id: "_preamble", nodes: [], steps: [] };
        sections.push(section);
      }
      step = { id: slugifyHeading(stepMatch[1]), nodes: [] };
      section.steps.push(step);
      i++;
      continue;
    }

    // Bloc langue : :::lang fr / :::lang en
    const langMatch = trimmed.match(/^:::lang\s+(\w+)\s*$/);
    if (langMatch && isLocale(langMatch[1])) {
      const { markdown, next } = collectUntilCloser(lines, i + 1);
      pushNode({ type: "prose", lang: langMatch[1], markdown });
      i = next;
      continue;
    }

    // Figure : :::figure <nom> + caption_fr / caption_en jusqu'à :::
    const figMatch = trimmed.match(/^:::figure\s+(\S+)\s*$/);
    if (figMatch) {
      const { captionFr, captionEn, next } = collectFigure(lines, i + 1);
      pushNode({
        type: "figure",
        name: figMatch[1],
        caption_fr: captionFr,
        caption_en: captionEn,
      });
      i = next;
      continue;
    }

    // Bloc de code PARTAGÉ au niveau supérieur (hors :::lang).
    const fence = trimmed.match(FENCE);
    if (fence) {
      const { content, next } = collectCode(lines, i + 1);
      pushNode({ type: "code", lang: fence[1] || null, content });
      i = next;
      continue;
    }

    // Lignes vides / autres : ignorées au niveau supérieur (la prose vit dans :::lang).
    i++;
  }

  return sections.filter((s) => s.id !== "_preamble" || hasContent(s));
}

// Collecte le contenu d'un bloc :::lang jusqu'au :::, en respectant les fences ``` internes.
function collectUntilCloser(
  lines: string[],
  start: number,
): { markdown: string; next: number } {
  const buf: string[] = [];
  let inFence = false;
  let i = start;
  for (; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (FENCE.test(trimmed)) inFence = !inFence;
    else if (!inFence && trimmed === ":::") {
      i++;
      break;
    }
    buf.push(lines[i]);
  }
  return { markdown: buf.join("\n").trim(), next: i };
}

function collectFigure(
  lines: string[],
  start: number,
): { captionFr: string; captionEn: string; next: number } {
  let captionFr = "";
  let captionEn = "";
  let i = start;
  for (; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed === ":::") {
      i++;
      break;
    }
    const fr = trimmed.match(/^caption_fr:\s*(.+)$/);
    const en = trimmed.match(/^caption_en:\s*(.+)$/);
    if (fr) captionFr = unquote(fr[1]);
    else if (en) captionEn = unquote(en[1]);
  }
  return { captionFr, captionEn, next: i };
}

function collectCode(
  lines: string[],
  start: number,
): { content: string; next: number } {
  const buf: string[] = [];
  let i = start;
  for (; i < lines.length; i++) {
    if (FENCE.test(lines[i].trim())) {
      i++;
      break;
    }
    buf.push(lines[i]);
  }
  // Verbatim : pas de trim sur le contenu (on préserve l'indentation et les $/$$).
  return { content: buf.join("\n"), next: i };
}

function unquote(value: string): string {
  const v = value.trim();
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    return v.slice(1, -1);
  }
  return v;
}

// Ancres stables, identiques FR/EN, sans accent, kebab-case (BUILD-SPEC §6.2).
function slugifyHeading(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function hasContent(section: GuideSection): boolean {
  return section.nodes.length > 0 || section.steps.length > 0;
}
