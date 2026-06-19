// Vérif rapide du parseur sur le contenu réel synchronisé (node --import tsx).
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseGuide } from "../lib/content/parser.ts";

for (const id of ["vaultwarden", "traefik"]) {
  const raw = readFileSync(join(process.cwd(), "content", `${id}.md`), "utf8");
  const guide = parseGuide(raw);
  const fm = guide.frontmatter;

  console.log(`\n=== ${id} ===`);
  console.log("front-matter:", {
    id: fm.id,
    order: fm.order,
    status: fm.status,
    level: fm.level,
    access: fm.access,
    duration_min: fm.duration_min,
    prerequisites: fm.prerequisites,
    next: fm.next,
    title_fr: fm.title_fr?.slice(0, 30) + "…",
  });

  for (const section of guide.sections) {
    const counts = countNodes(section.nodes);
    console.log(
      `  ## ${section.id} — prose(fr:${counts.fr}/en:${counts.en}) code:${counts.code} fig:${counts.fig}` +
        (section.steps.length ? ` steps:[${section.steps.map((s) => s.id).join(", ")}]` : ""),
    );
    // Vérif bilingue (CHECKLIST §E) : autant de prose FR que EN.
    for (const step of section.steps) {
      const c = countNodes(step.nodes);
      if (c.fr !== c.en)
        console.warn(`    ⚠ ${step.id} déséquilibre FR/EN : fr ${c.fr} / en ${c.en}`);
    }
    if (counts.fr !== counts.en)
      console.warn(`    ⚠ ${section.id} déséquilibre FR/EN : fr ${counts.fr} / en ${counts.en}`);
  }
}

function countNodes(nodes: { type: string; lang?: string }[]) {
  return {
    fr: nodes.filter((n) => n.type === "prose" && n.lang === "fr").length,
    en: nodes.filter((n) => n.type === "prose" && n.lang === "en").length,
    code: nodes.filter((n) => n.type === "code").length,
    fig: nodes.filter((n) => n.type === "figure").length,
  };
}
