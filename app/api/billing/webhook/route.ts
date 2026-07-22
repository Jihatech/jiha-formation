import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/billing/stripe";
import { stripeWebhookSecret } from "@/lib/billing/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function unixToIso(secs: number | null | undefined): string | null {
  return typeof secs === "number" ? new Date(secs * 1000).toISOString() : null;
}

// La fin de période a migré vers les items d'abonnement selon la version d'API :
// on lit l'item en priorité, avec repli sur le champ historique de l'abonnement.
function periodEnd(sub: Stripe.Subscription): string | null {
  const item = sub.items.data[0] as unknown as { current_period_end?: number };
  const legacy = sub as unknown as { current_period_end?: number };
  return unixToIso(item?.current_period_end ?? legacy.current_period_end);
}

// Reflète l'état d'un abonnement Stripe dans la table `subscriptions`.
async function syncSubscription(sub: Stripe.Subscription): Promise<void> {
  const userId = sub.metadata?.supabase_user_id;
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const admin = createSupabaseAdminClient();

  const row = {
    stripe_subscription_id: sub.id,
    stripe_customer_id: customerId,
    status: sub.status,
    price_id: sub.items.data[0]?.price.id ?? null,
    current_period_end: periodEnd(sub),
    cancel_at_period_end: sub.cancel_at_period_end,
  };

  // On préfère la clé user_id (metadata) ; à défaut on rattache par customer.
  if (userId) {
    await admin
      .from("subscriptions")
      .upsert({ user_id: userId, ...row }, { onConflict: "user_id" });
  } else {
    await admin.from("subscriptions").update(row).eq("stripe_customer_id", customerId);
  }
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");
  if (!sig) return new NextResponse("Missing signature", { status: 400 });

  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, stripeWebhookSecret());
  } catch (err) {
    const msg = err instanceof Error ? err.message : "invalid";
    return new NextResponse(`Webhook signature verification failed: ${msg}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        if (session.mode === "subscription" && session.subscription) {
          const id =
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription.id;
          const sub = await stripe.subscriptions.retrieve(id);
          // Garantit la liaison user_id même si le customer n'était pas encore mappé.
          if (!sub.metadata?.supabase_user_id && session.client_reference_id) {
            sub.metadata = { ...sub.metadata, supabase_user_id: session.client_reference_id };
          }
          await syncSubscription(sub);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        await syncSubscription(event.data.object);
        break;
      }
      default:
        break;
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "handler error";
    return new NextResponse(`Handler error: ${msg}`, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
