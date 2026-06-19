"use client";

import { useSyncExternalStore } from "react";

// Bascule clair/sombre, état mémorisé côté client (BUILD-SPEC §2.1).
// localStorage est acceptable ici : préférence d'affichage, pas une donnée critique (§5.1).
// useSyncExternalStore : on lit l'état réel du DOM (posé par le bootstrap anti-FOUC)
// sans setState-dans-effet ni mismatch d'hydratation.

const THEME_EVENT = "jiha-theme-change";

function subscribe(callback: () => void): () => void {
  window.addEventListener(THEME_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(THEME_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot(): "dark" | "light" {
  return document.documentElement.getAttribute("data-theme") === "light"
    ? "light"
    : "dark";
}

export function ThemeToggle({ label }: { label: string }) {
  // Sombre par défaut côté serveur (§2.1).
  const theme = useSyncExternalStore(subscribe, getSnapshot, () => "dark");

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    if (next === "light") {
      document.documentElement.setAttribute("data-theme", "light");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    try {
      localStorage.setItem("jiha-theme", next);
    } catch {
      /* stockage indisponible : on ignore, la préférence n'est pas critique */
    }
    window.dispatchEvent(new Event(THEME_EVENT));
  }

  return (
    <button type="button" onClick={toggle} aria-label={label} title={label}>
      {theme === "dark" ? "☀" : "☾"}
    </button>
  );
}
