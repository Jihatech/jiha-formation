import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import type { ManifestGuide } from "@/lib/content/source";
import styles from "./guide-relations.module.css";

// Liens inter-guides résolus via le manifeste (BUILD-SPEC §3.4) :
// publié → lien cliquable ; sinon → grisé « bientôt / soon », jamais de 404.
export function GuideRelations({
  ids,
  manifest,
  locale,
  soonLabel,
}: {
  ids: string[];
  manifest: ManifestGuide[];
  locale: Locale;
  soonLabel: string;
}) {
  if (!ids.length) return null;
  return (
    <ul className={styles.list}>
      {ids.map((id) => {
        const g = manifest.find((m) => m.id === id);
        const title = g ? (locale === "fr" ? g.title_fr : g.title_en) : id;
        const published = g?.status === "published";
        return (
          <li key={id} className={styles.item}>
            {published ? (
              <Link href={`/${locale}/guides/${g!.slug}`}>{title}</Link>
            ) : (
              <span className={styles.soon}>
                {title} <em>· {soonLabel}</em>
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
