import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import styles from "./paywall.module.css";

const COPY = {
  fr: {
    badge: "Guide premium",
    title: "Ce guide fait partie du parcours premium",
    body: "Débloque l'intégralité du parcours jiha.tech : tous les guides hands-on, les QCM de validation et le suivi de progression.",
    perks: [
      "Accès à tous les guides du parcours",
      "QCM séquentiels et progression validée",
      "Nouveaux guides ajoutés en continu",
    ],
    cta: "Passer premium",
    note: "Résiliable à tout moment.",
  },
  en: {
    badge: "Premium guide",
    title: "This guide is part of the premium track",
    body: "Unlock the full jiha.tech track: every hands-on guide, the validation quizzes and progress tracking.",
    perks: [
      "Access to every guide in the track",
      "Sequential quizzes and validated progress",
      "New guides added continuously",
    ],
    cta: "Go premium",
    note: "Cancel anytime.",
  },
} as const;

// Encart affiché à la place du corps d'un guide `premium` pour un utilisateur
// connecté sans abonnement actif. Le CTA renvoie vers la page d'upgrade.
export function Paywall({
  locale,
  guideSlug,
}: {
  locale: Locale;
  guideSlug: string;
}) {
  const c = COPY[locale];
  return (
    <section className={styles.paywall} aria-labelledby="paywall-title">
      <span className={styles.badge}>🔒 {c.badge}</span>
      <h2 id="paywall-title" className={styles.title}>
        {c.title}
      </h2>
      <p className={styles.body}>{c.body}</p>
      <ul className={styles.perks}>
        {c.perks.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
      <Link
        href={`/${locale}/premium?from=${encodeURIComponent(guideSlug)}`}
        className="btn btn--primary"
      >
        {c.cta} →
      </Link>
      <p className={styles.note}>{c.note}</p>
    </section>
  );
}
