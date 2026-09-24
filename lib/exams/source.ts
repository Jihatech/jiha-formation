import "server-only";
import { getManifest } from "@/lib/content/source";
import { getGuideQuiz } from "@/lib/quiz";
import { TRACKS, TRACK_BY_ID, TRACK_ORDER } from "@/lib/content/tracks";
import { deriveExamParams } from "./config";
import type { AssembledExam, ExamQuestion, ExamSummary } from "./types";

export type { AssembledExam, ExamQuestion, ExamSummary } from "./types";

// Fisher–Yates (copie, non destructif).
function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Mélange les choix d'une question en réindexant la bonne réponse : chaque
// tentative présente les propositions dans un ordre différent (anti-mémorisation).
function shuffleChoices(q: ExamQuestion): ExamQuestion {
  const order = shuffle(q.choices.map((_, i) => i));
  return {
    ...q,
    choices: order.map((i) => q.choices[i]),
    answer: order.indexOf(q.answer),
  };
}

// Toutes les questions d'une filière, dans l'ordre pédagogique des guides.
// Seuls les guides PUBLIÉS alimentent un examen (on ne teste pas du contenu à venir).
async function poolForTrack(trackId: string): Promise<ExamQuestion[]> {
  const guides = (await getManifest()).guides.filter(
    (g) => g.status === "published" && (g.track ?? "autres") === trackId,
  );
  const out: ExamQuestion[] = [];
  for (const g of guides) {
    const quiz = getGuideQuiz(g.id);
    if (!quiz) continue;
    for (const questions of Object.values(quiz)) {
      for (const q of questions) {
        out.push({
          ...q,
          guideId: g.id,
          guideSlug: g.slug,
          guideTitleFr: g.title_fr,
          guideTitleEn: g.title_en,
        });
      }
    }
  }
  return out;
}

/** Liste des examens disponibles (une filière = un examen), ordre du parcours. */
export async function listExams(): Promise<ExamSummary[]> {
  const guides = (await getManifest()).guides;
  const summaries: ExamSummary[] = [];
  for (const track of TRACKS) {
    const pool = await poolForTrack(track.id);
    if (pool.length === 0) continue;
    const guideCount = guides.filter(
      (g) => g.status === "published" && (g.track ?? "autres") === track.id,
    ).length;
    summaries.push({
      track,
      poolSize: pool.length,
      guideCount,
      params: deriveExamParams(pool.length),
    });
  }
  return summaries.sort(
    (a, b) =>
      (TRACK_ORDER[a.track.id] ?? Number.MAX_SAFE_INTEGER) -
      (TRACK_ORDER[b.track.id] ?? Number.MAX_SAFE_INTEGER),
  );
}

/** Assemble une tentative d'examen : échantillon aléatoire + choix mélangés. */
export async function buildExam(
  trackId: string,
): Promise<AssembledExam | null> {
  const track = TRACK_BY_ID[trackId];
  if (!track) return null;
  const pool = await poolForTrack(trackId);
  if (pool.length === 0) return null;
  const params = deriveExamParams(pool.length);
  const questions = shuffle(pool)
    .slice(0, params.questionCount)
    .map(shuffleChoices);
  return { track, poolSize: pool.length, params, questions };
}

/** Slugs de filières ayant un examen (pour generateStaticParams éventuel). */
export async function getExamTrackIds(): Promise<string[]> {
  return (await listExams()).map((e) => e.track.id);
}
