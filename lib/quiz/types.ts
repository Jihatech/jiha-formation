// Types du moteur de QCM (validation de progression par étape).
// Décision produit : une étape est validée par une bonne réponse, pas une case cochée.

export interface QuizChoice {
  fr: string;
  en: string;
}

export interface QuizQuestion {
  q_fr: string;
  q_en: string;
  choices: QuizChoice[];
  /** Index de la bonne réponse dans choices. */
  answer: number;
  explain_fr?: string;
  explain_en?: string;
}

/** step-id → questions (1 à 3 par étape). */
export type GuideQuiz = Record<string, QuizQuestion[]>;
