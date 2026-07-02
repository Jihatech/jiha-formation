import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import type { DocEntry } from "@/lib/docs/source";
import { docsCategories } from "@/lib/docs/categories";
import { splitSectionTitle } from "@/lib/docs/source";
import type { GuideSection } from "@/lib/content/types";
import styles from "./docs-chrome.module.css";

// Chrome de la section /docs : sidebar (arbre catégories → fiches),
// table des matières (droite), fil d'Ariane. Tous serveur, tous SSG.

export function DocsSidebar({
  entries,
  locale,
  activeSlug,
}: {
  entries: DocEntry[];
  locale: Locale;
  activeSlug?: string;
}) {
  return (
    <nav className={styles.sidebar} aria-label="Documentation">
      {docsCategories.map((cat) => {
        const docs = entries.filter((e) => e.meta.category === cat.id);
        if (!docs.length) return null;
        return (
          <div key={cat.id} className={styles.group}>
            <Link
              href={`/${locale}/docs/${cat.id}`}
              className={styles.groupTitle}
            >
              {locale === "fr" ? cat.label_fr : cat.label_en}
            </Link>
            <ul className={styles.groupList}>
              {docs.map((e) => (
                <li key={e.meta.id}>
                  <Link
                    href={`/${locale}/docs/${cat.id}/${e.meta.slug}`}
                    className={
                      e.meta.slug === activeSlug ? styles.active : undefined
                    }
                  >
                    {locale === "fr" ? e.meta.title_fr : e.meta.title_en}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}

export function DocToc({
  sections,
  locale,
}: {
  sections: GuideSection[];
  locale: Locale;
}) {
  if (sections.length < 2) return null;
  return (
    <nav className={styles.toc} aria-label="Table of contents">
      <p className="cli-header">
        {locale === "fr" ? "Sur cette page" : "On this page"}
      </p>
      <ul>
        {sections.map((s) => (
          <li key={s.id}>
            <a href={`#${s.id}`}>{splitSectionTitle(s.title, locale)}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function Breadcrumbs({
  items,
}: {
  items: { href?: string; label: string }[];
}) {
  return (
    <nav className={styles.crumbs} aria-label="Breadcrumb" data-pagefind-ignore>
      {items.map((item, i) => (
        <span key={i}>
          {i > 0 ? <span className={styles.crumbSep}>/</span> : null}
          {item.href ? (
            <Link href={item.href}>{item.label}</Link>
          ) : (
            <span className={styles.crumbCurrent}>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
