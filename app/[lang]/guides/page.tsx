import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getGuidesByTrack } from "@/lib/content/source";
import { trackLabel } from "@/lib/content/tracks";
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

  const groups = await getGuidesByTrack();

  return (
    <div className={`container ${styles.page}`}>
      <h1 className={styles.title}>
        <span className="cli-header">~/parcours</span>
        <br />
        {t("home.path.title")}
      </h1>

      <div className={styles.tracks}>
        {groups.map((group) => {
          const done = group.guides.filter(
            (g) => g.status === "published",
          ).length;
          return (
            <details key={group.track.id} className={styles.track} open>
              <summary className={styles.trackHead}>
                <span className={styles.trackName}>
                  {trackLabel(group.track, locale)}
                </span>
                {group.track.cert ? (
                  <span className={styles.cert}>{group.track.cert}</span>
                ) : null}
                <span className={styles.trackCount}>
                  {done}/{group.guides.length}
                </span>
              </summary>

              <ol className={styles.list}>
                {group.guides.map((g) => {
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
                        ) : g.access === "premium" ? (
                          <span className={styles.premium}>★ premium</span>
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
            </details>
          );
        })}
      </div>
    </div>
  );
}
