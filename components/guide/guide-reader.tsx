"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { CopyDelegate } from "@/components/content/code-copy";
import type { Locale } from "@/lib/i18n/config";
import type { GuideQuiz, QuizQuestion } from "@/lib/quiz/types";
import styles from "./guide-reader.module.css";

type BrowserClient = ReturnType<typeof createSupabaseBrowserClient>;

export interface ReaderStep {
  id: string;
  content: ReactNode;
}
export interface ReaderSection {
  id: string;
  label: string;
  index: number;
  intro: ReactNode | null;
  steps: ReaderStep[];
}

const COPY = {
  fr: {
    title: "Ta progression",
    login: "Connecte-toi pour suivre ta progression et valider les étapes",
    signin: "Se connecter",
    of: "sur",
    steps: "étapes",
    complete: "🎉 Guide terminé — bravo !",
    validate: "Valider l'étape",
    confirm: "J'ai terminé cette étape",
    wrong: "Pas tout à fait — relis l'étape et réessaie.",
    right: "✅ Bonne réponse !",
    quizIntro: "Valide cette étape ↓",
    review: "Revoir",
    hide: "Replier",
    lockedHint: "Termine l'étape en cours pour débloquer la suite.",
    current: "étape en cours",
  },
  en: {
    title: "Your progress",
    login: "Sign in to track your progress and validate steps",
    signin: "Sign in",
    of: "of",
    steps: "steps",
    complete: "🎉 Guide completed — well done!",
    validate: "Validate this step",
    confirm: "I completed this step",
    wrong: "Not quite — re-read the step and try again.",
    right: "✅ Correct!",
    quizIntro: "Validate this step ↓",
    review: "Review",
    hide: "Collapse",
    lockedHint: "Finish the current step to unlock the rest.",
    current: "current step",
  },
} as const;

