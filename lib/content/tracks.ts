// Registre des filières (tracks) du parcours.
// La STRUCTURE (quel guide → quelle filière) vit dans guides.json (champ `track`,
// PLATFORM-SPEC §2). Ici on ne tient que la PRÉSENTATION : ordre d'affichage,
// libellés bilingues et badge de certification. Aucune donnée de contenu.

export interface TrackMeta {
  id: string;
  label_fr: string;
  label_en: string;
  /** Badge de certification associé, ex. "AZ-900". Absent = filière sans certif. */
  cert?: string;
}

// Ordre = progression pédagogique du parcours (des fondamentaux au cloud avancé).
export const TRACKS: TrackMeta[] = [
  { id: "cli-linux", label_fr: "Ligne de commande & Linux", label_en: "Command line & Linux" },
  { id: "git", label_fr: "Git", label_en: "Git" },
  { id: "docker", label_fr: "Docker & conteneurs", label_en: "Docker & containers" },
  { id: "cicd", label_fr: "Intégration continue (CI/CD)", label_en: "Continuous integration (CI/CD)" },
  { id: "ansible", label_fr: "Ansible", label_en: "Ansible" },
  { id: "terraform", label_fr: "Terraform", label_en: "Terraform" },
  { id: "kubernetes", label_fr: "Kubernetes", label_en: "Kubernetes" },
  { id: "homelab", label_fr: "Homelab & auto-hébergement", label_en: "Homelab & self-hosting" },
  { id: "aws", label_fr: "AWS", label_en: "AWS" },
  { id: "gcp", label_fr: "Google Cloud (GCP)", label_en: "Google Cloud (GCP)" },
  { id: "azure-az900", label_fr: "Azure — Fondamentaux", label_en: "Azure — Fundamentals", cert: "AZ-900" },
  { id: "azure-az104", label_fr: "Azure — Administration", label_en: "Azure — Administration", cert: "AZ-104" },
  { id: "azure-az305", label_fr: "Azure — Architecture", label_en: "Azure — Architecture", cert: "AZ-305" },
  { id: "azure-az400", label_fr: "Azure — DevOps", label_en: "Azure — DevOps", cert: "AZ-400" },
  { id: "azure-az500", label_fr: "Azure — Sécurité", label_en: "Azure — Security", cert: "AZ-500" },
  { id: "azure-az700", label_fr: "Azure — Réseau", label_en: "Azure — Networking", cert: "AZ-700" },
];

export const TRACK_ORDER: Record<string, number> = Object.fromEntries(
  TRACKS.map((t, i) => [t.id, i]),
);

export const TRACK_BY_ID: Record<string, TrackMeta> = Object.fromEntries(
  TRACKS.map((t) => [t.id, t]),
);

export function trackLabel(t: TrackMeta, locale: "fr" | "en"): string {
  return locale === "fr" ? t.label_fr : t.label_en;
}
