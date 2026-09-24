"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { trackLabel } from "@/lib/content/tracks";
import { durationMinutes } from "@/lib/exams/config";
import type { AssembledExam } from "@/lib/exams/types";
import styles from "./exam-runner.module.css";

const COPY = {
  fr: {
    timeLeft: "Temps restant",
    timeUp: "⏱ Temps écoulé — copie remise automatiquement.",
    answered: "répondues",
    question: "Question",
    of: "sur",
    prev: "← Précédent",
    next: "Suivant →",
    finish: "Terminer l'examen",
    confirmEarly: (n: number) =>
      `Il te reste ${n} question(s) sans réponse. Remettre la copie quand même ?`,
    score: "Score",
    passed: "Admis",
    failed: "Non admis",
    passLine: (p: number) => `Seuil de réussite : ${p}%`,
    correctCount: "bonnes réponses",
    timeUsed: "Temps utilisé",
    yourAnswer: "Ta réponse",
    correctAnswer: "Bonne réponse",
    noAnswer: "(sans réponse)",
    reviewTitle: "Correction",
    source: "Revoir le guide",
    retake: "↻ Refaire un tirage",
    backToList: "Tous les examens blancs",
    minutes: "min",
  },
  en: {
    timeLeft: "Time left",
    timeUp: "⏱ Time is up — exam submitted automatically.",
    answered: "answered",
    question: "Question",
    of: "of",
    prev: "← Previous",
    next: "Next →",
    finish: "Finish exam",
    confirmEarly: (n: number) =>
      `You have ${n} unanswered question(s). Submit anyway?`,
    score: "Score",
    passed: "Passed",
    failed: "Failed",
    passLine: (p: number) => `Pass mark: ${p}%`,
    correctCount: "correct answers",
    timeUsed: "Time used",
    yourAnswer: "Your answer",
    correctAnswer: "Correct answer",
    noAnswer: "(no answer)",
    reviewTitle: "Review",
    source: "Review the guide",
    retake: "↻ Draw a new set",
    backToList: "All mock exams",
    minutes: "min",
  },
} as const;

