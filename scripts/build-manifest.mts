// Génère le guides.json de livraison pour JIHA-Learn à partir des front-matters
// des guides convertis (/tmp/jiha-learn-delivery/content) + des entrées live
// existantes (traefik, vaultwarden). Manifeste == contenu, par construction.
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { parseGuide } from "../lib/content/parser.ts";

const DELIVERY = "/tmp/jiha-learn-delivery";
const LIVE = JSON.parse(
  readFileSync(join(process.cwd(), "content", "guides.json"), "utf8"),
);

const converted = new Map<string, Record<string, unknown>>();
for (const f of readdirSync(join(DELIVERY, "content"))) {
  if (!f.endsWith(".md")) continue;
  const raw = readFileSync(join(DELIVERY, "content", f), "utf8");
  const { frontmatter: fm } = parseGuide(raw);
  const entry: Record<string, unknown> = {
    id: fm.id,
    slug: fm.slug,
    order: fm.order,
    status: fm.status,
    level: fm.level,
    duration_min: fm.duration_min,
    access: fm.access,
    title_fr: fm.title_fr,
    title_en: fm.title_en,
    tagline_fr: fm.tagline_fr,
    tagline_en: fm.tagline_en,
  };
  if (fm.repo) entry.repo = fm.repo;
  if (fm.validated_version) entry.validated_version = fm.validated_version;
  if (fm.last_review) entry.last_review = fm.last_review;
  entry.prerequisites = fm.prerequisites ?? [];
  entry.next = fm.next ?? [];
  entry.concepts_fr = fm.concepts_fr ?? [];
  entry.concepts_en = fm.concepts_en ?? [];
  if (fm.og_description_fr) entry.og_description_fr = fm.og_description_fr;
  if (fm.og_description_en) entry.og_description_en = fm.og_description_en;
  converted.set(fm.id, entry);
}

// Fusion : entrées converties prioritaires, sinon entrée live (traefik/vaultwarden).
const merged = LIVE.guides.map(
  (g: { id: string }) => converted.get(g.id) ?? g,
);

// Cohérence parcours (CHECKLIST A) : prérequis existants et d'order inférieur.
const byId = new Map(merged.map((g: { id: string }) => [g.id, g]));
for (const g of merged) {
  for (const p of g.prerequisites ?? []) {
    const pre = byId.get(p) as { order: number } | undefined;
    if (!pre) throw new Error(`${g.id}: prérequis inconnu ${p}`);
    if (pre.order >= g.order)
      throw new Error(`${g.id}: prérequis ${p} d'order supérieur`);
  }
  for (const n of g.next ?? []) {
    if (!byId.has(n)) throw new Error(`${g.id}: next inconnu ${n}`);
  }
}

const manifest = { version: 1, generated_at: "2026-06-19", guides: merged };
writeFileSync(
  join(DELIVERY, "guides.json"),
  JSON.stringify(manifest, null, 2) + "\n",
  "utf8",
);
console.log(
  "✓ guides.json généré :",
  merged
    .map((g: { id: string; status: string }) => `${g.id}(${g.status})`)
    .join(", "),
);
