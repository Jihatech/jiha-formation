# PLATFORM-SPEC — Cahier des charges de la plateforme de formation

> Document destiné à Claude Code. Décrit **ce que la plateforme doit faire** (fonctionnel)
> et ses contraintes. Le **choix technique (stack, auth, paiement) est laissé à Claude Code**,
> qui doit le **proposer et obtenir validation AVANT de construire** (voir §0).
>
> S'appuie sur : `BUILD-SPEC.md`, `GUIDE-TEMPLATE.md`, `CHECKLIST.md` (la couche v1).
> Marque : jiha.tech. Public : francophone + anglophone.
> Version : 1.0 — juin 2026

---

## 0. Règle de travail pour Claude Code (à lire en premier)

1. **Ne commence pas à coder la plateforme immédiatement.** D'abord, **propose une architecture** (stack, hébergement, auth, base de données, et plus tard paiement) avec ses raisons, ses coûts récurrents estimés, et ses compromis. **Attends la validation** avant d'implémenter.
2. Quand tu proposes le stack, **prends en compte les contraintes de ce document** (réutilisation de la couche v1, bilingue, esthétique terminal, coûts maîtrisés pour un projet qui démarre).
3. **Construis par phases** (voir §5). Ne livre pas tout d'un bloc. La phase 1 doit être testable seule.
4. À chaque décision structurante (modèle de données, choix d'un service tiers), **signale-la explicitement** plutôt que de la prendre silencieusement.

---

## 1. Objectif & contexte

jiha.tech construit une **plateforme de formation** au DevOps / cloud / self-hosting, fondée sur des guides pédagogiques hands-on (l'apprenant déploie lui-même, la plateforme explique et accompagne).

La **couche v1** (déjà spécifiée) produit des **pages de guides statiques** + des **PDF lead magnets** distribués sur Instagram/LinkedIn. La plateforme (ce document) ajoute par-dessus : **comptes, suivi de progression, parcours structurés, et à terme un modèle d'abonnement** (premier cours gratuit, contenu avancé payant).

**Ce qu'on veut tester en priorité** (raison d'être de la phase 1) : est-ce que des apprenants créent un compte, suivent un parcours, et progressent ? Le suivi de progression est la fonction centrale à valider, avant toute monétisation.

---

## 2. Réutilisation de la couche v1 — contrainte centrale

La plateforme **ne repart pas de zéro**. Elle consomme les artefacts v1 :

- **`guides.json` (le manifeste)** — source de la structure du parcours : liste des guides, ordre, prérequis, suites, statut, niveau, durée, langue. La plateforme lit ce manifeste pour construire les parcours et l'arbre de progression. **Ne pas dupliquer cette information ailleurs** : le manifeste reste la source de vérité de la structure.
- **Les fichiers-guides `content/<id>.md`** — le contenu pédagogique bilingue (format `GUIDE-TEMPLATE.md`). En phase 1, la plateforme les *référence* (par `id`) sans forcément les héberger : un guide peut rester servi en page statique, la plateforme suivant la progression par-dessus.
- **Les identifiants de guides stables** (`id`) — deviennent les **clés de progression** par utilisateur. C'est pourquoi ils ont été figés en v1 : un `id` qui change casserait l'historique de progression. **Ne jamais régénérer ou renommer un `id` existant.**

> Conséquence : tout le travail de structuration v1 (manifeste, ids stables, contenu séparé) est précisément ce qui rend cette plateforme constructible sans réécriture. La respecter est non négociable.

---

## 3. Périmètre fonctionnel

### 3.1 Comptes membres
- Inscription / connexion. Méthode laissée au choix de Claude Code (email+mot de passe, magic link, social login Google/GitHub…), à proposer en §0.
- Profil minimal : identité, langue préférée (FR/EN), date d'inscription.
- Respect RGPD (public FR/EU) : consentement, possibilité de suppression de compte et des données. À intégrer dès la conception, pas après.

### 3.2 Suivi de progression (fonction centrale phase 1)
- Par utilisateur et par guide (clé = `id` du guide) : statut `non commencé` / `en cours` / `terminé`.
- Idéalement, granularité **par étape/lab** à l'intérieur d'un guide (les sections `step-xx` du `GUIDE-TEMPLATE`), pour un suivi fin. Au minimum, par guide.
- Reprise : l'utilisateur retrouve où il s'est arrêté.
- Vue d'ensemble : sa progression dans le parcours (combien de guides terminés, lequel est le prochain selon les prérequis).

### 3.3 Parcours structurés
- Construits à partir du manifeste (`prerequisites` / `next` / `order`).
- La plateforme guide l'apprenant dans l'ordre, signale les prérequis non remplis, propose le prochain guide logique.
- Parcours linéaire en phase 1 (cf. décision produit : pas d'arbre complexe au début).

### 3.4 Gating freemium (phase 2)
- Le manifeste porte déjà un champ d'accès (`access: free | premium`, embryon prévu en BUILD-SPEC §7.2).
- Phase 2 : le contenu `premium` nécessite un abonnement actif ; le `free` reste ouvert (dont le **premier cours gratuit**, pilier de l'acquisition).
- Le découpage précis free/premium est une **décision produit à trancher** (voir §6).

### 3.5 Abonnement / paiement (phase 2)
- Modèle : premier cours gratuit, contenu avancé payant. Détails (prix, palier unique vs tiers, mensuel/annuel) = décision produit (§6).
- Choix du prestataire laissé à Claude Code (Stripe, Paddle/Lemon Squeezy en merchant-of-record pour simplifier TVA EU…), à proposer en §0 le moment venu.

### 3.6 Cohérence avec la couche v1
- Esthétique **terminal / CRT ambre** cohérente avec les pages de guides (cf. BUILD-SPEC §2). La plateforme et les guides doivent sembler le même produit.
- **Bilingue FR/EN** de bout en bout, comme les guides.
- Les CTA des pages v1 (qui pointent vers `[URL_PLATEFORME]`) atterrissent ici.

---

## 4. Modèle de données — esquisse

À affiner par Claude Code selon le stack, mais les **entités** et leurs liens sont imposés par la logique métier :

- **User** : id, email, langue préférée, date création, (statut abonnement → phase 2).
- **Guide** (référentiel, **dérivé du manifeste**, pas ressaisi) : id, ordre, niveau, accès (free/premium), relations prérequis/suite.
- **Progress** : user_id + guide_id (+ step_id si granularité fine) → statut, horodatage, position de reprise. **La clé guide_id est l'`id` stable du manifeste.**
- **Subscription** (phase 2) : user_id, statut, période, lien prestataire de paiement.

Règle : le **référentiel de guides reste piloté par `guides.json`**. La base de données plateforme stocke la **progression et les comptes**, pas une copie divergente de la structure des guides. Une seule source de vérité pour la structure (le manifeste), une seule pour la progression (la base).

---

## 5. Phasage

### Phase 1 — Comptes + progression + parcours (à construire d'abord)
Objectif : **tester le suivi de parcours en réel.**
- Inscription / connexion.
- Lecture du manifeste → parcours linéaire affiché.
- Suivi de progression par guide (idéalement par étape).
- Reprise, vue d'ensemble.
- Tout le contenu gratuit à ce stade (pas de gating actif).
- Esthétique + bilingue cohérents avec la v1.

✅ Critère de réussite phase 1 : un utilisateur s'inscrit, suit un parcours, sa progression est correctement enregistrée et retrouvée à la reconnexion.

### Phase 2 — Freemium + abonnement (une fois la phase 1 validée)
- Activation du gating `free` / `premium` via le manifeste.
- Intégration paiement (prestataire proposé par Claude Code).
- Gestion abonnement (souscription, expiration, accès conditionnel).

### Phase 3 — CMS & contenu intégré (optionnel, plus tard)
- Migration éventuelle du contenu vers Sanity (ou autre), si l'édition par fichiers atteint ses limites.
- Tant que l'édition par fichiers `content/` suffit, **ne pas introduire de CMS** (complexité non justifiée).

---

## 6. Décisions produit à trancher (par toi, pas par Claude Code)

Ces points ne sont **pas techniques** — ils t'appartiennent et conditionnent la phase 2 :

- **Découpage free / premium** : quels guides gratuits, lesquels payants ? (Recommandation déjà discutée : fondamentaux gratuits = acquisition, contenu avancé payant.)
- **Prix et structure d'abonnement** : palier unique ou tiers ? mensuel / annuel ? prix ?
- **Cible payante** : particuliers, ou aussi une offre B2B (PME qui forment des devs) ? (Le B2B est souvent plus rentable pour ce type de contenu.)
- **Certification** : délivres-tu une attestation de parcours terminé ? (Argument de valeur pour le premium.)

Tant que ces points ne sont pas tranchés, **la phase 1 peut avancer** (elle ne dépend d'aucun) — c'est voulu.

---

## 7. Ce qu'on ne construit pas maintenant (anti-sur-ingénierie)

- Pas de paiement en phase 1.
- Pas de CMS tant que les fichiers suffisent.
- Pas d'arbre de parcours complexe (linéaire d'abord).
- Pas de fonctionnalités sociales (forum, commentaires, classements) — hors périmètre tant que le cœur n'est pas validé.
- Pas de duplication de la structure des guides dans la base : le manifeste reste la source.

---

## 8. Livrable attendu de Claude Code (en réponse à ce brief)

1. **Une proposition d'architecture** (stack, hébergement, auth, base, et plus tard paiement) avec raisons, coûts récurrents estimés, compromis — **pour validation avant code**.
2. Une fois validée : **la phase 1**, testable seule, cohérente avec la v1 (esthétique terminal ambre, bilingue, lecture du manifeste, ids stables comme clés de progression).
3. Une note sur la **stratégie de migration** depuis/avec la couche v1 statique (comment guides statiques et plateforme cohabitent).

---

*Documents associés : `BUILD-SPEC.md`, `GUIDE-TEMPLATE.md`, `CHECKLIST.md` (couche v1 — les pages de guides et leur format).*
