import "server-only";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { parseGuide } from "./parser";
import { TRACK_BY_ID, TRACK_ORDER, type TrackMeta } from "./tracks";
import type { GuideFrontmatter, ParsedGuide } from "./types";

const CONTENT_DIR = join(process.cwd(), "content");
const FIGURES_DIR = join(CONTENT_DIR, "figures");

// Entrée du manifeste guides.json — source de vérité de la STRUCTURE (PLATFORM-SPEC §2).
// La plateforme ne duplique JAMAIS cette structure en base.
export interface ManifestGuide {
  id: string;
  slug: string;
  order: number;
  status: "published" | "coming-soon";
  level: "beginner" | "intermediate" | "advanced";
  duration_min: number;
  access: "free" | "premium";
  track?: string;
  title_fr: string;
  title_en: string;
  tagline_fr: string;
  tagline_en: string;
  repo?: string;
  prerequisites?: string[];
  next?: string[];
  [key: string]: unknown;
}

interface Manifest {
  version: number;
  generated_at: string;
  guides: ManifestGuide[];
}

let manifestCache: Manifest | null = null;

export async function getManifest(): Promise<Manifest> {
  if (manifestCache) return manifestCache;
  const raw = await readFile(join(CONTENT_DIR, "guides.json"), "utf8");
  const parsed = JSON.parse(raw) as Manifest;
  parsed.guides.sort((a, b) => a.order - b.order);
  manifestCache = parsed;
  return parsed;
}

export async function getGuidesInOrder(): Promise<ManifestGuide[]> {
  return (await getManifest()).guides;
}

// Guides regroupés par filière (voir lib/content/tracks.ts).
// Les filières suivent l'ordre du registre ; à l'intérieur, l'ordre du manifeste.
// Une filière inconnue du registre (guide sans `track` ou track non déclaré) est
// rangée en dernier sous un libellé neutre — le parcours reste exhaustif.
export interface TrackGroup {
  track: TrackMeta;
  guides: ManifestGuide[];
}

export async function getGuidesByTrack(): Promise<TrackGroup[]> {
  const guides = await getGuidesInOrder(); // déjà triés par `order`
  const groups = new Map<string, ManifestGuide[]>();
  for (const g of guides) {
    const id = typeof g.track === "string" && g.track ? g.track : "autres";
    const bucket = groups.get(id) ?? [];
    if (!groups.has(id)) groups.set(id, bucket);
    bucket.push(g);
  }
  return [...groups.entries()]
    .map(([id, gs]) => ({
      track:
        TRACK_BY_ID[id] ??
        ({ id, label_fr: "Autres", label_en: "Other" } as TrackMeta),
      guides: gs,
    }))
    .sort(
      (a, b) =>
        (TRACK_ORDER[a.track.id] ?? Number.MAX_SAFE_INTEGER) -
        (TRACK_ORDER[b.track.id] ?? Number.MAX_SAFE_INTEGER),
    );
}

export async function getManifestGuide(
  id: string,
): Promise<ManifestGuide | undefined> {
  return (await getManifest()).guides.find((g) => g.id === id || g.slug === id);
}

// Guide « public » (1er gratuit) : le guide publié au plus petit `order`.
// Décision produit : parcours gated, mais 1er guide ouvert (SEO + acquisition).
export async function getPublicGuide(): Promise<ManifestGuide | null> {
  const published = (await getManifest()).guides.filter(
    (g) => g.status === "published",
  );
  if (!published.length) return null;
  return published.reduce((a, b) => (a.order <= b.order ? a : b));
}

/** Liste des slugs de guides dont le fichier content/<id>.md existe (pour generateStaticParams). */
export async function getRenderableSlugs(): Promise<string[]> {
  let files: string[] = [];
  try {
    files = await readdir(CONTENT_DIR);
  } catch {
    return [];
  }
  return files
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}

export async function loadGuide(id: string): Promise<ParsedGuide | null> {
  try {
    const raw = await readFile(join(CONTENT_DIR, `${id}.md`), "utf8");
    return parseGuide(raw);
  } catch {
    return null;
  }
}

/** SVG inline d'une figure, ou null si non disponible (figures à promouvoir dans JIHA-Learn). */
export async function loadFigureSvg(name: string): Promise<string | null> {
  try {
    return await readFile(join(FIGURES_DIR, `${name}.svg`), "utf8");
  } catch {
    return null;
  }
}

export type { GuideFrontmatter };
