// Accès centralisé aux variables Supabase. Lecture paresseuse : pas d'exception
// à l'import (le build doit passer même sans .env.local ; l'erreur survient à l'usage).
export function supabaseUrl(): string {
  const v = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!v) throw new Error("NEXT_PUBLIC_SUPABASE_URL manquante");
  return v;
}

export function supabaseAnonKey(): string {
  const v = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!v) throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY manquante");
  return v;
}

export function supabaseServiceRoleKey(): string {
  const v = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!v) throw new Error("SUPABASE_SERVICE_ROLE_KEY manquante");
  return v;
}

// Indique si la config Supabase est présente (pour dégrader proprement l'UI).
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
