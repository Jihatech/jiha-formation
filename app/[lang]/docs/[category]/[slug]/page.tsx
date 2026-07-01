import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { SITE_URL } from "@/lib/config";
import { getCategory } from "@/lib/docs/categories";
import { getAllDocs, getDoc } from "@/lib/docs/source";
import { DocContent } from "@/components/docs/doc-content";
import {
  Breadcrumbs,
  DocsSidebar,
  DocToc,
} from "@/components/docs/docs-chrome";
import { DocCta } from "@/components/docs/doc-cta";
import styles from "../../docs.module.css";

export const dynamicParams = false;

export async function generateStaticParams() {
  const entries = await getAllDocs();
  return locales.flatMap((lang) =>
    entries.map((e) => ({
      lang,
      category: e.meta.category,
      slug: e.meta.slug,
    })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; category: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, category, slug } = await params;
  if (!isLocale(lang)) return {};
  const entry = await getDoc(category, slug);
  if (!entry) return {};
  const fr = lang === "fr";
  const path = (l: string) => `${SITE_URL}/${l}/docs/${category}/${slug}`;
  return {
    title: `${fr ? entry.meta.title_fr : entry.meta.title_en} — jiha.tech`,
    description: fr ? entry.meta.description_fr : entry.meta.description_en,
    alternates: {
      canonical: path(lang),
      languages: { fr: path("fr"), en: path("en") },
    },
    openGraph: {
      title: fr ? entry.meta.title_fr : entry.meta.title_en,
      description: fr ? entry.meta.description_fr : entry.meta.description_en,
      locale: lang,
      type: "article",
    },
  };
}

export default async function DocPage({
  params,
}: {
  params: Promise<{ lang: string; category: string; slug: string }>;
}) {
  const { lang, category, slug } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const fr = locale === "fr";

  const cat = getCategory(category);
  const entry = await getDoc(category, slug);
  if (!cat || !entry) notFound();

  const entries = await getAllDocs();

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.grid}>
        <div className={styles.sideCol}>
          <DocsSidebar entries={entries} locale={locale} activeSlug={slug} />
        </div>

        <article>
          <Breadcrumbs
            items={[
              { href: `/${locale}/docs`, label: "docs" },
              {
                href: `/${locale}/docs/${cat.id}`,
                label: fr ? cat.label_fr : cat.label_en,
              },
              { label: fr ? entry.meta.title_fr : entry.meta.title_en },
            ]}
          />
          <h1 className={styles.title}>
            {fr ? entry.meta.title_fr : entry.meta.title_en}
          </h1>
          <div className={styles.meta}>
            {entry.meta.updated ? (
              <span>
                {fr ? "mis à jour le " : "updated "}
                {entry.meta.updated}
              </span>
            ) : null}
            {entry.meta.tags.map((t) => (
              <span key={t} className={styles.tag}>
                #{t}
              </span>
            ))}
          </div>

          <DocContent doc={entry.doc} locale={locale} />
          <DocCta locale={locale} relatedGuide={entry.meta.related_guide} />
        </article>

        <div className={styles.tocCol}>
          <DocToc sections={entry.doc.sections} locale={locale} />
        </div>
      </div>
    </div>
  );
}
