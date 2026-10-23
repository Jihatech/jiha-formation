// Informations légales de la plateforme : SOURCE UNIQUE.
// Toutes les pages /legal/* lisent ce fichier. Pour mettre à jour l'éditeur,
// l'adresse ou un sous-traitant, on modifie ICI et nulle part ailleurs.
//
// Les valeurs qui commencent par TODO_PREFIX sont des champs à compléter.
// `pnpm check:legal` les liste ; la mise en service (skill mise-en-prod)
// exige zéro champ à compléter.

export const TODO_PREFIX = "[À COMPLÉTER";

export const legal = {
  brand: "JIHA.tech",
  siteUrl: "https://learn.jiha.tech",
  lastUpdated: "2026-10-22",

  publisher: {
    // Pour une entreprise individuelle, la loi (LCEN art. 6) impose en principe
    // le nom de l'exploitant. Passer en société (ex. SASU « JIHA.tech ») permet
    // d'afficher la dénomination sociale à la place.
    name: `${TODO_PREFIX} : nom de l'exploitant ou dénomination sociale]`,
    legalForm: "Entrepreneur individuel",
    tradeName: "JIHA.tech",
    siren: "830 281 598",
    siret: "830 281 598 00045",
    vat: "FR42830281598",
    naf: "6202A, Conseil en systèmes et logiciels informatiques",
    address: `${TODO_PREFIX} : adresse postale ou de domiciliation]`,
    email: `${TODO_PREFIX} : email de contact, ex. contact@jiha.tech]`,
    publicationDirector: `${TODO_PREFIX} : directeur de la publication]`,
  },

  host: {
    name: "Vercel Inc.",
    address: "440 N Barranca Ave #4133, Covina, CA 91723, USA",
    url: "https://vercel.com",
  },

  // Sous-traitants au sens du RGPD (art. 28). `active: false` = non utilisé
  // aujourd'hui, masqué des pages publiques.
  processors: [
    {
      name: "Supabase Inc.",
      role_fr: "Base de données et authentification (comptes, progression)",
      role_en: "Database and authentication (accounts, progress)",
      location: `${TODO_PREFIX} : région du projet Supabase, ex. UE (Paris, eu-west-3)]`,
      active: true,
    },
    {
      name: "Vercel Inc.",
      role_fr: "Hébergement et diffusion du site",
      role_en: "Website hosting and delivery",
      location: "États-Unis / United States",
      active: true,
    },
    {
      name: "Google LLC",
      role_fr: "Connexion « Continuer avec Google » (si vous la choisissez)",
      role_en: "“Continue with Google” sign-in (if you choose it)",
      location: "États-Unis / United States",
      active: true,
    },
    {
      name: "Plausible Insights OÜ",
      role_fr: "Mesure d'audience anonyme, sans cookie",
      role_en: "Anonymous, cookie-free audience measurement",
      location: "Union européenne / European Union",
      active: true,
    },
    {
      name: "Stripe Payments Europe Ltd.",
      role_fr: "Paiement des abonnements",
      role_en: "Subscription payments",
      location: "Union européenne / European Union",
      // Activer uniquement à l'ouverture du premium (CGV requises à ce moment).
      active: false,
    },
  ],
} as const;

/** Liste des champs encore à compléter (chemin → valeur). */
export function missingLegalFields(): string[] {
  const out: string[] = [];
  const walk = (value: unknown, path: string) => {
    if (typeof value === "string") {
      if (value.startsWith(TODO_PREFIX)) out.push(path);
    } else if (Array.isArray(value)) {
      value.forEach((v, i) => {
        if (v && typeof v === "object" && "active" in v && !v.active) return;
        walk(v, `${path}[${i}]`);
      });
    } else if (value && typeof value === "object") {
      for (const [k, v] of Object.entries(value)) walk(v, path ? `${path}.${k}` : k);
    }
  };
  walk(legal, "");
  return out;
}
