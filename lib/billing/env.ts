// Accès centralisé aux variables Stripe. Lecture paresseuse (comme lib/supabase/env) :
// pas d'exception à l'import — le build passe sans clés ; l'erreur survient à l'usage.

export function stripeSecretKey(): string {
  const v = process.env.STRIPE_SECRET_KEY;
  if (!v) throw new Error("STRIPE_SECRET_KEY manquante");
  return v;
}

export function stripeWebhookSecret(): string {
  const v = process.env.STRIPE_WEBHOOK_SECRET;
  if (!v) throw new Error("STRIPE_WEBHOOK_SECRET manquante");
  return v;
}

// Prix Stripe pour chaque cadence d'abonnement (définis dans le dashboard Stripe).
export function stripePriceId(plan: BillingPlan): string {
  const key = plan === "annual" ? "STRIPE_PRICE_ANNUAL" : "STRIPE_PRICE_MONTHLY";
  const v = process.env[key];
  if (!v) throw new Error(`${key} manquante`);
  return v;
}

export type BillingPlan = "monthly" | "annual";

export function isBillingPlan(v: string | null): v is BillingPlan {
  return v === "monthly" || v === "annual";
}

// La facturation est-elle configurée ? (pour dégrader l'UI proprement.)
export function isStripeConfigured(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY &&
      (process.env.STRIPE_PRICE_MONTHLY || process.env.STRIPE_PRICE_ANNUAL),
  );
}
