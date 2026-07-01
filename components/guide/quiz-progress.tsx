"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { Locale } from "@/lib/i18n/config";
import type { GuideQuiz, QuizQuestion } from "@/lib/quiz/types";
import styles from "./quiz-progress.module.css";

type BrowserClient = ReturnType<typeof createSupabaseBrowserClient>;

const COPY = {
  fr: {
    title: "Ta progression",
    login: "Connecte-toi pour suivre ta progression",
    of: "sur",
    steps: "étapes",
    complete: "🎉 Guide terminé !",
    validate: "Valider l'étape",
    confirm: "J'ai terminé cette étape",
    wrong: "Pas tout à fait — relis l'étape et réessaie.",
    right: "✅ Bonne réponse !",
    locked: "verrouillée",
    quizIntro: "Valide cette étape en répondant :",
  },
  en: {
    title: "Your progress",
    login: "Sign in to track your progress",
    of: "of",
    steps: "steps",
    complete: "🎉 Guide completed!",
    validate: "Validate this step",
    confirm: "I completed this step",
    wrong: "Not quite — re-read the step and try again.",
    right: "✅ Correct!",
    locked: "locked",
    quizIntro: "Validate this step by answering:",
  },
} as const;

// Validation de progression par QCM : l'étape courante se valide par une bonne
// réponse (ou une confirmation si le guide n'a pas encore de quiz) ; les étapes
// suivantes sont verrouillées → progression séquentielle et automatique.
export function QuizProgress({
  guideId,
  steps,
  quiz,
  locale,
}: {
  guideId: string;
  steps: string[];
  quiz: GuideQuiz | null;
  locale: Locale;
}) {
  const c = COPY[locale];
  const configured = isSupabaseConfigured();
  const [ready, setReady] = useState(!configured);
  const [authed, setAuthed] = useState(false);
  const [done, setDone] = useState<Set<string>>(new Set());
  const [qIndex, setQIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<"wrong" | "right" | null>(null);
  const clientRef = useRef<BrowserClient | null>(null);

  useEffect(() => {
    let active = true;
    if (!isSupabaseConfigured()) return;
    clientRef.current ??= createSupabaseBrowserClient();
    const supabase = clientRef.current;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!active) return;
      if (!user) {
        setAuthed(false);
        setReady(true);
        return;
      }
      const { data } = await supabase
        .from("progress")
        .select("step_id,status")
        .eq("guide_id", guideId);
      if (!active) return;
      const next = new Set<string>();
      for (const row of data ?? []) {
        if (row.step_id && row.status === "completed") next.add(row.step_id);
      }
      setDone(next);
      setAuthed(true);
      setReady(true);
    })();
    return () => {
      active = false;
    };
  }, [guideId]);

  const currentIndex = steps.findIndex((id) => !done.has(id));
  const currentStep = currentIndex === -1 ? null : steps[currentIndex];
  const questions: QuizQuestion[] =
    currentStep && quiz ? (quiz[currentStep] ?? []) : [];
  const question = questions[qIndex] ?? null;

  async function completeCurrentStep() {
    const supabase = clientRef.current;
    if (!supabase || !currentStep) return;
    const next = new Set(done);
    next.add(currentStep);
    setDone(next);
    setQIndex(0);
    setPicked(null);
    setFeedback(null);
    await supabase.rpc("set_progress", {
      p_guide_id: guideId,
      p_step_id: currentStep,
      p_status: "completed",
    });
    // Ligne « niveau guide » cohérente avec l'état des étapes.
    await supabase.rpc("set_progress", {
      p_guide_id: guideId,
      p_step_id: null,
      p_status: next.size >= steps.length ? "completed" : "in_progress",
    });
  }

  function submitAnswer() {
    if (picked === null || !question) return;
    if (picked !== question.answer) {
      setFeedback("wrong");
      return;
    }
    setFeedback("right");
    // Question suivante, ou étape validée si c'était la dernière.
    if (qIndex + 1 < questions.length) {
      setTimeout(() => {
        setQIndex((i) => i + 1);
        setPicked(null);
        setFeedback(null);
      }, 900);
    } else {
      setTimeout(() => void completeCurrentStep(), 900);
    }
  }

  if (!ready) return null;

  if (!authed) {
    return (
      <aside className={styles.box}>
        <Link href={`/${locale}/login`} className="btn btn--primary">
          {c.login} →
        </Link>
      </aside>
    );
  }

  const count = done.size;
  const total = steps.length;
  const allDone = total > 0 && count >= total;

  return (
    <aside className={styles.box}>
      <div className={styles.head}>
        <span className="cli-header">{c.title}</span>
        <span className={styles.counter}>
          {count} {c.of} {total} {c.steps}
        </span>
      </div>
      <div
        className={styles.bar}
        role="progressbar"
        aria-valuenow={count}
        aria-valuemin={0}
        aria-valuemax={total}
      >
        <span
          className={styles.fill}
          style={{ width: `${total ? (count / total) * 100 : 0}%` }}
        />
      </div>

      <ol className={styles.steps}>
        {steps.map((id, i) => {
          const state = done.has(id)
            ? "done"
            : i === currentIndex
              ? "current"
              : "locked";
          return (
            <li key={id} className={`${styles.step} ${styles[state]}`}>
              <span className={styles.stepIcon} aria-hidden>
                {state === "done" ? "✓" : state === "current" ? "▶" : "🔒"}
              </span>
              {state === "locked" ? (
                <span>
                  {id} <em className={styles.lockedLabel}>· {c.locked}</em>
                </span>
              ) : (
                <a href={`#${id}`}>{id}</a>
              )}
            </li>
          );
        })}
      </ol>

      {allDone ? <p className={styles.complete}>{c.complete}</p> : null}

      {currentStep && question ? (
        <div className={styles.quiz}>
          <p className={styles.quizIntro}>
            {c.quizIntro} <strong>{currentStep}</strong>
            {questions.length > 1 ? ` (${qIndex + 1}/${questions.length})` : ""}
          </p>
          <p className={styles.question}>
            {locale === "fr" ? question.q_fr : question.q_en}
          </p>
          <div className={styles.choices}>
            {question.choices.map((choice, i) => (
              <label key={i} className={styles.choice}>
                <input
                  type="radio"
                  name={`quiz-${guideId}-${currentStep}-${qIndex}`}
                  checked={picked === i}
                  onChange={() => {
                    setPicked(i);
                    setFeedback(null);
                  }}
                />
                <span>{locale === "fr" ? choice.fr : choice.en}</span>
              </label>
            ))}
          </div>
          {feedback === "wrong" ? (
            <p className={styles.wrong}>{c.wrong}</p>
          ) : null}
          {feedback === "right" ? (
            <p className={styles.right}>
              {c.right}
              {question.explain_fr ? (
                <>
                  {" "}
                  {locale === "fr" ? question.explain_fr : question.explain_en}
                </>
              ) : null}
            </p>
          ) : null}
          <button
            type="button"
            className="btn btn--primary"
            disabled={picked === null || feedback === "right"}
            onClick={submitAnswer}
          >
            {c.validate}
          </button>
        </div>
      ) : currentStep ? (
        // Pas (encore) de quiz pour ce guide : confirmation séquentielle.
        <div className={styles.quiz}>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => void completeCurrentStep()}
          >
            {c.confirm} ({currentStep}) →
          </button>
        </div>
      ) : null}
    </aside>
  );
}
