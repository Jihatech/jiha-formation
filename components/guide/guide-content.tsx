import type { Locale } from "@/lib/i18n/config";
import type { GuideSection, GuideStep, ParsedGuide } from "@/lib/content/types";
import { sectionLabel } from "@/lib/content/section-labels";
import { Nodes, type FigureMap } from "@/components/content/nodes";
import { CopyDelegate } from "@/components/content/code-copy";
import styles from "./guide-content.module.css";

function Step({
  step,
  locale,
  figures,
}: {
  step: GuideStep;
  locale: Locale;
  figures: FigureMap;
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
  figures: FigureMap;
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
  figures: FigureMap;
}) {
  return (
    <div className={styles.content}>
      <CopyDelegate />
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
