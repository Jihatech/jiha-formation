"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Locale } from "@/lib/i18n/config";
import styles from "./guide-progress.module.css";

const COPY = {
  fr: {
    title: "Ta progression",
    login: "Connecte-toi pour suivre ta progression",
    done: "Terminé",
    of: "sur",
    steps: "étapes",
    complete: "🎉 Guide terminé !",
  },
  en: {
    title: "Your progress",
    login: "Sign in to track your progress",
    done: "Completed",
    of: "of",
    steps: "steps",
    complete: "🎉 Guide completed!",
  },
} as const;

export function GuideProgress({
  guideId,
  steps,
  locale,
}: {
  guideId: string;
  steps: string[];
  locale: Locale;
}) {
  const c = COPY[locale];
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [done, setDone] = useState<Set<string>>(new Set());
  const [supabase] = useState(() => createSupabaseBrowserClient());

  // Chargement initial : tout setState a lieu APRÈS un await (pas de synchrone dans l'effet).
  useEffect(() => {
    let active = true;
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
  }, [guideId, supabase]);

  // Maintient la ligne « niveau guide » cohérente avec l'état des étapes.
  async function syncGuideLevel(completedCount: number) {
    if (completedCount >= steps.length && steps.length > 0) {
      await supabase.rpc("set_progress", {
        p_guide_id: guideId,
        p_step_id: null,
        p_status: "completed",
      });
    } else if (completedCount > 0) {
      await supabase.rpc("set_progress", {
        p_guide_id: guideId,
        p_step_id: null,
        p_status: "in_progress",
      });
    } else {
      await supabase.rpc("unset_progress", {
        p_guide_id: guideId,
        p_step_id: null,
      });
    }
  }

  async function toggle(stepId: string) {
    const next = new Set(done);
    if (next.has(stepId)) {
      next.delete(stepId);
      await supabase.rpc("unset_progress", {
        p_guide_id: guideId,
        p_step_id: stepId,
      });
    } else {
      next.add(stepId);
      await supabase.rpc("set_progress", {
        p_guide_id: guideId,
        p_step_id: stepId,
        p_status: "completed",
      });
    }
    setDone(next);
    await syncGuideLevel(next.size);
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
      {allDone ? <p className={styles.complete}>{c.complete}</p> : null}
      <ul className={styles.steps}>
        {steps.map((id) => (
          <li key={id}>
            <label className={styles.step}>
              <input
                type="checkbox"
                checked={done.has(id)}
                onChange={() => void toggle(id)}
              />
              <span>{id}</span>
            </label>
          </li>
        ))}
      </ul>
    </aside>
  );
}
