"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n/config";
import { signOutAction } from "@/lib/auth/actions";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

// Lien d'en-tête qui reflète la session : « Connexion » pour un visiteur,
// « Déconnexion » pour un étudiant connecté. Composant client pour que l'en-tête
// (rendu dans le layout statique) n'oblige pas toutes les pages à être dynamiques.
export function AuthNav({
  locale,
  loginLabel,
  logoutLabel,
}: {
  locale: Locale;
  loginLabel: string;
  logoutLabel: string;
}) {
  const [authed, setAuthed] = useState(false);
  // La connexion/déconnexion passe par des actions serveur : l'en-tête reste
  // monté, donc on relit la session à chaque changement de page.
  const pathname = usePathname();

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createSupabaseBrowserClient();
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) setAuthed(Boolean(data.session));
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthed(Boolean(session));
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [pathname]);

  if (!authed) return <Link href={`/${locale}/login`}>{loginLabel}</Link>;

  return (
    <form action={signOutAction} style={{ display: "inline" }}>
      <input type="hidden" name="lang" value={locale} />
      <button
        type="submit"
        style={{
          background: "none",
          border: 0,
          padding: 0,
          font: "inherit",
          color: "inherit",
          cursor: "pointer",
        }}
      >
        {logoutLabel}
      </button>
    </form>
  );
}
