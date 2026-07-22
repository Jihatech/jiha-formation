import { marked } from "marked";
import type { Locale } from "@/lib/i18n/config";
import type { GuideNode } from "@/lib/content/types";
import { codeTitle } from "@/lib/content/section-labels";
import styles from "./nodes.module.css";
import copyStyles from "./code-copy.module.css";

// Rendu partagé des nodes de contenu (guides ET fiches).
marked.setOptions({ async: false, gfm: true, breaks: false });

export type FigureMap = Map<string, string | null>;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Admonitions :::note / :::warning dans la prose (ROADMAP D3). Le contenu est
// du markdown de la langue du bloc ; seul le libellé est localisé au rendu.
const ADMONITION_LABELS: Record<string, { fr: string; en: string }> = {
  note: { fr: "Note", en: "Note" },
  warning: { fr: "Attention", en: "Warning" },
};

const PROSE_FENCE = /^```/;

// Libellés du bouton « copier » (le clic est géré par CopyDelegate, un seul
// îlot client par page — voir code-copy.tsx).
function copyLabels(locale: Locale) {
  return locale === "fr"
    ? { idle: "copier", done: "copié !", aria: "Copier le code" }
    : { idle: "copy", done: "copied!", aria: "Copy code" };
}

function copyButtonHtml(locale: Locale, extraClass = ""): string {
  const l = copyLabels(locale);
  return (
    `<button type="button" data-copy="${l.idle}" data-copy-done="${l.done}"` +
    ` aria-label="${l.aria}" class="${copyStyles.button} ${extraClass}">` +
    `${l.idle}</button>`
  );
}

// Ajoute le bouton aux <pre> émis par marked. Sûr : marked émet exactement
// `<pre><code…>…</code></pre>` et le contenu interne est échappé (aucun
// </pre> littéral possible).
function decoratePre(html: string, locale: Locale): string {
  return html.replace(
    /<pre>[\s\S]*?<\/pre>/g,
    (m) =>
      `<div class="${copyStyles.host}" data-copy-host>${m}` +
      `${copyButtonHtml(locale)}</div>`,
  );
}

// Markdown → HTML, en extrayant les blocs :::note / :::warning (hors fences).
function renderProse(markdown: string, locale: Locale): string {
  const lines = markdown.split("\n");
  let html = "";
  let buf: string[] = [];
  const flush = () => {
    if (buf.length) html += marked.parse(buf.join("\n")) as string;
    buf = [];
  };
  let inFence = false;
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (PROSE_FENCE.test(trimmed)) inFence = !inFence;
    const open = inFence ? null : trimmed.match(/^:::(note|warning)\s*$/);
    if (!open) {
      buf.push(lines[i]);
      continue;
    }
    flush();
    const inner: string[] = [];
    let innerFence = false;
    for (i++; i < lines.length; i++) {
      const t = lines[i].trim();
      if (PROSE_FENCE.test(t)) innerFence = !innerFence;
      else if (!innerFence && t === ":::") break;
      inner.push(lines[i]);
    }
    const kind = open[1];
    const kindClass =
      kind === "warning" ? styles.admonitionWarning : styles.admonitionNote;
    html +=
      `<aside class="${styles.admonition} ${kindClass}">` +
      `<p class="${styles.admonitionLabel}">${ADMONITION_LABELS[kind][locale]}</p>` +
      (marked.parse(inner.join("\n").trim()) as string) +
      `</aside>`;
  }
  flush();
  return decoratePre(html, locale);
}

// Prose : markdown → HTML. La prose de l'AUTRE langue est ignorée
// (URLs par langue : une page = une langue, BUILD-SPEC §6.2).
function Prose({ markdown, locale }: { markdown: string; locale: Locale }) {
  return (
    <div
      className={styles.prose}
      dangerouslySetInnerHTML={{ __html: renderProse(markdown, locale) }}
    />
  );
}

// Code PARTAGÉ : rendu verbatim dans une fenêtre terminal. On ne touche pas au
// contenu (CHECKLIST §B : $/$$, guillemets). Seul l'échappement HTML d'affichage.
function CodeBlock({
  lang,
  content,
  locale,
}: {
  lang: string | null;
  content: string;
  locale: Locale;
}) {
  const l = copyLabels(locale);
  return (
    <div className={`terminal ${styles.code}`} data-copy-host>
      <div className="terminal__bar">
        <span className="terminal__dot terminal__dot--red" />
        <span className="terminal__dot terminal__dot--yellow" />
        <span className="terminal__dot terminal__dot--green" />
        <span className="terminal__title">{codeTitle(lang)}</span>
        <button
          type="button"
          data-copy={l.idle}
          data-copy-done={l.done}
          aria-label={l.aria}
          className={`${copyStyles.button} ${copyStyles.bar}`}
        >
          {l.idle}
        </button>
      </div>
      <pre className="terminal__body">
        <code dangerouslySetInnerHTML={{ __html: escapeHtml(content) }} />
      </pre>
    </div>
  );
}

// Figure : SVG inline (si synchronisé) + légende localisée. Les libellés
// data-lang internes au SVG sont gérés par CSS via html[lang].
function Figure({
  caption,
  svg,
  name,
}: {
  caption: string;
  svg: string | null;
  name: string;
}) {
  return (
    <figure className={styles.figure}>
      {svg ? (
        <div
          className={styles.figureSvg}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : (
        <div className={styles.figureMissing} role="img" aria-label={caption}>
          [ schéma « {name} » à venir ]
        </div>
      )}
      <figcaption className={styles.figcaption}>{caption}</figcaption>
    </figure>
  );
}

function Node({
  node,
  locale,
  figures,
}: {
  node: GuideNode;
  locale: Locale;
  figures: FigureMap;
}) {
  switch (node.type) {
    case "prose":
      if (node.lang !== locale) return null;
      return <Prose markdown={node.markdown} locale={locale} />;
    case "code":
      return (
        <CodeBlock lang={node.lang} content={node.content} locale={locale} />
      );
    case "figure":
      return (
        <Figure
          name={node.name}
          caption={locale === "fr" ? node.caption_fr : node.caption_en}
          svg={figures.get(node.name) ?? null}
        />
      );
  }
}

export function Nodes({
  nodes,
  locale,
  figures,
}: {
  nodes: GuideNode[];
  locale: Locale;
  figures: FigureMap;
}) {
  return (
    <>
      {nodes.map((node, i) => (
        <Node key={i} node={node} locale={locale} figures={figures} />
      ))}
    </>
  );
}
