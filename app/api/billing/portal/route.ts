import { NextResponse, type NextRequest } from "next/server";
import { SITE_URL } from "@/lib/config";
import { defaultLocale, isLocale } from "@/lib/i18n/config";
import { getStripe } from "@/lib/billing/stripe";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Ouvre le portail de facturation Stripe (gérer/résilier l'abonnement).
export async function POST(request: NextRequest) {
  const form = await request.formData();
  const langRaw = form.get("lang");
  const lang = typeof langRaw === "string" && isLocale(langRaw) ? langRaw : defaultLocale;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(`${SITE_URL}/${lang}/login`, 303);
  }

  const { data } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data?.stripe_customer_id) {
    return NextResponse.redirect(`${SITE_URL}/${lang}/premium`, 303);
  }

  const session = await getStripe().billingPortal.sessions.create({
    customer: data.stripe_customer_id,
    return_url: `${SITE_URL}/${lang}/dashboard`,
  });

  return NextResponse.redirect(session.url, 303);
}
