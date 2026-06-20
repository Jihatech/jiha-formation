import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getGuidesInOrder } from "@/lib/content/source";
import { getCurrentUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import styles from "./guides.module.css";

// Parcours réservé aux inscrits (rendu dynamique : lit la session).
export const dynamic = "force-dynamic";

export default async function GuidesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const t = getDictionary(locale);

  // Gating : le parcours n'est visible qu'après inscription (pousse à l'envie).
  if (isSupabaseConfigured()) {
    const user = await getCurrentUser();
    if (!user) redirect(`/${locale}/signup`);
  }

  const guides = await getGuidesInOrder();

  return (
    <div className={`container ${styles.page}`}>
      <h1 className={styles.title}>
        <span className="cli-header">~/parcours</span>
        <br />
        {t("home.path.title")}
      </h1>

      <ol className={styles.list}>
        {guides.map((g) => {
          const published = g.status === "published";
          const title = locale === "fr" ? g.title_fr : g.title_en;
          const tagline = locale === "fr" ? g.tagline_fr : g.tagline_en;
          const inner = (
            <>
              <div className={styles.cardHead}>
                <span className={styles.order}>
                  {String(g.order).padStart(2, "0")}
                </span>
                <span className={styles.level}>
                  {t(`guide.level.${g.level}`)} · {g.duration_min}{" "}
                  {t("guide.duration")}
                </span>
                {!published ? (
                  <span className={styles.soon}>{t("guide.soon")}</span>
                ) : null}
              </div>
              <h2 className={styles.cardTitle}>{title}</h2>
              <p className={styles.cardTagline}>{tagline}</p>
            </>
          );
          return (
            <li key={g.id}>
              {published ? (
                <Link
                  href={`/${locale}/guides/${g.slug}`}
                  className={styles.card}
                >
                  {inner}
                </Link>
              ) : (
                <div className={`${styles.card} ${styles.cardDisabled}`}>
                  {inner}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
