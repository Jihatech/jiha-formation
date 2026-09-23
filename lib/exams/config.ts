// Paramétrage des examens blancs (mock exams chronométrés par filière).
// Un examen blanc = agrégat des QCM d'une filière, échantillonné et noté.
// Ici, UNIQUEMENT la logique de dimensionnement (pure, sans I/O) — réutilisable
// côté client pour l'affichage. L'assemblage des questions (lecture du manifeste
// + registre de quiz) vit dans lib/exams/source.ts (server-only).

/** Nombre maximum de questions tirées par examen. Un tirage < vivier rend l'examen rejouable. */
export const EXAM_QUESTION_CAP = 30;

/** Budget temps par question (secondes) — ~1,5 min, calqué sur les vrais examens de certif. */
export const SECONDS_PER_QUESTION = 90;

/** Seuil de réussite par défaut (%). Repère industrie : Azure = 700/1000 = 70 %. */
export const DEFAULT_PASS_PCT = 70;

export interface ExamParams {
  /** Nombre de questions effectivement posées (borné au vivier disponible). */
  questionCount: number;
  /** Durée impartie, en secondes. */
  durationSec: number;
  /** Score minimal (%) pour être « admis ». */
  passPct: number;
}

/** Dimensionne un examen à partir de la taille réelle du vivier de questions. */
export function deriveExamParams(
  poolSize: number,
  passPct: number = DEFAULT_PASS_PCT,
): ExamParams {
  const questionCount = Math.min(poolSize, EXAM_QUESTION_CAP);
  return {
    questionCount,
    durationSec: questionCount * SECONDS_PER_QUESTION,
    passPct,
  };
}

/** Durée en minutes (arrondie), pour l'affichage. */
export function durationMinutes(durationSec: number): number {
  return Math.round(durationSec / 60);
}
