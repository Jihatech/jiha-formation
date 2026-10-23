import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { SITE_URL } from "@/lib/config";
import { legal } from "@/lib/legal/config";
import {
  getLegalDoc,
  isLegalPage,
  legalLabels,
  legalPages,
} from "@/lib/legal/content";
import styles from "./legal.module.css";

// Pages statiques : tout vient de lib/legal (aucune donnée de session).
export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((lang) => legalPages.map((page) => ({ lang, page })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; page: string }>;
}): Promise<Metadata> {
  const { lang, page } = await params;
  if (!isLocale(lang) || !isLegalPage(page)) return {};
  const doc = getLegalDoc(lang, page);
  const path = (l: string) => `${SITE_URL}/${l}/legal/${page}`;
  return {
    title: `${doc.title} — jiha.tech`,
    description: doc.description,
    alternates: {
      canonical: path(lang),
      languages: { fr: path("fr"), en: path("en") },
    },
  };
}

export default async function LegalPageView({
  params,
}: {
  params: Promise<{ lang: string; page: string }>;
}) {
  const { lang, page } = await params;
  if (!isLocale(lang) || !isLegalPage(page)) notFound();
  const locale = lang as Locale;
  const doc = getLegalDoc(locale, page);
  const fr = locale === "fr";

  return (
    <div className={`container ${styles.page}`}>
      <p className={`mono ${styles.kicker}`}>~/legal/{page}</p>
      <h1 className={styles.title}>{doc.title}</h1>

      <nav className={styles.tabs} aria-label={fr ? "Pages légales" : "Legal pages"}>
        {legalPages.map((p) => (
          <Link
            key={p}
            href={`/${locale}/legal/${p}`}
            aria-current={p === page ? "page" : undefined}
            className={p === page ? styles.active : undefined}
          >
            {legalLabels[locale][p]}
          </Link>
        ))}
      </nav>

      {doc.sections.map((s) => (
        <section key={s.title} className={styles.section}>
          <h2>{s.title}</h2>
          {s.items && (
            <ul>
              {s.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
          {s.paragraphs?.map((para) => <p key={para}>{para}</p>)}
        </section>
      ))}

      <p className={styles.updated}>
        {fr ? "Dernière mise à jour : " : "Last updated: "}
        {legal.lastUpdated}
      </p>
    </div>
  );
}
