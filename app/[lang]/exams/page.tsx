import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { listExams } from "@/lib/exams/source";
import { durationMinutes } from "@/lib/exams/config";
import { trackLabel } from "@/lib/content/tracks";
import { getCurrentUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import styles from "./exams.module.css";

// Réservé aux inscrits, rendu dynamique (lit la session + tire l'aperçu).
export const dynamic = "force-dynamic";

export default async function ExamsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const t = getDictionary(locale);

  if (isSupabaseConfigured()) {
    const user = await getCurrentUser();
    if (!user) redirect(`/${locale}/signup`);
  }

  const exams = await listExams();

  return (
    <div className={`container ${styles.page}`}>
      <h1 className={styles.title}>
        <span className="cli-header">~/examens-blancs</span>
        <br />
        {t("exam.title")}
      </h1>
      <p className={styles.intro}>{t("exam.intro")}</p>

      {exams.length === 0 ? (
        <p className={styles.empty}>{t("exam.empty")}</p>
      ) : (
        <ul className={styles.list}>
          {exams.map(({ track, params: p, poolSize, guideCount }) => (
            <li key={track.id}>
              <Link href={`/${locale}/exams/${track.id}`} className={styles.card}>
                <div className={styles.cardHead}>
                  <span className={styles.trackName}>
                    {trackLabel(track, locale)}
                  </span>
                  {track.cert ? (
                    <span className={styles.cert}>{track.cert}</span>
                  ) : null}
                </div>
                <div className={styles.stats}>
                  <span>
                    <strong>{p.questionCount}</strong> {t("exam.questions")}
                    {poolSize > p.questionCount ? (
                      <em className={styles.pool}> / {poolSize}</em>
                    ) : null}
                  </span>
                  <span aria-hidden>·</span>
                  <span>
                    <strong>{durationMinutes(p.durationSec)}</strong>{" "}
                    {t("exam.minutes")}
                  </span>
                  <span aria-hidden>·</span>
                  <span>
                    ≥ <strong>{p.passPct}%</strong> {t("exam.pass")}
                  </span>
                  <span aria-hidden>·</span>
                  <span>
                    {guideCount} {t("exam.guidesCovered")}
                  </span>
                </div>
                <span className={styles.startCta}>{t("exam.start")} →</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
