// Valide les quiz : ids d'étapes alignés sur le contenu réel, structure saine.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { parseGuide } from "../lib/content/parser.ts";

const QUIZ_DIR = join(process.cwd(), "lib/quiz/data");
const CONTENT_DIR = join(process.cwd(), "content");
let fail = 0;

for (const f of readdirSync(QUIZ_DIR).filter((f) => f.endsWith(".json")).sort()) {
  const guideId = f.replace(/\.json$/, "");
  const quiz = JSON.parse(readFileSync(join(QUIZ_DIR, f), "utf8"));
  const raw = readFileSync(join(CONTENT_DIR, `${guideId}.md`), "utf8");
  const steps = parseGuide(raw).sections.flatMap((s) => s.steps.map((st) => st.id));

  const quizSteps = Object.keys(quiz);
  const missing = steps.filter((s) => !quizSteps.includes(s));
  const extra = quizSteps.filter((s) => !steps.includes(s));
  const issues: string[] = [];
  if (missing.length) issues.push(`étapes sans quiz : ${missing.join(",")}`);
  if (extra.length) issues.push(`quiz orphelins : ${extra.join(",")}`);

  interface Choice {
    fr?: string;
    en?: string;
  }
  interface Question {
    q_fr?: string;
    q_en?: string;
    choices: Choice[];
    answer: number;
  }
  let answers = "";
  for (const [step, questions] of Object.entries(quiz) as [
    string,
    Question[],
  ][]) {
    for (const q of questions) {
      if (!q.q_fr || !q.q_en) issues.push(`${step}: question non bilingue`);
      if (!Array.isArray(q.choices) || q.choices.length < 2)
        issues.push(`${step}: choix insuffisants`);
      if (q.choices.some((c) => !c.fr || !c.en))
        issues.push(`${step}: choix non bilingue`);
      if (typeof q.answer !== "number" || q.answer < 0 || q.answer >= q.choices.length)
        issues.push(`${step}: answer hors bornes`);
      answers += q.answer;
    }
  }

  const ok = issues.length === 0;
  if (!ok) fail++;
  console.log(
    `${ok ? "✓" : "✗"} ${guideId} — ${quizSteps.length}/${steps.length} steps, answers:[${answers}]${ok ? "" : " → " + issues.join(" ; ")}`,
  );
}
process.exit(fail ? 1 : 0);
