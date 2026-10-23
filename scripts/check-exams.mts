// Garde-fou : la plateforme ne doit citer aucun examen retiré (quiz, filières,
// textes d'interface). Registre : content/retired-exams.json, synchronisé
// depuis JIHA-Learn (source de vérité). Mention historique autorisée : « ex-CODE ».
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const REGISTRY = join(ROOT, "content/retired-exams.json");

if (!existsSync(REGISTRY)) {
  console.log("• content/retired-exams.json absent (pas encore publié par JIHA-Learn) : vérification ignorée");
  process.exit(0);
}

interface Exam {
  code: string;
  retired: string;
  replacement: string | null;
}
const { exams } = JSON.parse(readFileSync(REGISTRY, "utf8")) as { exams: Exam[] };

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(ts|tsx|json|md)$/.test(name)) out.push(p);
  }
  return out;
}

const files = ["lib", "app", "components"].flatMap((d) => walk(join(ROOT, d)));
let hits = 0;
for (const file of files) {
  readFileSync(file, "utf8")
    .split("\n")
    .forEach((line, i) => {
      for (const e of exams) {
        if (!new RegExp(`(?<!ex-)\\b${e.code}\\b`).test(line)) continue;
        hits++;
        const fix = e.replacement ? `remplacé par ${e.replacement}` : "sans remplaçant direct";
        console.error(`✗ ${relative(ROOT, file)}:${i + 1} ${e.code} retiré le ${e.retired} (${fix})`);
      }
    });
}
if (hits) process.exit(1);
console.log(`✓ aucun examen retiré cité (${exams.length} codes, ${files.length} fichiers)`);
