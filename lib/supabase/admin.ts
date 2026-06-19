import "server-only";
import { createClient } from "@supabase/supabase-js";
import { supabaseServiceRoleKey, supabaseUrl } from "./env";

// Client à privilèges service_role — SERVEUR UNIQUEMENT, contourne la RLS.
// Réservé aux opérations d'admin (ex. suppression de compte RGPD).
export function createSupabaseAdminClient() {
  return createClient(supabaseUrl(), supabaseServiceRoleKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
