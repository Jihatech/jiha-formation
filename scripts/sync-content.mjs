#!/usr/bin/env node
/*
 * Sync du contenu depuis JIHA-Learn (source de vérité, PLATFORM-SPEC §2).
 * Vendorise guides.json + content/<id>.md des guides `published` dans ./content.
 * Idempotent : à relancer au build (et via webhook GitHub en phase 2).
 *
 * Le dossier ./content est GÉNÉRÉ — ne pas l'éditer à la main (BUILD-SPEC §6.3).
 *
 * Usage : node scripts/sync-content.mjs
 * Variables d'env optionnelles :
 *   JIHA_LEARN_RAW_BASE  (défaut : https://raw.githubusercontent.com/Jihatech/JIHA-Learn/main)
 */

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const RAW_BASE =
  process.env.JIHA_LEARN_RAW_BASE ??
  "https://raw.githubusercontent.com/Jihatech/JIHA-Learn/main";

const OUT_DIR = join(process.cwd(), "content");
const FIG_DIR = join(OUT_DIR, "figures");

async function fetchText(path) {
  const url = `${RAW_BASE}/${path}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`GET ${url} → ${res.status} ${res.statusText}`);
  }
  return res.text();
}

async function fetchTextOptional(path) {
  try {
    return await fetchText(path);
  } catch {
    return null;
  }
}

/** Noms de figures référencés via `:::figure <nom>` dans un corps de guide. */
function figureNames(markdown) {
  const names = new Set();
  const re = /^:::figure\s+(\S+)\s*$/gm;
  let m;
  while ((m = re.exec(markdown)) !== null) names.add(m[1]);
  return [...names];
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  await mkdir(FIG_DIR, { recursive: true });

  console.log(`→ Sync depuis ${RAW_BASE}`);

  const manifestRaw = await fetchText("guides.json");
  await writeFile(join(OUT_DIR, "guides.json"), manifestRaw, "utf8");
  const manifest = JSON.parse(manifestRaw);
  console.log(`✓ guides.json (${manifest.guides.length} guides)`);

  const published = manifest.guides.filter((g) => g.status === "published");
  const wantedFigures = new Set();

  for (const guide of published) {
    const md = await fetchText(`content/${guide.id}.md`);
    await writeFile(join(OUT_DIR, `${guide.id}.md`), md, "utf8");
    figureNames(md).forEach((n) => wantedFigures.add(n));
    console.log(`✓ content/${guide.id}.md`);
  }

  // Figures : SVG standalone promus dans JIHA-Learn (décision validée).
  // Chemin attendu : assets/figures/<nom>.svg. Tant qu'ils n'existent pas, on avertit.
  let missing = [];
  for (const name of wantedFigures) {
    const svg =
      (await fetchTextOptional(`assets/figures/${name}.svg`)) ??
      (await fetchTextOptional(`content/figures/${name}.svg`));
    if (svg) {
      await writeFile(join(FIG_DIR, `${name}.svg`), svg, "utf8");
      console.log(`✓ figures/${name}.svg`);
    } else {
      missing.push(name);
    }
  }

  if (missing.length) {
    console.warn(
      `⚠ Figures introuvables dans JIHA-Learn (à promouvoir depuis build.mjs SCHEMAS) : ${missing.join(", ")}`,
    );
  }

  console.log("✓ Sync terminé.");
}

main().catch((err) => {
  console.error("✗ Sync échoué :", err.message);
  process.exit(1);
});
