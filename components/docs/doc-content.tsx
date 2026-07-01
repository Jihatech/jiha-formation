import type { Locale } from "@/lib/i18n/config";
import type { ParsedGuide } from "@/lib/content/types";
import { splitSectionTitle } from "@/lib/docs/source";
import { Nodes, type FigureMap } from "@/components/content/nodes";
import styles from "./doc-content.module.css";

const EMPTY_FIGURES: FigureMap = new Map();

// Rendu d'une fiche : sections à titres libres bilingues (« fr | en »),
// mêmes nodes que les guides (prose :::lang, code partagé, figures).
export function DocContent({
  doc,
  locale,
}: {
  doc: ParsedGuide;
  locale: Locale;
}) {
  return (
    <div className={styles.content}>
      {doc.sections.map((section) => (
        <section key={section.id} id={section.id} className={styles.section}>
          <h2 className={styles.sectionTitle}>
            {splitSectionTitle(section.title, locale)}
          </h2>
          <Nodes
            nodes={section.nodes}
            locale={locale}
            figures={EMPTY_FIGURES}
          />
          {/* Les fiches n'ont pas d'étapes ; si un ### traîne, on le rend quand même. */}
          {section.steps.map((step) => (
            <Nodes
              key={step.id}
              nodes={step.nodes}
              locale={locale}
              figures={EMPTY_FIGURES}
            />
          ))}
        </section>
      ))}
    </div>
  );
}
