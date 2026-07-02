"use client";

import { useEffect, useRef } from "react";

// Écouteur délégué du bouton « copier » (ROADMAP D3). Les boutons sont rendus
// côté serveur (prose ET terminaux, libellés localisés) ; un seul îlot client
// par page gère le clic : copie du texte du <pre> voisin + retour visuel.
export function CopyDelegate() {
  const timers = useRef(new Map<HTMLButtonElement, number>());

  useEffect(() => {
    const pending = timers.current;
    const onClick = async (e: MouseEvent) => {
      const btn = (e.target as HTMLElement).closest<HTMLButtonElement>(
        "button[data-copy]",
      );
      if (!btn) return;
      const pre = btn.closest("[data-copy-host]")?.querySelector("pre");
      if (!pre) return;
      try {
        await navigator.clipboard.writeText(pre.innerText);
      } catch {
        return; // clipboard indisponible (permissions, http) : ne rien casser
      }
      const idle = btn.dataset.copy!;
      btn.textContent = btn.dataset.copyDone ?? idle;
      btn.classList.add("is-copied");
      window.clearTimeout(pending.get(btn));
      pending.set(
        btn,
        window.setTimeout(() => {
          btn.textContent = idle;
          btn.classList.remove("is-copied");
        }, 1600),
      );
    };
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      pending.forEach((t) => window.clearTimeout(t));
      pending.clear();
    };
  }, []);

  return null;
}