function fmt(sec: number): string {
  const s = Math.max(0, sec);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

export function ExamRunner({
  exam,
  locale,
}: {
  exam: AssembledExam;
  locale: Locale;
}) {
  const c = COPY[locale];
  const { questions, params, track } = exam;
  const total = questions.length;

  const [answers, setAnswers] = useState<(number | null)[]>(() =>
    Array(total).fill(null),
  );
  const [current, setCurrent] = useState(0);
  const [phase, setPhase] = useState<"running" | "review">("running");
  const [timeLeft, setTimeLeft] = useState(params.durationSec);
  const [autoSubmitted, setAutoSubmitted] = useState(false);

  // Ancre de fin absolue → le compte à rebours reste juste même si l'onglet
  // est mis en veille (setInterval est throttlé en arrière-plan). Posée au
  // montage (dans l'effet) pour garder le rendu pur.
  const endsAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (phase !== "running") return;
    endsAtRef.current ??= Date.now() + params.durationSec * 1000;
    const endsAt = endsAtRef.current;
    const tick = () => {
      const left = Math.round((endsAt - Date.now()) / 1000);
      setTimeLeft(left);
      if (left <= 0) {
        setAutoSubmitted(true);
        setPhase("review");
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [phase, params.durationSec]);

  const answeredCount = answers.filter((a) => a !== null).length;

  const result = useMemo(() => {
    if (phase !== "review") return null;
    const correct = questions.reduce(
      (n, q, i) => n + (answers[i] === q.answer ? 1 : 0),
      0,
    );
    const pct = total ? Math.round((correct / total) * 100) : 0;
    return { correct, pct, passed: pct >= params.passPct };
  }, [phase, answers, questions, total, params.passPct]);

  function pick(choice: number) {
    setAnswers((prev) => {
      const next = [...prev];
      next[current] = choice;
      return next;
    });
  }

  function finish() {
    const unanswered = total - answeredCount;
    if (unanswered > 0 && !window.confirm(c.confirmEarly(unanswered))) return;
    setPhase("review");
  }

  // ---- Correction ----
  if (phase === "review" && result) {
    const timeUsed = params.durationSec - Math.max(0, timeLeft);
    return (
      <section className={styles.wrap}>
        {autoSubmitted ? <p className={styles.timeUp}>{c.timeUp}</p> : null}

        <div
          className={`${styles.scoreCard} ${result.passed ? styles.pass : styles.fail}`}
        >
          <div className={styles.scoreBig}>{result.pct}%</div>
          <div className={styles.scoreMeta}>
            <span className={styles.verdict}>
              {result.passed ? c.passed : c.failed}
            </span>
            <span>
              {result.correct}/{total} {c.correctCount}
            </span>
            <span>{c.passLine(params.passPct)}</span>
            <span>
              {c.timeUsed} : {fmt(timeUsed)}
            </span>
          </div>
        </div>

        <h2 className="cli-header">{c.reviewTitle}</h2>
        <ol className={styles.review}>
          {questions.map((q, i) => {
            const mine = answers[i];
            const ok = mine === q.answer;
            return (
              <li
                key={i}
                className={`${styles.reviewItem} ${ok ? styles.ok : styles.ko}`}
              >
                <p className={styles.reviewQ}>
                  <span className={styles.reviewNum}>{i + 1}.</span>{" "}
                  {locale === "fr" ? q.q_fr : q.q_en}
                </p>
                <ul className={styles.reviewChoices}>
                  {q.choices.map((choice, ci) => {
                    const isCorrect = ci === q.answer;
                    const isMine = ci === mine;
                    return (
                      <li
                        key={ci}
                        className={`${isCorrect ? styles.choiceCorrect : ""} ${
                          isMine && !isCorrect ? styles.choiceWrong : ""
                        }`}
                      >
                        <span className={styles.mark} aria-hidden>
                          {isCorrect ? "✓" : isMine ? "✗" : "·"}
                        </span>
                        {locale === "fr" ? choice.fr : choice.en}
                        {isMine ? (
                          <em className={styles.tag}> — {c.yourAnswer}</em>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
                {mine === null ? (
                  <p className={styles.noAnswer}>{c.noAnswer}</p>
                ) : null}
                {(locale === "fr" ? q.explain_fr : q.explain_en) ? (
                  <p className={styles.explain}>
                    {locale === "fr" ? q.explain_fr : q.explain_en}
                  </p>
                ) : null}
                <Link
                  href={`/${locale}/guides/${q.guideSlug}`}
                  className={styles.sourceLink}
                >
                  {c.source} : {locale === "fr" ? q.guideTitleFr : q.guideTitleEn}{" "}
                  →
                </Link>
              </li>
            );
          })}
        </ol>

        <div className={styles.reviewActions}>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => window.location.reload()}
          >
            {c.retake}
          </button>
          <Link href={`/${locale}/exams`} className="btn">
            {c.backToList}
          </Link>
        </div>
      </section>
    );
  }

  // ---- Passage de l'examen ----
  const q = questions[current];
  const low = timeLeft <= 60;
  return (
    <section className={styles.wrap}>
      <div className={styles.bar}>
        <div className={styles.examName}>
          <span className={styles.trackName}>{trackLabel(track, locale)}</span>
          {track.cert ? <span className={styles.cert}>{track.cert}</span> : null}
          <span className={styles.dur}>
            {durationMinutes(params.durationSec)} {c.minutes}
          </span>
        </div>
        <div
          className={`${styles.timer} ${low ? styles.timerLow : ""}`}
          role="timer"
          aria-live="off"
        >
          {c.timeLeft} : {fmt(timeLeft)}
        </div>
      </div>

      <div className={styles.progressRow}>
        <span>
          {c.question} {current + 1} {c.of} {total}
        </span>
        <span className={styles.answeredCount}>
          {answeredCount}/{total} {c.answered}
        </span>
      </div>

      <div className={styles.qCard}>
        <p className={styles.question}>
          {locale === "fr" ? q.q_fr : q.q_en}
        </p>
        <div className={styles.choices}>
          {q.choices.map((choice, i) => (
            <label
              key={i}
              className={`${styles.choice} ${answers[current] === i ? styles.choicePicked : ""}`}
            >
              <input
                type="radio"
                name={`q-${current}`}
                checked={answers[current] === i}
                onChange={() => pick(i)}
              />
              <span>{locale === "fr" ? choice.fr : choice.en}</span>
            </label>
          ))}
        </div>
      </div>

      <nav className={styles.palette} aria-label="questions">
        {questions.map((_, i) => (
          <button
            key={i}
            type="button"
            className={`${styles.dot} ${i === current ? styles.dotCurrent : ""} ${
              answers[i] !== null ? styles.dotDone : ""
            }`}
            onClick={() => setCurrent(i)}
            aria-current={i === current ? "true" : undefined}
          >
            {i + 1}
          </button>
        ))}
      </nav>

      <div className={styles.controls}>
        <button
          type="button"
          className="btn"
          disabled={current === 0}
          onClick={() => setCurrent((i) => Math.max(0, i - 1))}
        >
          {c.prev}
        </button>
        {current < total - 1 ? (
          <button
            type="button"
            className="btn"
            onClick={() => setCurrent((i) => Math.min(total - 1, i + 1))}
          >
            {c.next}
          </button>
        ) : null}
        <button
          type="button"
          className={`btn btn--primary ${styles.finishBtn}`}
          onClick={finish}
        >
          {c.finish}
        </button>
      </div>
    </section>
  );
}
