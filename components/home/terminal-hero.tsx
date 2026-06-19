"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./terminal-hero.module.css";

export interface TermLine {
  /** Ligne de commande (préfixée $) si true, sinon sortie. */
  cmd?: boolean;
  text: string;
}

// Effet machine à écrire, façon terminal. Respecte prefers-reduced-motion :
// si l'utilisateur le demande (ou pas de JS), tout s'affiche d'emblée.
export function TerminalHero({
  lines,
  title,
}: {
  lines: TermLine[];
  title: string;
}) {
  const full = lines.map((l) => l.text);
  const [shown, setShown] = useState<string[]>(() => full.map(() => ""));
  const [done, setDone] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    // Tout en callbacks asynchrones → pas de setState synchrone dans l'effet.
    if (reduce) {
      const t = setTimeout(() => {
        setShown(full);
        setDone(true);
      }, 0);
      timers.current.push(t);
      return () => clearTimeout(t);
    }

    let li = 0;
    let ci = 0;
    const speed = 28;
    const tick = () => {
      setShown((prev) => {
        const next = [...prev];
        next[li] = full[li].slice(0, ci);
        return next;
      });
      ci++;
      if (ci > full[li].length) {
        li++;
        ci = 0;
        if (li >= full.length) {
          setDone(true);
          return;
        }
        timers.current.push(setTimeout(tick, 320)); // pause entre lignes
        return;
      }
      timers.current.push(setTimeout(tick, speed));
    };
    timers.current.push(setTimeout(tick, 250));

    const all = timers.current;
    return () => all.forEach(clearTimeout);
    // full dérive de `lines` (props stables) — on n'anime qu'au montage.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`terminal ${styles.term}`}>
      <div className="terminal__bar">
        <span className="terminal__dot terminal__dot--red" />
        <span className="terminal__dot terminal__dot--yellow" />
        <span className="terminal__dot terminal__dot--green" />
        <span className="terminal__title">{title}</span>
      </div>
      <div className={`terminal__body ${styles.body}`}>
        {lines.map((l, i) => (
          <div key={i} className={l.cmd ? styles.cmd : styles.out}>
            {l.cmd ? <span className={styles.prompt}>$</span> : null}
            <span>{shown[i]}</span>
            {!done && shown[i] && shown[i].length < l.text.length ? (
              <span className="cursor" aria-hidden />
            ) : null}
          </div>
        ))}
        {done ? <span className="cursor" aria-hidden /> : null}
      </div>
    </div>
  );
}
