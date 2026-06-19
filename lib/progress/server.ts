import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ManifestGuide } from "@/lib/content/source";

export type GuideStatus = "not-started" | "in_progress" | "completed";

// Statuts « niveau guide » (step_id NULL) de l'utilisateur courant. RLS → ses lignes.
export async function getGuideStatuses(): Promise<Map<string, GuideStatus>> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Map();

  const { data } = await supabase
    .from("progress")
    .select("guide_id,status")
    .is("step_id", null);

  const map = new Map<string, GuideStatus>();
  for (const row of data ?? []) {
    map.set(row.guide_id, row.status as GuideStatus);
  }
  return map;
}

// Prochain guide recommandé : premier publié, non terminé, dont les prérequis
// sont tous terminés (parcours linéaire vérifié — PLATFORM-SPEC §3.3).
export function nextRecommended(
  guides: ManifestGuide[],
  statuses: Map<string, GuideStatus>,
): ManifestGuide | null {
  for (const g of guides) {
    if (g.status !== "published") continue;
    if (statuses.get(g.id) === "completed") continue;
    const prereqsMet = (g.prerequisites ?? []).every(
      (id) => statuses.get(id) === "completed",
    );
    if (prereqsMet) return g;
  }
  return null;
}
