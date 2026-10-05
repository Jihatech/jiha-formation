import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Accès aux données de la couche « cohorte pilote » (Phase 2).
// Lecture via le client serveur authentifié ; la RLS garantit que chacun ne
// voit que ses propres inscriptions/tâches/docs, et les cohortes/plan en lecture.

export interface Cohort {
  id: string;
  slug: string;
  titleFr: string;
  titleEn: string;
  startDate: string | null;
  durationDays: number;
  discordInviteUrl: string | null;
  status: string;
}

export interface CohortDay {
  id: string;
  dayIndex: number;
  titleFr: string;
  titleEn: string;
  guideIds: string[];
}

export interface Enrollment {
  id: string;
  role: string;
  joinedAt: string;
}

/** La cohorte ouverte/en cours la plus récente (ou null). */
export async function getOpenCohort(): Promise<Cohort | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("cohorts")
    .select(
      "id, slug, title_fr, title_en, start_date, duration_days, discord_invite_url, status",
    )
    .in("status", ["open", "running"])
    .order("start_date", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data) return null;
  return {
    id: data.id,
    slug: data.slug,
    titleFr: data.title_fr,
    titleEn: data.title_en,
    startDate: data.start_date,
    durationDays: data.duration_days,
    discordInviteUrl: data.discord_invite_url,
    status: data.status,
  };
}

/** Plan jour-par-jour d'une cohorte, ordonné. */
export async function getCohortDays(cohortId: string): Promise<CohortDay[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("cohort_days")
    .select("id, day_index, title_fr, title_en, guide_ids")
    .eq("cohort_id", cohortId)
    .order("day_index", { ascending: true });
  return (data ?? []).map((d) => ({
    id: d.id,
    dayIndex: d.day_index,
    titleFr: d.title_fr,
    titleEn: d.title_en,
    guideIds: d.guide_ids ?? [],
  }));
}

/** Inscription de l'utilisateur courant à une cohorte (ou null). */
export async function getEnrollment(
  cohortId: string,
): Promise<Enrollment | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("enrollments")
    .select("id, role, joined_at")
    .eq("cohort_id", cohortId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!data) return null;
  return { id: data.id, role: data.role, joinedAt: data.joined_at };
}

/**
 * Jour courant de la cohorte pour l'utilisateur, calculé depuis la date de
 * début (jour 1 = startDate). 0 = pas encore commencé ; borné à durationDays.
 */
export function currentDayIndex(cohort: Cohort, now = new Date()): number {
  if (!cohort.startDate) return 0;
  const start = new Date(cohort.startDate + "T00:00:00Z").getTime();
  const today = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );
  if (today < start) return 0;
  const diffDays = Math.floor((today - start) / 86_400_000) + 1;
  return Math.min(diffDays, cohort.durationDays);
}
