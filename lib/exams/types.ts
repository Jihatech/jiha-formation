// Types partagés des examens blancs (importables côté client comme serveur).
// L'assemblage (lecture manifeste + registre quiz) reste server-only : lib/exams/source.ts.
import type { QuizQuestion } from "@/lib/quiz/types";
import type { TrackMeta } from "@/lib/content/tracks";
import type { ExamParams } from "./config";

// Une question d'examen = une question de QCM enrichie de sa provenance, pour
// renvoyer l'apprenant vers le guide source lors de la correction.
export interface ExamQuestion extends QuizQuestion {
  guideId: string;
  guideSlug: string;
  guideTitleFr: string;
  guideTitleEn: string;
}

export interface ExamSummary {
  track: TrackMeta;
  /** Taille du vivier (toutes les questions de la filière). */
  poolSize: number;
  /** Nombre de guides publiés qui alimentent l'examen. */
  guideCount: number;
  params: ExamParams;
}

export interface AssembledExam {
  track: TrackMeta;
  poolSize: number;
  params: ExamParams;
  /** Échantillon tiré pour CETTE tentative (questions + choix mélangés). */
  questions: ExamQuestion[];
}
