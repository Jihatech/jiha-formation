"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Rejoindre une cohorte : insère l'inscription de l'utilisateur courant.
// La RLS impose user_id = auth.uid() (with check), donc aucune usurpation possible.
export async function joinCohort(formData: FormData) {
  const cohortId = String(formData.get("cohortId") ?? "");
  const locale = String(formData.get("locale") ?? "fr");
  if (!cohortId) return;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("enrollments")
    .insert({ cohort_id: cohortId, user_id: user.id })
    .select()
    .maybeSingle();

  revalidatePath(`/${locale}/pilote`);
}
