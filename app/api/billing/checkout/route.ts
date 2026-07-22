import { NextResponse, type NextRequest } from "next/server";
import { SITE_URL } from "@/lib/config";
import { defaultLocale, isLocale } from "@/lib/i18n/config";
import { getStripe } from "@/lib/billing/stripe";
import { isBillingPlan, stripePriceId } from "@/lib/billing/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Ouvre une session Stripe Checkout (abonnement) pour l'utilisateur connecté.
// Appelé en POST depuis un <form> : on répond par une redirection 303 vers Stripe.
export async function POST(request: NextRequest) {
  const form = await request.formData();
  const planRaw = form.get("plan");
  const langRaw = form.get("lang");
  const lang = typeof langRaw === "string" && isLocale(langRaw) ? langRaw : defaultLocale;
  const plan = typeof planRaw === "string" && isBillingPlan(planRaw) ? planRaw : "monthly";

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(`${SITE_URL}/${lang}/login?next=/${lang}/premium`, 303);
  }

  const stripe = getStripe();

  // Retrouve (ou crée) le client Stripe rattaché à cet utilisateur.
  const { data: existing } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  let customerId = existing?.stripe_customer_id ?? null;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? undefined,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;
    // Pré-enregistre la liaison user↔customer (écriture service_role, hors RLS).
    await createSupabaseAdminClient()
      .from("subscriptions")
      .upsert({ user_id: user.id, stripe_customer_id: customerId }, { onConflict: "user_id" });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: stripePriceId(plan), quantity: 1 }],
    client_reference_id: user.id,
    subscription_data: { metadata: { supabase_user_id: user.id } },
    allow_promotion_codes: true,
    success_url: `${SITE_URL}/${lang}/dashboard?checkout=success`,
    cancel_url: `${SITE_URL}/${lang}/premium?checkout=cancel`,
  });

  if (!session.url) {
    return NextResponse.redirect(`${SITE_URL}/${lang}/premium?checkout=error`, 303);
  }
  return NextResponse.redirect(session.url, 303);
}
