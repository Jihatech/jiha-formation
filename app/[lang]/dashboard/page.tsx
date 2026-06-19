import { notFound, redirect } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import Link from "next/link";
import { getCurrentUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { deleteAccountAction, signOutAction } from "@/lib/auth/actions";
import { getGuidesInOrder } from "@/lib/content/source";
import {
  getGuideStatuses,
  nextRecommended,
  type GuideStatus,
} from "@/lib/progress/server";
import styles from "./dashboard.module.css";

const STATUS_LABEL: Record<GuideStatus, { fr: string; en: string }> = {
  "not-started": { fr: "non commencé", en: "not started" },
  in_progress: { fr: "en cours", en: "in progress" },
  completed: { fr: "terminé", en: "completed" },
};

// Protégé : rendu dynamique (lit la session). Les pages de contenu restent SSG.
export const dynamic = "force-dynamic";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const t = getDictionary(locale);

  if (!isSupabaseConfigured()) {
    return (
      <div className={`container ${styles.page}`}>
        <p className="mono">Supabase non configuré (voir .env.example).</p>
      </div>
    );
  }

  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/login`);

  const guides = await getGuidesInOrder();
  const statuses = await getGuideStatuses();
  const next = nextRecommended(guides, statuses);
  const completedCount = guides.filter(
    (g) => statuses.get(g.id) === "completed",
  ).length;
  const publishedCount = guides.filter((g) => g.status === "published").length;

  return (
    <div className={`container ${styles.page}`}>
      <h1 className={styles.title}>
        <span className="cli-header">~/dashboard</span>
        <br />
        {t("nav.dashboard")}
      </h1>

      <p className={styles.who}>
        <span className="prompt" />
        {user.email} · {completedCount}/{publishedCount}{" "}
        {locale === "fr" ? "guides terminés" : "guides completed"}
      </p>

      {next ? (
        <Link href={`/${locale}/guides/${next.slug}`} className={styles.next}>
          <span className="cli-header">
            {locale === "fr" ? "Prochain guide" : "Next guide"}
          </span>
          <strong>{locale === "fr" ? next.title_fr : next.title_en}</strong>
          <span className={styles.nextArrow}>→</span>
        </Link>
      ) : null}

      <ol className={styles.parcours}>
        {guides.map((g) => {
          const status: GuideStatus =
            statuses.get(g.id) ?? "not-started";
          const published = g.status === "published";
          const title = locale === "fr" ? g.title_fr : g.title_en;
          return (
            <li
              key={g.id}
              className={`${styles.row} ${styles[`row_${status.replace("-", "")}`] ?? ""}`}
            >
              <span className={styles.rowOrder}>
                {String(g.order).padStart(2, "0")}
              </span>
              {published ? (
                <Link href={`/${locale}/guides/${g.slug}`}>{title}</Link>
              ) : (
                <span className={styles.rowSoon}>
                  {title} · {t("guide.soon")}
                </span>
              )}
              <span className={`${styles.badge} ${styles[`badge_${status.replace("-", "")}`]}`}>
                {STATUS_LABEL[status][locale]}
              </span>
            </li>
          );
        })}
      </ol>

      <div className={styles.actions}>
        <form action={signOutAction}>
          <input type="hidden" name="lang" value={locale} />
          <button type="submit">{t("nav.logout")}</button>
        </form>

        <form action={deleteAccountAction}>
          <input type="hidden" name="lang" value={locale} />
          <button type="submit" className={styles.danger}>
            {locale === "fr"
              ? "Supprimer mon compte et mes données"
              : "Delete my account and data"}
          </button>
        </form>
      </div>
    </div>
  );
}
