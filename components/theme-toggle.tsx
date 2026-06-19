"use client";

import { useEffect, useState } from "react";

// Bascule clair/sombre, état mémorisé côté client (BUILD-SPEC §2.1).
// localStorage est acceptable ici : préférence d'affichage, pas une donnée critique (§5.1).
export function ThemeToggle({ label }: { label: string }) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const stored = document.documentElement.getAttribute("data-theme");
    setTheme(stored === "light" ? "light" : "dark");
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
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
  }

  return (
    <button type="button" onClick={toggle} aria-label={label} title={label}>
      {theme === "dark" ? "☀" : "☾"}
    </button>
  );
}
