"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { Locale } from "@/lib/i18n/config";
import styles from "./parcours-teaser.module.css";

type Client = ReturnType<typeof createSupabaseBrowserClient>;

// Aperçu du parcours : verrouillé pour les visiteurs (pousse à l'inscription),
// "reprendre" pour les inscrits. Décision produit : parcours gated, 1er guide public.
export function ParcoursTeaser({
  locale,
  total,
}: {
  locale: Locale;
  total: number;
}) {
  const [authed, setAuthed] = useState(false);
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    clientRef.current ??= createSupabaseBrowserClient();
    let active = true;
    clientRef.current.auth.getUser().then(({ data }) => {
      if (active) setAuthed(Boolean(data.user));
    });
    return () => {
      active = false;
    };
  }, []);

  const fr = locale === "fr";

  if (authed) {
    return (
      <div className={styles.unlocked}>
        <p>{fr ? "Bon retour. Reprends là où tu t'es arrêté." : "Welcome back. Pick up where you left off."}</p>
        <Link href={`/${locale}/dashboard`} className="btn btn--primary">
          {fr ? "Reprendre mon parcours" : "Resume my path"} →
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.locked}>
      <div className={styles.blur} aria-hidden>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={styles.ghostRow}>
            <span className={styles.ghostNum}>{String(i + 1).padStart(2, "0")}</span>
            <span className={styles.ghostBar} style={{ width: `${55 + ((i * 7) % 35)}%` }} />
          </div>
        ))}
      </div>
      <div className={styles.overlay}>
        <span className={styles.lock} aria-hidden>
          🔒
        </span>
        <p className={styles.lockTitle}>
          {fr
            ? `${total} guides t'attendent dans le parcours`
            : `${total} guides await you in the path`}
        </p>
        <p className={styles.lockSub}>
          {fr
            ? "Crée ton compte pour débloquer le parcours complet et suivre ta progression."
            : "Create your account to unlock the full path and track your progress."}
        </p>
        <Link href={`/${locale}/signup`} className="btn btn--primary">
          {fr ? "Créer mon compte gratuit" : "Create my free account"} →
        </Link>
      </div>
    </div>
  );
}
