import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getCurrentUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  getOpenCohort,
  getCohortDays,
  getEnrollment,
  currentDayIndex,
} from "@/lib/pilote/source";
import { joinCohort } from "./actions";
import styles from "./pilote.module.css";

// Lit la session (cookies) → rendu dynamique obligatoire.
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Cohorte — jiha.tech" };

const COPY = {
  fr: {
    title: "Cohorte DevOps en local",
    intro:
      "Le programme complet en autonomie, 100 % sur ta machine, avec un cadre : plan jour-par-jour, groupe Discord et point hebdo.",
    noCohort: "Aucune cohorte ouverte pour le moment. Reviens bientôt !",
    starts: "Démarre le",
    days: "jours",
    join: "Rejoindre la cohorte",
    joinedOn: "Inscrit·e depuis le",
    notStarted: "La cohorte n'a pas encore commencé",
    dayOf: "Jour",
    of: "sur",
    discord: "Groupe Discord",
    discordOpen: "Ouvrir le Discord de la cohorte",
    discordSoon: "Le lien Discord sera communiqué au démarrage.",
    discordLocked: "Rejoins la cohorte pour accéder au groupe Discord.",
    plan: "Plan jour-par-jour",
    day: "Jour",
    locked: "à venir",
    today: "en cours",
    done: "passé",
    guides: "Guides",
    soon: "Bientôt",
    soonItems: [
      "Mes tâches (Kanban) — à venir",
      "Check-in hebdomadaire — à venir",
      "Mes documents (rendus de projet) — à venir",
    ],
    whatYouGet: "Ce que tu obtiens",
    bullets: [
      "Un plan jour-par-jour sur 45 jours, adossé au catalogue.",
      "L'accès au groupe Discord de la promo.",
      "Un point hebdomadaire pour garder le cap.",
      "Un suivi de tes tâches et de tes rendus.",
    ],
  },
  en: {
    title: "DevOps-locally cohort",
    intro:
      "The full program, self-paced, 100% on your machine, with a frame: day-by-day plan, Discord group and a weekly check-in.",
    noCohort: "No open cohort right now. Check back soon!",
    starts: "Starts",
    days: "days",
    join: "Join the cohort",
    joinedOn: "Enrolled since",
    notStarted: "The cohort hasn't started yet",
    dayOf: "Day",
    of: "of",
    discord: "Discord group",
    discordOpen: "Open the cohort Discord",
    discordSoon: "The Discord link will be shared at kickoff.",
    discordLocked: "Join the cohort to access the Discord group.",
    plan: "Day-by-day plan",
    day: "Day",
    locked: "upcoming",
    today: "current",
    done: "past",
    guides: "Guides",
    soon: "Soon",
    soonItems: [
      "My tasks (Kanban) — coming soon",
      "Weekly check-in — coming soon",
      "My documents (project write-ups) — coming soon",
    ],
    whatYouGet: "What you get",
    bullets: [
      "A 45-day day-by-day plan, backed by the catalog.",
      "Access to the cohort's Discord group.",
      "A weekly check-in to stay on track.",
      "Tracking of your tasks and write-ups.",
    ],
  },
} as const;

export default async function PilotePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const c = COPY[locale];
  const fr = locale === "fr";

  // La cohorte vit derrière l'auth (données Supabase par utilisateur).
  // Sans Supabase configuré (ex. build local), on n'appelle rien et on affiche l'état vide.
  const configured = isSupabaseConfigured();
  if (configured) {
    const user = await getCurrentUser();
    if (!user) redirect(`/${locale}/login`);
  }

  const cohort = configured ? await getOpenCohort() : null;

  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.hero}>
        <span className="cli-header">§ cohorte</span>
        <h1 className={styles.title}>{c.title}</h1>
        <p className={styles.intro}>{c.intro}</p>
      </header>

      {!cohort ? (
        <p className={styles.empty}>{c.noCohort}</p>
      ) : (
        <PiloteBody cohort={cohort} locale={locale} c={c} fr={fr} />
      )}
    </div>
  );
}

