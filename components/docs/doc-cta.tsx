import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { getManifestGuide, getPublicGuide } from "@/lib/content/source";
import styles from "./doc-cta.module.css";

// Le tunnel : fiche ouverte (SEO) → CTA vers le parcours (le produit).
// Si la fiche référence un guide, on pointe dessus (guide public → direct ;
// guide gated → inscription).
export async function DocCta({
  locale,
  relatedGuide,
}: {
  locale: Locale;
  relatedGuide?: string;
}) {
  const fr = locale === "fr";
  const related = relatedGuide ? await getManifestGuide(relatedGuide) : null;
  const pub = await getPublicGuide();
  const isPublic = related && pub?.id === related.id;
  const guideTitle = related
    ? fr
      ? related.title_fr
      : related.title_en
    : null;

  const href =
    related && isPublic
      ? `/${locale}/guides/${related.slug}`
      : `/${locale}/signup`;

  return (
    <aside className={styles.cta}>
      <p className={styles.pitch}>
        {fr
          ? "Cette fiche répond à ta question. Pour vraiment maîtriser le sujet, apprends en déployant :"
          : "This page answers your question. To truly master the topic, learn by deploying:"}
      </p>
      <Link href={href} className="btn btn--primary">
        {guideTitle
          ? fr
            ? `Suivre le guide « ${guideTitle} » →`
            : `Follow the “${guideTitle}” guide →`
          : fr
            ? "Commencer le parcours gratuitement →"
            : "Start the path for free →"}
      </Link>
    </aside>
  );
}
