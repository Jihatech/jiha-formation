"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/config";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";

export interface AuthState {
  error?: string;
  message?: string;
}

function readLocale(formData: FormData): Locale {
  const lang = String(formData.get("lang") ?? "");
  return isLocale(lang) ? lang : defaultLocale;
}

export async function signInAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const locale = readLocale(formData);
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect(`/${locale}/dashboard`);
}

export async function signUpAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const locale = readLocale(formData);
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const consent = formData.get("consent") === "on";

  if (!consent) {
    return {
      error:
        locale === "fr"
          ? "Le consentement est requis pour créer un compte."
          : "Consent is required to create an account.",
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { preferred_locale: locale, consent: "true" },
      emailRedirectTo: `${SITE_URL}/auth/callback?lang=${locale}&next=/${locale}/dashboard`,
    },
  });
  if (error) return { error: error.message };

  // Si la confirmation email est exigée, pas de session immédiate.
  if (!data.session) {
    return {
      message:
        locale === "fr"
          ? "Compte créé. Vérifie ta boîte mail pour confirmer ton adresse."
          : "Account created. Check your inbox to confirm your email.",
    };
  }

  revalidatePath("/", "layout");
  redirect(`/${locale}/dashboard`);
}

export async function requestResetAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const locale = readLocale(formData);
  const email = String(formData.get("email") ?? "").trim();

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    // Le lien de l'email ouvre une session via /auth/callback, puis /account
    // permet de choisir le nouveau mot de passe (updatePasswordAction).
    redirectTo: `${SITE_URL}/auth/callback?lang=${locale}&next=/${locale}/account`,
  });
  if (error) return { error: error.message };

  return {
    message:
      locale === "fr"
        ? "Si un compte existe, un email de réinitialisation a été envoyé."
        : "If an account exists, a reset email has been sent.",
  };
}

// Choix d'un nouveau mot de passe, après clic sur le lien de réinitialisation
// (la session a été ouverte par /auth/callback).
export async function updatePasswordAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const locale = readLocale(formData);
  const password = String(formData.get("password") ?? "");
  const fr = locale === "fr";
  if (password.length < 8) {
    return { error: fr ? "8 caractères minimum." : "At least 8 characters." };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      error: fr
        ? "Lien expiré. Redemande un email de réinitialisation."
        : "Link expired. Request a new reset email.",
    };
  }
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect(`/${locale}/dashboard`);
}

export async function signOutAction(formData: FormData): Promise<void> {
  const locale = readLocale(formData);
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect(`/${locale}`);
}

// Suppression de compte + données (RGPD §3.1). Appelle la fonction SQL
// security-definer delete_account() : supprime auth.users → cascade profiles/progress.
export async function deleteAccountAction(formData: FormData): Promise<void> {
  const locale = readLocale(formData);
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    await supabase.rpc("delete_account");
    await supabase.auth.signOut();
  }
  revalidatePath("/", "layout");
  redirect(`/${locale}`);
}
