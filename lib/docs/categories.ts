// Catégories de la base de connaissances (/docs). L'id est stable (URL).
export interface DocsCategory {
  id: string;
  order: number;
  label_fr: string;
  label_en: string;
  desc_fr: string;
  desc_en: string;
}

export const docsCategories: DocsCategory[] = [
  {
    id: "linux",
    order: 1,
    label_fr: "Linux & CLI",
    label_en: "Linux & CLI",
    desc_fr: "Le socle : shell, permissions, processus, réseau.",
    desc_en: "The foundation: shell, permissions, processes, networking.",
  },
  {
    id: "git",
    order: 2,
    label_fr: "Git",
    label_en: "Git",
    desc_fr: "Versionner sans peur, réparer sans paniquer.",
    desc_en: "Version without fear, fix without panic.",
  },
  {
    id: "conteneurs",
    order: 3,
    label_fr: "Conteneurs",
    label_en: "Containers",
    desc_fr: "Docker et Compose au quotidien.",
    desc_en: "Docker and Compose, day to day.",
  },
  {
    id: "reverse-proxy",
    order: 4,
    label_fr: "Reverse proxy & HTTPS",
    label_en: "Reverse proxy & HTTPS",
    desc_fr: "Exposer ses services proprement, certificats compris.",
    desc_en: "Expose your services cleanly, certificates included.",
  },
];

export function getCategory(id: string): DocsCategory | undefined {
  return docsCategories.find((c) => c.id === id);
}
