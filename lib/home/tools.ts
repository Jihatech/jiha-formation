import {
  siDocker,
  siGit,
  siGnubash,
  siGrafana,
  siImmich,
  siTraefikproxy,
  siVault,
} from "simple-icons";

export interface HomeTool {
  iconPath: string;
  name: string;
  desc_fr: string;
  desc_en: string;
}

// Outils/concepts vitrine de la home (logos monochromes, teintés au thème).
export const homeTools: HomeTool[] = [
  {
    iconPath: siGnubash.path,
    name: "Ligne de commande",
    desc_fr: "Bouger, inspecter, manipuler du texte, investiguer.",
    desc_en: "Move, inspect, manipulate text, investigate.",
  },
  {
    iconPath: siGit.path,
    name: "Git",
    desc_fr: "Du clone au workflow de pro.",
    desc_en: "From clone to a professional workflow.",
  },
  {
    iconPath: siDocker.path,
    name: "Docker",
    desc_fr: "Images, conteneurs, volumes, réseaux.",
    desc_en: "Images, containers, volumes, networks.",
  },
  {
    iconPath: siTraefikproxy.path,
    name: "Traefik",
    desc_fr: "Reverse proxy avec HTTPS automatique.",
    desc_en: "Reverse proxy with automatic HTTPS.",
  },
  {
    iconPath: siVault.path,
    name: "Vaultwarden",
    desc_fr: "Ton gestionnaire de mots de passe self-hosté.",
    desc_en: "Your self-hosted password manager.",
  },
  {
    iconPath: siImmich.path,
    name: "Immich",
    desc_fr: "Ton Google Photos auto-hébergé.",
    desc_en: "Your self-hosted Google Photos.",
  },
  {
    iconPath: siGrafana.path,
    name: "Monitoring",
    desc_fr: "Prometheus + Grafana : métriques & alertes.",
    desc_en: "Prometheus + Grafana: metrics & alerts.",
  },
];
