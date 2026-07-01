import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { SITE_URL } from "@/lib/config";
import { docsCategories, getCategory } from "@/lib/docs/categories";
import { getDocsByCategory } from "@/lib/docs/source";
import { Breadcrumbs } from "@/components/docs/docs-chrome";
import styles from "../docs.module.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((lang) =>
    docsCategories.map((c) => ({ lang, category: c.id })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; category: string }>;
}): Promise<Metadata> {
  const { lang, category } = await params;
  if (!isLocale(lang)) return {};
  const cat = getCategory(category);
  if (!cat) return {};
  const fr = lang === "fr";
  const label = fr ? cat.label_fr : cat.label_en;
  return {
    title: `${label} — Docs — jiha.tech`,
    description: fr ? cat.desc_fr : cat.desc_en,
    alternates: {
      canonical: `${SITE_URL}/${lang}/docs/${cat.id}`,
      languages: {
        fr: `${SITE_URL}/fr/docs/${cat.id}`,
        en: `${SITE_URL}/en/docs/${cat.id}`,
      },
    },
  };
}

export default async function DocsCategoryPage({
  params,
}: {
  params: Promise<{ lang: string; category: string }>;
}) {
  const { lang, category } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const cat = getCategory(category);
  if (!cat) notFound();
  const fr = locale === "fr";
  const docs = await getDocsByCategory(cat.id);

  return (
    <div className={`container ${styles.page}`}>
      <Breadcrumbs
        items={[
          { href: `/${locale}/docs`, label: "docs" },
          { label: fr ? cat.label_fr : cat.label_en },
        ]}
      />
      <h1 className={styles.title}>{fr ? cat.label_fr : cat.label_en}</h1>
      <p className={styles.subtitle}>{fr ? cat.desc_fr : cat.desc_en}</p>
      <ul className={styles.list}>
        {docs.map((e) => (
          <li key={e.meta.id}>
            <Link
              href={`/${locale}/docs/${cat.id}/${e.meta.slug}`}
              className={styles.item}
            >
              <p className={styles.itemTitle}>
                {fr ? e.meta.title_fr : e.meta.title_en}
              </p>
              <p className={styles.itemDesc}>
                {fr ? e.meta.description_fr : e.meta.description_en}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
