import { notFound, redirect } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getCurrentUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { deleteAccountAction, signOutAction } from "@/lib/auth/actions";
import styles from "./dashboard.module.css";

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

  return (
    <div className={`container ${styles.page}`}>
      <h1 className={styles.title}>
        <span className="cli-header">~/dashboard</span>
        <br />
        {t("nav.dashboard")}
      </h1>

      <p className={styles.who}>
        <span className="prompt" />
        {user.email}
      </p>

      {/* La vue de progression complète arrive au Lot 4. */}
      <p className={styles.todo}>
        {locale === "fr"
          ? "Ta progression s'affichera ici."
          : "Your progress will appear here."}
      </p>

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