async function PiloteBody({
  cohort,
  locale,
  c,
  fr,
}: {
  cohort: Awaited<ReturnType<typeof getOpenCohort>> & object;
  locale: Locale;
  c: (typeof COPY)[Locale];
  fr: boolean;
}) {
  const [days, enrollment] = await Promise.all([
    getCohortDays(cohort.id),
    getEnrollment(cohort.id),
  ]);
  const current = currentDayIndex(cohort);
  // Jalon « actif » = le dernier jour planifié atteint (dayIndex <= jour courant).
  const activeDay =
    enrollment && current > 0
      ? Math.max(
          0,
          ...days.filter((d) => d.dayIndex <= current).map((d) => d.dayIndex),
        )
      : 0;
  const title = fr ? cohort.titleFr : cohort.titleEn;
  const startLabel = cohort.startDate
    ? new Date(cohort.startDate + "T00:00:00Z").toLocaleDateString(locale, {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      })
    : null;

  return (
    <>
      <section className={styles.card}>
        <div className={styles.cohortHead}>
          <h2 className={styles.cohortTitle}>{title}</h2>
          <span className={styles.badge}>
            {cohort.durationDays} {c.days}
          </span>
        </div>
        {startLabel ? (
          <p className={styles.meta}>
            {c.starts} <strong>{startLabel}</strong>
          </p>
        ) : null}

        {enrollment ? (
          <p className={styles.dayBanner}>
            {current > 0
              ? `${c.dayOf} ${current} ${c.of} ${cohort.durationDays}`
              : c.notStarted}
          </p>
        ) : (
          <form action={joinCohort} className={styles.joinForm}>
            <input type="hidden" name="cohortId" value={cohort.id} />
            <input type="hidden" name="locale" value={locale} />
            <button type="submit" className="btn btn--primary">
              {c.join} →
            </button>
          </form>
        )}
      </section>

      {!enrollment ? (
        <section className={styles.card}>
          <h3 className="cli-header">{c.whatYouGet}</h3>
          <ul className={styles.bullets}>
            {c.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Discord */}
      <section className={styles.card}>
        <h3 className="cli-header">{c.discord}</h3>
        {!enrollment ? (
          <p className={styles.muted}>{c.discordLocked}</p>
        ) : cohort.discordInviteUrl ? (
          <a
            className="btn btn--primary"
            href={cohort.discordInviteUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {c.discordOpen} →
          </a>
        ) : (
          <p className={styles.muted}>{c.discordSoon}</p>
        )}
      </section>

      {/* Plan jour-par-jour */}
      <section className={styles.card}>
        <h3 className="cli-header">{c.plan}</h3>
        <ol className={styles.plan}>
          {days.map((d) => {
            const state =
              !enrollment || current === 0 || d.dayIndex > current
                ? "locked"
                : d.dayIndex === activeDay
                  ? "today"
                  : "done";
            return (
              <li key={d.id} className={`${styles.planItem} ${styles[state]}`}>
                <span className={styles.planDay}>
                  {c.day} {d.dayIndex}
                </span>
                <div className={styles.planMain}>
                  <span className={styles.planTitle}>
                    {fr ? d.titleFr : d.titleEn}
                  </span>
                  {d.guideIds.length ? (
                    <span className={styles.planGuides}>
                      {d.guideIds.map((g) =>
                        state === "locked" ? (
                          <span key={g} className={styles.guideChipLocked}>
                            {g}
                          </span>
                        ) : (
                          <Link
                            key={g}
                            href={`/${locale}/guides/${g}`}
                            className={styles.guideChip}
                          >
                            {g}
                          </Link>
                        ),
                      )}
                    </span>
                  ) : null}
                </div>
                <span className={styles.planState}>
                  {state === "locked"
                    ? c.locked
                    : state === "today"
                      ? c.today
                      : c.done}
                </span>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Briques à venir (incréments suivants) */}
      {enrollment ? (
        <section className={styles.card}>
          <h3 className="cli-header">{c.soon}</h3>
          <ul className={styles.soon}>
            {c.soonItems.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}
