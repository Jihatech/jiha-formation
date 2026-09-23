import type { Locale } from "./config";

// UI strings only (chrome). Guide *content* comes from JIHA-Learn (content/*.md),
// never from here — see PLATFORM-SPEC §2 (le manifeste/contenu reste source de vérité).
const dictionaries = {
  fr: {
    "nav.docs": "Docs",
    "nav.guides": "Parcours",
    "nav.exams": "Examens blancs",
    "nav.dashboard": "Ma progression",
    "nav.login": "Connexion",
    "nav.signup": "Créer un compte",
    "nav.logout": "Déconnexion",
    "theme.toggle": "Basculer clair/sombre",
    "lang.switch": "EN",
    "lang.switch.label": "Voir en anglais",
    "home.tagline":
      "La formation DevOps & self-hosting en pratique. Tu déploies, on explique.",
    "home.cta": "Découvrir le parcours",
    "home.path.title": "Le parcours",
    "guide.level.beginner": "Débutant",
    "guide.level.intermediate": "Intermédiaire",
    "guide.level.advanced": "Avancé",
    "guide.duration": "min",
    "guide.soon": "bientôt",
    "guide.start": "Commencer",
    "guide.resume": "Reprendre",
    "guide.completed": "Terminé",
    "guide.markComplete": "Marquer comme terminé",
    "guide.prerequisites": "Prérequis",
    "guide.next": "Et après ?",
    "guide.locked.prereq": "Prérequis non terminés",
    "exam.title": "Examens blancs",
    "exam.intro":
      "Mets-toi en conditions réelles : un examen chronométré par filière, tiré au sort dans tes QCM, noté à la fin. Le tirage change à chaque tentative.",
    "exam.questions": "questions",
    "exam.minutes": "min",
    "exam.pass": "réussite",
    "exam.guidesCovered": "guides couverts",
    "exam.start": "Commencer l'examen",
    "exam.empty": "Aucun examen disponible pour le moment.",
    "exam.backToList": "← Tous les examens blancs",
    "footer.tagline": "jiha.tech — formation DevOps & self-hosting",
  },
  en: {
    "nav.docs": "Docs",
    "nav.guides": "Path",
    "nav.exams": "Mock exams",
    "nav.dashboard": "My progress",
    "nav.login": "Sign in",
    "nav.signup": "Sign up",
    "nav.logout": "Sign out",
    "theme.toggle": "Toggle light/dark",
    "lang.switch": "FR",
    "lang.switch.label": "View in French",
    "home.tagline":
      "Hands-on DevOps & self-hosting training. You deploy, we explain.",
    "home.cta": "Explore the path",
    "home.path.title": "The path",
    "guide.level.beginner": "Beginner",
    "guide.level.intermediate": "Intermediate",
    "guide.level.advanced": "Advanced",
    "guide.duration": "min",
    "guide.soon": "soon",
    "guide.start": "Start",
    "guide.resume": "Resume",
    "guide.completed": "Completed",
    "guide.markComplete": "Mark as completed",
    "guide.prerequisites": "Prerequisites",
    "guide.next": "What's next?",
    "guide.locked.prereq": "Prerequisites not completed",
    "exam.title": "Mock exams",
    "exam.intro":
      "Put yourself under real conditions: a timed exam per track, drawn at random from your quizzes, graded at the end. The draw changes on every attempt.",
    "exam.questions": "questions",
    "exam.minutes": "min",
    "exam.pass": "to pass",
    "exam.guidesCovered": "guides covered",
    "exam.start": "Start exam",
    "exam.empty": "No exam available yet.",
    "exam.backToList": "← All mock exams",
    "footer.tagline": "jiha.tech — DevOps & self-hosting training",
  },
} as const;

export type DictKey = keyof (typeof dictionaries)["fr"];

export function getDictionary(locale: Locale) {
  const dict = dictionaries[locale];
  return (key: DictKey): string => dict[key];
}
