import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// État d'abonnement tel que lu depuis la table `subscriptions` (RLS : sa ligne).
export interface SubscriptionState {
  status: string | null;
  priceId: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId: string | null;
}

// Statuts Stripe considérés comme « accès ouvert ».
const ACTIVE = new Set(["active", "trialing"]);

/** Ligne d'abonnement de l'utilisateur courant (ou null si aucune / non connecté). */
export async function getSubscription(): Promise<SubscriptionState | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("subscriptions")
    .select(
      "status, price_id, current_period_end, cancel_at_period_end, stripe_customer_id",
    )
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data) return null;
  return {
    status: data.status,
    priceId: data.price_id,
    currentPeriodEnd: data.current_period_end,
    cancelAtPeriodEnd: data.cancel_at_period_end ?? false,
    stripeCustomerId: data.stripe_customer_id,
  };
}

/** L'abonnement est-il actif (statut ouvert + période non expirée) ? */
export function isSubscriptionActive(sub: SubscriptionState | null): boolean {
  if (!sub?.status || !ACTIVE.has(sub.status)) return false;
  if (!sub.currentPeriodEnd) return true; // NULL = accès à vie / paiement unique
  return new Date(sub.currentPeriodEnd).getTime() > Date.now();
}

/** L'utilisateur courant a-t-il un accès premium actif ? */
export async function hasPremiumAccess(): Promise<boolean> {
  return isSubscriptionActive(await getSubscription());
}