export function GuideReader({
  guideId,
  sections,
  quiz,
  locale,
}: {
  guideId: string;
  sections: ReaderSection[];
  quiz: GuideQuiz | null;
  locale: Locale;
}) {
  const c = COPY[locale];
  const configured = isSupabaseConfigured();
  const [ready, setReady] = useState(!configured);
  const [authed, setAuthed] = useState(false);
  const [done, setDone] = useState<Set<string>>(new Set());
  const [reviewOpen, setReviewOpen] = useState<Set<string>>(new Set());
  const [qIndex, setQIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<"wrong" | "right" | null>(null);
  const clientRef = useRef<BrowserClient | null>(null);
  const justAdvanced = useRef(false);

  const flatSteps = sections.flatMap((s) => s.steps);
  const stepIds = flatSteps.map((s) => s.id);

  useEffect(() => {
    if (!configured) return;
    let active = true;
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
  }, [guideId, configured]);

  const currentIndex = stepIds.findIndex((id) => !done.has(id));
  const currentStepId = currentIndex === -1 ? null : stepIds[currentIndex];
  const questions: QuizQuestion[] =
    currentStepId && quiz ? (quiz[currentStepId] ?? []) : [];
  const question = questions[qIndex] ?? null;

  // Après validation d'une étape : amène la nouvelle étape courante dans le champ.
  useEffect(() => {
    if (!justAdvanced.current) return;
    justAdvanced.current = false;
    if (!currentStepId) return;
    const el = document.getElementById(currentStepId);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [done, currentStepId]);

  async function completeCurrentStep() {
    const supabase = clientRef.current;
    if (!supabase || !currentStepId) return;
    const next = new Set(done);
    next.add(currentStepId);
    justAdvanced.current = true;
    setDone(next);
    setQIndex(0);
    setPicked(null);
    setFeedback(null);
    await supabase.rpc("set_progress", {
      p_guide_id: guideId,
      p_step_id: currentStepId,
      p_status: "completed",
    });
    await supabase.rpc("set_progress", {
      p_guide_id: guideId,
      p_step_id: null,
      p_status: next.size >= stepIds.length ? "completed" : "in_progress",
    });
  }

  function submitAnswer() {
    if (picked === null || !question) return;
    if (picked !== question.answer) {
      setFeedback("wrong");
      return;
    }
    setFeedback("right");
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

  function toggleReview(id: string) {
    setReviewOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function focusStep(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const count = done.size;
  const total = stepIds.length;
  const allDone = total > 0 && count >= total;
  // Avant résolution de l'auth (ou visiteur anonyme) : tout est déroulé — article
  // lisible et indexable, sans gating. Le focus séquentiel n'arrive qu'une fois
  // l'utilisateur connecté (évite aussi tout masquage de contenu pour le SEO).
  const focusMode = ready && authed;

  const quizBlock = (
    <div className={styles.quiz}>
      <p className={styles.quizIntro}>{c.quizIntro}</p>
      {question ? (
        <>
          <p className={styles.question}>
            {locale === "fr" ? question.q_fr : question.q_en}
            {questions.length > 1 ? ` (${qIndex + 1}/${questions.length})` : ""}
          </p>
          <div className={styles.choices}>
            {question.choices.map((choice, i) => (
              <label key={i} className={styles.choice}>
                <input
                  type="radio"
                  name={`quiz-${guideId}-${currentStepId}-${qIndex}`}
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
          {feedback === "wrong" ? <p className={styles.wrong}>{c.wrong}</p> : null}
          {feedback === "right" ? (
            <p className={styles.right}>
              {c.right}
              {question.explain_fr
                ? ` ${locale === "fr" ? question.explain_fr : question.explain_en}`
                : ""}
            </p>
          ) : null}
          <button
            type="button"
            className="btn btn--primary"
            disabled={picked === null || feedback === "right"}
            onClick={submitAnswer}
          >
            {c.validate} →
          </button>
        </>
      ) : (
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => void completeCurrentStep()}
        >
          {c.confirm} →
        </button>
      )}
    </div>
  );

  // ---- Vue déroulée (anonyme / avant auth) ----
  if (!focusMode) {
    return (
      <div className={styles.main}>
        <CopyDelegate />
        {configured && ready && !authed ? (
          <div className={styles.loginBox}>
            <p>{c.login}</p>
            <Link href={`/${locale}/login`} className="btn btn--primary">
              {c.signin} →
            </Link>
          </div>
        ) : null}
        {sections.map((section) => (
          <SectionBlock key={section.id} section={section} />
        ))}
      </div>
    );
  }

  // ---- Vue focalisée (connecté) ----
  return (
    <div className={styles.grid}>
      <div className={styles.main}>
        <CopyDelegate />
        {allDone ? <p className={styles.complete}>{c.complete}</p> : null}
        {sections.map((section) => (
          <div key={section.id}>
            <h2 className={styles.sectionHead}>
              <span className="cli-header">
                § {String(section.index + 1).padStart(2, "0")}
              </span>{" "}
              {section.label}
            </h2>
            {section.steps.length === 0 && section.intro ? (
              <div className={styles.intro}>{section.intro}</div>
            ) : null}
            {section.steps.map((st, i) => {
              const isDone = done.has(st.id);
              const isCurrent = st.id === currentStepId;
              const state = isDone ? "done" : isCurrent ? "current" : "locked";
              const open = isCurrent || (isDone && reviewOpen.has(st.id));
              // La première étape non verrouillée porte l'intro de sa section.
              const intro = i === 0 ? section.intro : null;
              // Petit repère sous la 1re étape verrouillée (celle juste après l'étape en cours).
              const firstLocked =
                state === "locked" && stepIds.indexOf(st.id) === currentIndex + 1;
              return (
                <section
                  key={st.id}
                  id={st.id}
                  className={`${styles.step} ${styles[`step${cap(state)}`]}`}
                >
                  {isDone ? (
                    <button
                      type="button"
                      className={styles.stepHead}
                      onClick={() => toggleReview(st.id)}
                      aria-expanded={open}
                    >
                      <span className={styles.stepIcon} aria-hidden>
                        ✓
                      </span>
                      <span className={styles.stepTitle}>{st.id}</span>
                      <span className={styles.reviewToggle}>
                        {open ? c.hide : c.review} {open ? "▴" : "▾"}
                      </span>
                    </button>
                  ) : isCurrent ? (
                    <div className={`${styles.stepHead} ${styles.stepHeadStatic}`}>
                      <span className={styles.stepIcon} aria-hidden>
                        ▶
                      </span>
                      <span className={styles.stepTitle}>{st.id}</span>
                      <span className={styles.stepTag}>{c.current}</span>
                    </div>
                  ) : (
                    <div
                      className={`${styles.stepHead} ${styles.stepHeadStatic}`}
                      aria-disabled
                    >
                      <span className={styles.stepIcon} aria-hidden>
                        🔒
                      </span>
                      <span className={styles.stepTitle}>{st.id}</span>
                    </div>
                  )}

                  {open ? (
                    <div className={styles.body}>
                      {intro ? <div className={styles.intro}>{intro}</div> : null}
                      {st.content}
                      {isCurrent ? quizBlock : null}
                    </div>
                  ) : firstLocked ? (
                    <p className={styles.lockedHint}>{c.lockedHint}</p>
                  ) : null}
                </section>
              );
            })}
          </div>
        ))}
      </div>

      <div className={styles.railCol}>
        <aside className={styles.rail}>
          <div className={styles.railHead}>
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
          <ul className={styles.railList}>
            {sections.map((section) => (
              <li key={section.id}>
                <p className={styles.railGroup}>
                  § {String(section.index + 1).padStart(2, "0")} {section.label}
                </p>
                <ul className={styles.railList}>
                  {section.steps.map((st) => {
                    const isDone = done.has(st.id);
                    const isCurrent = st.id === currentStepId;
                    const state = isDone
                      ? "Done"
                      : isCurrent
                        ? "Current"
                        : "Locked";
                    return (
                      <li key={st.id}>
                        <button
                          type="button"
                          className={`${styles.railItem} ${styles[`rail${state}`]}`}
                          disabled={!isDone && !isCurrent}
                          onClick={() => focusStep(st.id)}
                        >
                          <span className={styles.railIcon} aria-hidden>
                            {isDone ? "✓" : isCurrent ? "▶" : "🔒"}
                          </span>
                          <span>{st.id}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function SectionBlock({ section }: { section: ReaderSection }) {
  return (
    <div>
      <h2 className={styles.sectionHead}>
        <span className="cli-header">
          § {String(section.index + 1).padStart(2, "0")}
        </span>{" "}
        {section.label}
      </h2>
      {section.intro ? <div className={styles.intro}>{section.intro}</div> : null}
      {section.steps.map((st) => (
        <section key={st.id} id={st.id} className={styles.step}>
          <div className={`${styles.stepHead} ${styles.stepHeadStatic}`}>
            <span className="prompt" />
            <span className={styles.stepTitle}>{st.id}</span>
          </div>
          <div className={styles.body}>{st.content}</div>
        </section>
      ))}
    </div>
  );
}
