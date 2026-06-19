import { marked } from "marked";
import type { Locale } from "@/lib/i18n/config";
import type {
  GuideNode,
  GuideSection,
  GuideStep,
  ParsedGuide,
} from "@/lib/content/types";
import { codeTitle, sectionLabel } from "@/lib/content/section-labels";
import styles from "./guide-content.module.css";

marked.setOptions({ async: false, gfm: true, breaks: false });

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Prose : markdown → HTML. La prose de l'AUTRE langue est simplement ignorée
// (URLs par langue : une page = une langue, BUILD-SPEC §6.2).
function Prose({ markdown }: { markdown: string }) {
  const html = marked.parse(markdown) as string;
  return (
    <div className={styles.prose} dangerouslySetInnerHTML={{ __html: html }} />
  );
}

// Code PARTAGÉ : rendu verbatim dans une fenêtre terminal. On ne touche pas au
// contenu (CHECKLIST §B : $/$$, guillemets). Seul l'échappement HTML d'affichage.
function CodeBlock({ lang, content }: { lang: string | null; content: string }) {
  return (
    <div className={`terminal ${styles.code}`}>
      <div className="terminal__bar">
        <span className="terminal__dot terminal__dot--red" />
        <span className="terminal__dot terminal__dot--yellow" />
        <span className="terminal__dot terminal__dot--green" />
        <span className="terminal__title">{codeTitle(lang)}</span>
      </div>
      <pre className="terminal__body">
        <code dangerouslySetInnerHTML={{ __html: escapeHtml(content) }} />
      </pre>
    </div>
  );
}

// Figure : SVG inline (s'il a été synchronisé depuis JIHA-Learn) + légende localisée.
// Les libellés data-lang internes au SVG sont gérés par CSS via html[lang].
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
  figures: Map<string, string | null>;
}) {
  switch (node.type) {
    case "prose":
      if (node.lang !== locale) return null;
      return <Prose markdown={node.markdown} />;
    case "code":
      return <CodeBlock lang={node.lang} content={node.content} />;
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

function Nodes({
  nodes,
  locale,
  figures,
}: {
  nodes: GuideNode[];
  locale: Locale;
  figures: Map<string, string | null>;
}) {
  return (
    <>
      {nodes.map((node, i) => (
        <Node key={i} node={node} locale={locale} figures={figures} />
      ))}
    </>
  );
}

function Step({
  step,
  locale,
  figures,
}: {
  step: GuideStep;
  locale: Locale;
  figures: Map<string, string | null>;
}) {
  return (
    <section id={step.id} className={styles.step}>
      <h3 className={styles.stepTitle}>
        <span className="prompt" />
        {step.id}
      </h3>
      <Nodes nodes={step.nodes} locale={locale} figures={figures} />
    </section>
  );
}

function Section({
  section,
  index,
  locale,
  figures,
}: {
  section: GuideSection;
  index: number;
  locale: Locale;
  figures: Map<string, string | null>;
}) {
  const num = String(index + 1).padStart(2, "0");
  return (
    <section id={section.id} className={styles.section}>
      <h2 className={styles.sectionTitle}>
        <span className="cli-header">§ {num}</span>{" "}
        {sectionLabel(section.id, locale)}
      </h2>
      <Nodes nodes={section.nodes} locale={locale} figures={figures} />
      {section.steps.map((step) => (
        <Step key={step.id} step={step} locale={locale} figures={figures} />
      ))}
    </section>
  );
}

export function GuideContent({
  guide,
  locale,
  figures,
}: {
  guide: ParsedGuide;
  locale: Locale;
  figures: Map<string, string | null>;
}) {
  return (
    <div className={styles.content}>
      {guide.sections.map((section, i) => (
        <Section
          key={section.id}
          section={section}
          index={i}
          locale={locale}
          figures={figures}
        />
      ))}
    </div>
  );
}
