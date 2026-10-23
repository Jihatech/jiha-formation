// Textes des pages légales (FR/EN), générés à partir de lib/legal/config.ts.
// Projet rédigé pour la mise en service : à faire relire par un juriste
// avant l'ouverture du premium (paiement => CGV dédiées).

import type { Locale } from "@/lib/i18n/config";
import { legal } from "./config";

export const legalPages = ["notice", "privacy", "terms"] as const;
export type LegalPage = (typeof legalPages)[number];

export function isLegalPage(value: string): value is LegalPage {
  return (legalPages as readonly string[]).includes(value);
}

export interface LegalSection {
  title: string;
  paragraphs?: string[];
  items?: string[];
}

export interface LegalDoc {
  title: string;
  description: string;
  sections: LegalSection[];
}

const p = legal.publisher;
const activeProcessors = legal.processors.filter((x) => x.active);

export const legalLabels: Record<Locale, Record<LegalPage, string>> = {
  fr: { notice: "Mentions légales", privacy: "Confidentialité", terms: "CGU" },
  en: { notice: "Legal notice", privacy: "Privacy", terms: "Terms" },
};

const FR: Record<LegalPage, LegalDoc> = {
  notice: {
    title: "Mentions légales",
    description: `Éditeur, hébergeur et contact de la plateforme ${legal.brand}.`,
    sections: [
      {
        title: "Éditeur du site",
        items: [
          `Exploitant : ${p.name}`,
          `Forme : ${p.legalForm}, exerçant sous la marque ${p.tradeName}`,
          `SIREN : ${p.siren} · SIRET : ${p.siret}`,
          `TVA intracommunautaire : ${p.vat}`,
          `Activité : ${p.naf}`,
          `Adresse : ${p.address}`,
          `Contact : ${p.email}`,
          `Directeur de la publication : ${p.publicationDirector}`,
        ],
      },
      {
        title: "Hébergement",
        items: [`${legal.host.name}, ${legal.host.address}, ${legal.host.url}`],
      },
      {
        title: "Propriété intellectuelle",
        paragraphs: [
          `Sauf mention contraire, les contenus pédagogiques (guides, fiches, schémas) sont publiés sous licence Creative Commons CC BY-SA 4.0 : vous pouvez les partager et les adapter en citant ${legal.brand} et en conservant la même licence.`,
          `La marque ${legal.brand}, son logo et l'interface de la plateforme restent la propriété de leur titulaire.`,
        ],
      },
      {
        title: "Données personnelles",
        paragraphs: [
          "Le traitement de vos données est décrit dans la politique de confidentialité, accessible depuis le pied de page.",
        ],
      },
    ],
  },
  privacy: {
    title: "Politique de confidentialité",
    description: `Quelles données ${legal.brand} collecte, pourquoi, combien de temps, et vos droits.`,
    sections: [
      {
        title: "Responsable du traitement",
        paragraphs: [`${p.name} (${p.tradeName}), ${p.address}. Contact : ${p.email}.`],
      },
      {
        title: "Données collectées",
        items: [
          "Compte : adresse email et mot de passe (stocké chiffré par notre prestataire d'authentification, jamais en clair).",
          "Connexion Google, si vous la choisissez : adresse email et nom de profil transmis par Google.",
          "Progression : étapes validées dans les guides et dates de validation.",
          "Préférences : langue d'interface et date d'acceptation des conditions.",
          "Mesure d'audience : statistiques agrégées et anonymes, sans cookie ni identifiant personnel.",
        ],
      },
      {
        title: "Finalités et base légale",
        paragraphs: [
          "Vos données servent uniquement à fournir le service : créer et sécuriser votre compte, enregistrer votre progression, vous proposer le guide suivant et vous envoyer les emails indispensables (confirmation, réinitialisation du mot de passe).",
          "Base légale : l'exécution du contrat que constituent les conditions générales d'utilisation (RGPD, art. 6.1.b). Aucune donnée n'est vendue ni utilisée à des fins publicitaires.",
        ],
      },
      {
        title: "Durée de conservation",
        paragraphs: [
          "Vos données sont conservées tant que votre compte existe. La suppression du compte, disponible à tout moment depuis votre tableau de bord, efface votre compte et votre progression.",
        ],
      },
      {
        title: "Sous-traitants et transferts",
        items: activeProcessors.map((x) => `${x.name} : ${x.role_fr} (${x.location}).`),
        paragraphs: [
          "Lorsque des données sont traitées hors de l'Union européenne, ce transfert est encadré par les garanties prévues par le RGPD (clauses contractuelles types de la Commission européenne ou cadre de protection des données UE / États-Unis).",
        ],
      },
      {
        title: "Cookies",
        paragraphs: [
          "Le site n'utilise que des cookies strictement nécessaires à la connexion (session). La mesure d'audience fonctionne sans cookie. Aucun bandeau de consentement n'est donc requis.",
        ],
      },
      {
        title: "Vos droits",
        paragraphs: [
          `Vous disposez d'un droit d'accès, de rectification, d'effacement, de portabilité, de limitation et d'opposition. Pour l'exercer : ${p.email}. Vous pouvez aussi introduire une réclamation auprès de la CNIL (www.cnil.fr).`,
        ],
      },
    ],
  },
  terms: {
    title: "Conditions générales d'utilisation",
    description: `Règles d'utilisation de la plateforme de formation ${legal.brand}.`,
    sections: [
      {
        title: "Objet",
        paragraphs: [
          `Les présentes conditions encadrent l'utilisation de ${legal.siteUrl}, plateforme de formation DevOps, cloud et self-hosting éditée par ${p.tradeName}. Créer un compte vaut acceptation de ces conditions.`,
        ],
      },
      {
        title: "Accès au service",
        paragraphs: [
          "La documentation et le premier guide du parcours sont accessibles sans compte. Le parcours complet, les QCM et le suivi de progression nécessitent un compte gratuit.",
          "Des offres payantes pourront être proposées ultérieurement ; elles feront alors l'objet de conditions générales de vente distinctes, acceptées au moment de la souscription.",
        ],
      },
      {
        title: "Compte",
        paragraphs: [
          "Vous vous engagez à fournir une adresse email valide et à garder votre mot de passe confidentiel. Vous pouvez supprimer votre compte à tout moment depuis votre tableau de bord.",
        ],
      },
      {
        title: "Travaux pratiques et responsabilité",
        paragraphs: [
          "Les guides proposent d'exécuter des commandes et de déployer des services sur vos propres machines ou comptes cloud. Vous restez seul responsable de ces environnements : testez sur des machines dédiées, sauvegardez vos données et vérifiez les éventuels coûts chez votre fournisseur cloud avant toute manipulation.",
          "Les contenus sont fournis à titre pédagogique, sans garantie d'adéquation à un usage de production. La responsabilité de l'éditeur ne saurait être engagée pour une perte de données, une interruption de service ou des frais résultant de l'application des guides.",
        ],
      },
      {
        title: "Usage acceptable",
        paragraphs: [
          "Il est interdit de tenter de compromettre la sécurité de la plateforme, d'automatiser l'extraction massive des contenus réservés aux membres ou de partager un compte. L'éditeur peut suspendre un compte en cas de manquement.",
        ],
      },
      {
        title: "Disponibilité et évolution",
        paragraphs: [
          "Le service est fourni en l'état et peut évoluer, être interrompu pour maintenance ou modifié. Les présentes conditions peuvent être mises à jour ; la date de dernière mise à jour figure en bas de page.",
        ],
      },
      {
        title: "Droit applicable",
        paragraphs: [
          "Les présentes conditions sont soumises au droit français. En cas de litige, une solution amiable sera recherchée avant toute action ; à défaut, les tribunaux français sont compétents, sous réserve des règles protectrices applicables aux consommateurs.",
        ],
      },
    ],
  },
};

