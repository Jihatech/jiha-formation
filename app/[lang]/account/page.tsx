import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { AuthForm } from "@/components/auth/auth-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

// Atterrissage du lien « mot de passe oublié » : la session vient d'être ouverte
// par /auth/callback, l'étudiant choisit ici son nouveau mot de passe.
export const dynamic = "force-dynamic";

export const metadata: Metadata = { robots: { index: false } };

export default async function AccountPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;

  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect(`/${locale}/reset`);
  }

  return <AuthForm mode="update" locale={locale} />;
}
