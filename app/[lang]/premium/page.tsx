import { notFound } from "next/navigation";
import Link from "next/link";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { isStripeConfigured, stripePriceId, type BillingPlan } from "@/lib/billing/env";
import { getStripe } from "@/lib/billing/stripe";
import { hasPremiumAccess } from "@/lib/billing/access";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import styles from "./premium.module.css";

// Lit la session + interroge Stripe → rendu dynamique.
export const dynamic = "force-dynamic";

const COPY = {
  fr: {
    kicker: "~/premium",
    title: "Débloque tout le parcours",
    subtitle:
      "Un abonnement, tous les guides hands-on, les QCM de validation et le suivi de progression.",
    perks: [
      "Tous les guides du parcours, présents et à venir",
      "QCM séquentiels et progression validée par étape",
      "Dashboard : reprise, prochain guide, prérequis vérifiés",
    ],
    cta: "S'abonner",
    already: "Tu es déjà premium 🎉",
    manage: "Gérer mon abonnement",
    goDash: "Aller au dashboard →",
    soon: "Abonnement bientôt disponible.",
    perMonth: "/ mois",
    perYear: "/ an",
    monthly: "Mensuel",
    annual: "Annuel",
    bestValue: "Meilleur prix",
  },
  en: {
    kicker: "~/premium",
    title: "Unlock the whole track",
    subtitle:
      "One subscription, every hands-on guide, the validation quizzes and progress tracking.",
    perks: [
      "Every guide in the track, now and upcoming",
      "Sequential quizzes and step-validated progress",
      "Dashboard: resume, next guide, checked prerequisites",
    ],
    cta: "Subscribe",
    already: "You're already premium 🎉",
    manage: "Manage my subscription",
    goDash: "Go to dashboard →",
    soon: "Subscription coming soon.",
    perMonth: "/ mo",
    perYear: "/ yr",
    monthly: "Monthly",
    annual: "Annual",
    bestValue: "Best value",
  },
} as const;

interface PlanView {
  plan: BillingPlan;
  amount: string | null;
}

// Récupère le montant affichable de chaque prix depuis Stripe (source de vérité).
async function loadPlans(locale: Locale): Promise<PlanView[] | null> {
  if (!isStripeConfigured()) return null;
  const stripe = getStripe();
  const plans: BillingPlan[] = ["monthly", "annual"];
  try {
    return await Promise.all(
      plans.map(async (plan) => {
        const price = await stripe.prices.retrieve(stripePriceId(plan));
        const amount =
          price.unit_amount != null
            ? new Intl.NumberFormat(locale, {
                style: "currency",
                currency: price.currency.toUpperCase(),
                maximumFractionDigits: price.unit_amount % 100 === 0 ? 0 : 2,
              }).format(price.unit_amount / 100)
            : null;
        return { plan, amount };
      }),
    );
  } catch {
    return null; // prix mal configurés → on dégrade sans casser la page
  }
}

export default async function PremiumPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const c = COPY[locale];

  const alreadyPremium = isSupabaseConfigured() ? await hasPremiumAccess() : false;
  const plans = await loadPlans(locale);

  return (
    <div className={`container ${styles.page}`}>
      <h1 className={styles.title}>
        <span className="cli-header">{c.kicker}</span>
        <br />
        {c.title}
      </h1>
      <p className={styles.subtitle}>{c.subtitle}</p>

      <ul className={styles.perks}>
        {c.perks.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>

      {alreadyPremium ? (
        <div className={styles.already}>
          <strong>{c.already}</strong>
          <div className={styles.alreadyActions}>
            <form action="/api/billing/portal" method="post">
              <input type="hidden" name="lang" value={locale} />
              <button type="submit" className="btn">
                {c.manage}
              </button>
            </form>
            <Link href={`/${locale}/dashboard`} className="btn btn--primary">
              {c.goDash}
            </Link>
          </div>
        </div>
      ) : plans ? (
        <div className={styles.plans}>
          {plans.map(({ plan, amount }) => (
            <form
              key={plan}
              action="/api/billing/checkout"
              method="post"
              className={`${styles.plan} ${plan === "annual" ? styles.planFeatured : ""}`}
            >
              <input type="hidden" name="plan" value={plan} />
              <input type="hidden" name="lang" value={locale} />
              <span className={styles.planName}>
                {plan === "annual" ? c.annual : c.monthly}
                {plan === "annual" ? (
                  <em className={styles.tag}>{c.bestValue}</em>
                ) : null}
              </span>
              <span className={styles.amount}>
                {amount ?? "—"}
                <small>{plan === "annual" ? c.perYear : c.perMonth}</small>
              </span>
              <button type="submit" className="btn btn--primary">
                {c.cta} →
              </button>
            </form>
          ))}
        </div>
      ) : (
        <p className={styles.soon}>{c.soon}</p>
      )}
    </div>
  );
}
