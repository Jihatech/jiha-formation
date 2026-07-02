"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n/config";
import styles from "./docs-search.module.css";

// Recherche instantanée sur /docs (ROADMAP D2), propulsée par Pagefind.
// L'index est généré au build (postbuild → public/_pagefind) à partir des
// pages marquées data-pagefind-body ; pagefind.js charge automatiquement
// l'index de la langue du document (<html lang>). En dev, l'index n'existe
// pas encore → le composant l'indique sans casser la page.

interface PagefindHit {
  data(): Promise<{
    url: string;
    excerpt: string;
    meta: { title?: string };
  }>;
}

interface Pagefind {
  options(opts: { baseUrl?: string }): Promise<void>;
  init(): void;
  debouncedSearch(
    query: string,
  ): Promise<{ results: PagefindHit[] } | null>;
}

interface Result {
  url: string;
  title: string;
  excerpt: string;
}

// L'index vit HORS du graphe du bundler (émis après next build) : import à
// l'URL brute, ignoré par webpack/Turbopack. Spécificateur calculé : TS ne
// résout pas les chemins « rootés » via un declare module.
const PAGEFIND_URL = "/_pagefind/pagefind.js";
let pagefindPromise: Promise<Pagefind | null> | null = null;
function loadPagefind(): Promise<Pagefind | null> {
  pagefindPromise ??= import(/* webpackIgnore: true */ `${PAGEFIND_URL}`)
    .then(async (pf: Pagefind) => {
      await pf.options({ baseUrl: "/" });
      pf.init();
      return pf;
    })
    .catch(() => null);
  return pagefindPromise;
}

/** Les pages prérendues sont indexées en `.../slug.html` → URL de route. */
function cleanUrl(url: string): string {
  return url.replace(/\.html$/, "").replace(/\/index$/, "/");
}

export function DocsSearch({ locale }: { locale: Locale }) {
  const fr = locale === "fr";
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [unavailable, setUnavailable] = useState(false);
  const [open, setOpen] = useState(false);

  // Requête vide : panneau masqué (showPanel) — pas besoin de vider l'état.
  useEffect(() => {
    const q = query.trim();
    if (!q) return;
    let cancelled = false;
    (async () => {
      const pagefind = await loadPagefind();
      if (cancelled) return;
      if (!pagefind) {
        setUnavailable(true);
        return;
      }
      // null = recherche remplacée par une frappe plus récente (debounce).
      const res = await pagefind.debouncedSearch(q);
      if (!res || cancelled) return;
      const top = await Promise.all(
        res.results.slice(0, 8).map((r) => r.data()),
      );
      if (cancelled) return;
      setResults(
        top.map((d) => ({
          url: cleanUrl(d.url),
          title: d.meta.title ?? d.url,
          excerpt: d.excerpt,
        })),
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [query]);

  // Fermer au clic hors du composant.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const showPanel = open && query.trim().length > 0;
  const label = fr ? "Rechercher dans les docs" : "Search the docs";

  return (
    <div ref={rootRef} className={styles.root} role="search">
      <span className={styles.prompt} aria-hidden>
        &gt;
      </span>
      <input
        type="search"
        className={styles.input}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
          if (e.key === "Enter" && results[0]) router.push(results[0].url);
        }}
        placeholder={`${label}…`}
        aria-label={label}
      />
      {showPanel ? (
        <div className={styles.panel}>
          {unavailable ? (
            <p className={styles.empty}>
              {fr
                ? "Recherche indisponible (index généré au build)."
                : "Search unavailable (index is generated at build time)."}
            </p>
          ) : results.length === 0 ? (
            <p className={styles.empty}>
              {fr ? "Aucun résultat." : "No results."}
            </p>
          ) : (
            <ul className={styles.results}>
              {results.map((r) => (
                <li key={r.url}>
                  {/* <a> volontaire : cible potentiellement hors du graphe Link */}
                  <a
                    href={r.url}
                    className={styles.result}
                    onClick={() => setOpen(false)}
                  >
                    <span className={styles.resultTitle}>{r.title}</span>
                    <span
                      className={styles.resultExcerpt}
                      // Excerpt Pagefind : texte de la page + <mark> (sûr).
                      dangerouslySetInnerHTML={{ __html: r.excerpt }}
                    />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
