import type { GuideQuiz } from "./types";
import artOfCommandLine from "./data/art-of-command-line.json";
import gitFondamentaux from "./data/git-fondamentaux.json";
import dockerFondamentaux from "./data/docker-fondamentaux.json";
import dockerCompose from "./data/docker-compose.json";
import traefik from "./data/traefik.json";
import vaultwarden from "./data/vaultwarden.json";
import immich from "./data/immich.json";
import monitoring from "./data/monitoring.json";

// Registre des quiz par guide_id (id stable du manifeste). Les guides sans quiz
// dégradent en « confirmation d'étape » séquentielle côté UI.
// TODO (source unique) : à terme, migrer les questions dans les fichiers-guides
// de JIHA-Learn (nouvelle directive du template) plutôt qu'ici.
const registry: Record<string, GuideQuiz> = {
  "art-of-command-line": artOfCommandLine as GuideQuiz,
  "git-fondamentaux": gitFondamentaux as GuideQuiz,
  "docker-fondamentaux": dockerFondamentaux as GuideQuiz,
  "docker-compose": dockerCompose as GuideQuiz,
  traefik: traefik as GuideQuiz,
  vaultwarden: vaultwarden as GuideQuiz,
  immich: immich as GuideQuiz,
  monitoring: monitoring as GuideQuiz,
};

export function getGuideQuiz(guideId: string): GuideQuiz | null {
  return registry[guideId] ?? null;
}