const EN: Record<LegalPage, LegalDoc> = {
  notice: {
    title: "Legal notice",
    description: `Publisher, host and contact of the ${legal.brand} platform.`,
    sections: [
      {
        title: "Publisher",
        items: [
          `Operator: ${p.name}`,
          `Legal form: sole proprietorship (${p.legalForm}), trading as ${p.tradeName}`,
          `SIREN: ${p.siren} · SIRET: ${p.siret}`,
          `EU VAT number: ${p.vat}`,
          `Activity: ${p.naf}`,
          `Address: ${p.address}`,
          `Contact: ${p.email}`,
          `Publication director: ${p.publicationDirector}`,
        ],
      },
      {
        title: "Hosting",
        items: [`${legal.host.name}, ${legal.host.address}, ${legal.host.url}`],
      },
      {
        title: "Intellectual property",
        paragraphs: [
          `Unless stated otherwise, learning content (guides, sheets, diagrams) is published under the Creative Commons CC BY-SA 4.0 licence: you may share and adapt it, crediting ${legal.brand} and keeping the same licence.`,
          `The ${legal.brand} brand, its logo and the platform interface remain the property of their owner.`,
        ],
      },
      {
        title: "Personal data",
        paragraphs: ["How your data is processed is described in the privacy policy, linked from the footer."],
      },
    ],
  },
  privacy: {
    title: "Privacy policy",
    description: `What data ${legal.brand} collects, why, for how long, and your rights.`,
    sections: [
      {
        title: "Data controller",
        paragraphs: [`${p.name} (${p.tradeName}), ${p.address}. Contact: ${p.email}.`],
      },
      {
        title: "Data collected",
        items: [
          "Account: email address and password (stored hashed by our authentication provider, never in plain text).",
          "Google sign-in, if you choose it: email address and profile name provided by Google.",
          "Progress: steps validated in the guides and validation dates.",
          "Preferences: interface language and date you accepted the terms.",
          "Audience measurement: aggregated, anonymous statistics, with no cookie or personal identifier.",
        ],
      },
      {
        title: "Purposes and legal basis",
        paragraphs: [
          "Your data is used only to provide the service: create and secure your account, record your progress, suggest your next guide and send essential emails (confirmation, password reset).",
          "Legal basis: performance of the contract formed by the terms of use (GDPR, art. 6.1.b). No data is sold or used for advertising.",
        ],
      },
      {
        title: "Retention",
        paragraphs: [
          "Your data is kept as long as your account exists. Deleting your account, available at any time from your dashboard, erases your account and your progress.",
        ],
      },
      {
        title: "Processors and transfers",
        items: activeProcessors.map((x) => `${x.name}: ${x.role_en} (${x.location}).`),
        paragraphs: [
          "When data is processed outside the European Union, the transfer relies on GDPR safeguards (European Commission standard contractual clauses or the EU-US Data Privacy Framework).",
        ],
      },
      {
        title: "Cookies",
        paragraphs: [
          "The site only uses cookies strictly required for sign-in (session). Audience measurement is cookie-free, so no consent banner is required.",
        ],
      },
      {
        title: "Your rights",
        paragraphs: [
          `You have the right to access, rectify, erase, port, restrict and object. To exercise them: ${p.email}. You may also lodge a complaint with the French data protection authority, CNIL (www.cnil.fr).`,
        ],
      },
    ],
  },
  terms: {
    title: "Terms of use",
    description: `Rules for using the ${legal.brand} training platform.`,
    sections: [
      {
        title: "Purpose",
        paragraphs: [
          `These terms govern the use of ${legal.siteUrl}, a DevOps, cloud and self-hosting training platform published by ${p.tradeName}. Creating an account means accepting these terms.`,
        ],
      },
      {
        title: "Access",
        paragraphs: [
          "The documentation and the first guide of the track are available without an account. The full track, quizzes and progress tracking require a free account.",
          "Paid offers may be introduced later; they will then be governed by separate terms of sale, accepted at subscription time.",
        ],
      },
      {
        title: "Account",
        paragraphs: [
          "You agree to provide a valid email address and keep your password confidential. You can delete your account at any time from your dashboard.",
        ],
      },
      {
        title: "Hands-on labs and liability",
        paragraphs: [
          "Guides ask you to run commands and deploy services on your own machines or cloud accounts. You remain solely responsible for those environments: use dedicated machines, back up your data and check any costs with your cloud provider before acting.",
          "Content is provided for learning purposes, with no warranty of fitness for production use. The publisher cannot be held liable for data loss, service interruption or charges resulting from applying the guides.",
        ],
      },
      {
        title: "Acceptable use",
        paragraphs: [
          "You must not attempt to compromise the platform's security, mass-scrape member-only content or share an account. The publisher may suspend an account in case of breach.",
        ],
      },
      {
        title: "Availability and changes",
        paragraphs: [
          "The service is provided as is and may change, be interrupted for maintenance or be modified. These terms may be updated; the last update date is shown at the bottom of the page.",
        ],
      },
      {
        title: "Governing law",
        paragraphs: [
          "These terms are governed by French law. Any dispute will first be settled amicably; failing that, French courts have jurisdiction, subject to mandatory consumer protection rules.",
        ],
      },
    ],
  },
};

export function getLegalDoc(locale: Locale, page: LegalPage): LegalDoc {
  return (locale === "fr" ? FR : EN)[page];
}
