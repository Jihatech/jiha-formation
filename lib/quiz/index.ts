import type { GuideQuiz } from "./types";
import vaultwarden from "./data/vaultwarden.json";
import traefik from "./data/traefik.json";

// Registre des quiz par guide_id (id stable du manifeste). Les guides sans quiz
// dégradent en « confirmation d'étape » séquentielle côté UI.
// TODO (source unique) : à terme, migrer les questions dans les fichiers-guides
// de JIHA-Learn (nouvelle directive du template) plutôt qu'ici.
const registry: Record<string, GuideQuiz> = {
  vaultwarden: vaultwarden as GuideQuiz,
  traefik: traefik as GuideQuiz,
};

export function getGuideQuiz(guideId: string): GuideQuiz | null {
  return registry[guideId] ?? null;
}
