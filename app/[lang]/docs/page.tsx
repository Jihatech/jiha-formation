import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { SITE_URL } from "@/lib/config";
import { docsCategories } from "@/lib/docs/categories";
import { getAllDocs } from "@/lib/docs/source";
import { DocsSearch } from "@/components/docs/docs-search";
import styles from "./docs.module.css";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const fr = lang === "fr";
  const title = fr
    ? "Docs — base de connaissances DevOps & self-hosting"
    : "Docs — DevOps & self-hosting knowledge base";
  const description = fr
    ? "Fiches pratiques, cheatsheets et dépannage : Docker, Git, reverse proxy, Linux. Gratuit et sans compte."
    : "Practical notes, cheatsheets and troubleshooting: Docker, Git, reverse proxy, Linux. Free, no account needed.";
  return {
    title: `${title} — jiha.tech`,
    description,
    alternates: {
      canonical: `${SITE_URL}/${lang}/docs`,
      languages: {
        fr: `${SITE_URL}/fr/docs`,
        en: `${SITE_URL}/en/docs`,
      },
    },
  };
}

export default async function DocsHomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const fr = locale === "fr";
  const entries = await getAllDocs();

  return (
    <div className={`container ${styles.page}`}>
      <h1 className={styles.title}>
        <span className="cli-header">~/docs</span>
        <br />
        {fr ? "Base de connaissances" : "Knowledge base"}
      </h1>
      <p className={styles.subtitle}>
        {fr
          ? "Des fiches courtes qui répondent vite : cheatsheets, choix d'outils, dépannage. Ouvertes à tous — le parcours guidé, lui, t'apprend en déployant."
          : "Short pages with fast answers: cheatsheets, tool choices, troubleshooting. Open to everyone — the guided path teaches you by deploying."}
      </p>
      <DocsSearch locale={locale} />
      <ul className={styles.cards}>
        {docsCategories.map((cat) => {
          const count = entries.filter(
            (e) => e.meta.category === cat.id,
          ).length;
          if (!count) return null;
          return (
            <li key={cat.id}>
              <Link href={`/${locale}/docs/${cat.id}`} className={styles.card}>
                <p className={styles.cardTitle}>
                  {fr ? cat.label_fr : cat.label_en}
                </p>
                <p className={styles.cardDesc}>
                  {fr ? cat.desc_fr : cat.desc_en}
                </p>
                <span className={styles.cardCount}>
                  {count} {fr ? "fiche(s)" : "page(s)"}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
