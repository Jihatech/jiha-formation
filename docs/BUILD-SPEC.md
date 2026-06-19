# BUILD-SPEC — Brief de génération des pages de guide

> Document destiné à Claude Code. À fournir avec chaque fichier-guide (voir `GUIDE-TEMPLATE.md`)
> pour produire une page web cohérente, branchée sur la stratégie de distribution et la future plateforme.
>
> Statut : ✅ complet — v1 (relecture finale recommandée)
> Version : 1.0 — juin 2026

---

## 1. Objectif & contexte

**Tu es Claude Code.** Ce document est un brief d'exécution. Suis les contraintes à la lettre ; quand un choix d'implémentation est laissé libre, applique les bonnes pratiques de ton jugement sans dévier des règles posées ici.

### Ce que tu produis

Pour **chaque guide**, une **page web statique autonome**, hébergée sur GitHub Pages, à partir d'un fichier-guide structuré (format défini dans `GUIDE-TEMPLATE.md`). Une page = un guide. Référence de qualité visée : https://jihatech.github.io/Fast-Docker/ (déjà produit, sert d'étalon).

### Pourquoi cette page existe

La page sert trois fonctions simultanées :

1. **Vitrine pédagogique** — un guide complet, lisible et illustré, qui aide réellement quelqu'un à apprendre en faisant (déploiement hands-on sur sa propre machine).
2. **Point d'entrée vers la plateforme** — chaque page doit ramener le lecteur vers la future plateforme de formation de **jiha.tech** (suivi de progression, parcours, comptes membres). La page n'est jamais un cul-de-sac.
3. **Pendant web d'un lead magnet PDF** — le même contenu est distribué en PDF gratuit via Instagram et LinkedIn (aux personnes qui commentent un mot-clé sur les posts). La page et le PDF se répondent (détaillé en section 4).

### Bilingue obligatoire

**FR + EN systématique**, sur la même page, comme l'étalon Fast-Docker. jiha.tech cible un public francophone **et** anglophone. Aucun guide ne sort en une seule langue. Le mécanisme de bascule FR/EN doit être présent et fonctionnel sur chaque page.

### Ce que la page N'EST PAS

- Elle **n'exécute rien**, ne déploie rien, ne lance aucune commande à la place du lecteur. C'est un guide qui explique ; le lecteur agit lui-même sur sa machine ou ses serveurs.
- Elle **ne remplace pas la plateforme**. C'est une vitrine + un point d'entrée, pas le produit complet.
- Elle **n'embarque pas** de back-end, d'authentification ou de paiement en v1 (voir sections 5 et 7).

### Marque

Le projet n'a pas encore de nom de produit. Utilise **jiha.tech** comme marque dans les CTA, le footer et les métadonnées. Prévois un placeholder `[NOM_PLATEFORME]` là où un nom de produit dédié viendra plus tard, pour qu'il soit remplaçable en une passe.

---

## 2. Direction visuelle

Thème **terminal / CRT rétro, poussé mais lisible**. L'esthétique est forte et assumée, sans jamais sacrifier le confort de lecture (les apprenants travaillent ~1 à 2 h par session — voir §2.4).

### 2.1 Mode clair / sombre

- **Sombre par défaut** (cohérent avec le thème terminal).
- **Bascule clair/sombre** présente sur chaque page, état mémorisé côté client (le mécanisme de persistance devra migrer proprement en v2 — voir §5).
- Le mode clair reste sobre et lisible : ce n'est pas une simple inversion, mais une variante pensée (fond crème/papier, accents ambre assombris pour garder le contraste).

### 2.2 Palette

- **Accent signature : ambre `#FFB627`** (rétro CRT). Utilisé pour les liens, les accents, les prompts, les éléments interactifs clés, les CTA secondaires. À ne pas surcharger : l'ambre doit rester un signal, pas un aplat.
- **Fond sombre** : noir / gris très foncé (proche `#0D1117` à `#1A1A1A`), pas un noir pur agressif.
- **Texte** : blanc cassé / gris clair pour la prose, jamais blanc pur sur noir pur (fatigue oculaire).
- **Logo** : fourni en SVG monochrome (`LOGO_JIHA_TECHSVG.svg`). Sur fond sombre, l'afficher en blanc cassé ou en ambre selon le contexte ; sur fond clair, en noir d'origine. Le logo doit rester lisible et net (c'est un SVG, aucune raison de pixéliser).
- Respecter des ratios de contraste accessibles (WCAG AA au minimum) — un skill technique affinera ce point plus tard.

### 2.3 Typographie

- **Monospace** pour : code, commandes, blocs terminal, accents d'interface (headers de section façon ligne de commande, labels, métadonnées). C'est la signature.
- **Police lisible non-monospace** (sans-serif propre ou serif de lecture) pour la **prose longue** : paragraphes explicatifs, "pourquoi cette commande", introductions. Le tout-monospace fatigue sur la durée — on garde le monospace pour l'identité, pas pour les pavés de texte.
- Le logo utilise Montserrat bold ; on peut s'en servir comme police de titres pour rester cohérent avec la marque.

### 2.4 Niveau de gimmick : poussé

L'esthétique terminal va jusqu'aux éléments stylisés et animés, **avec garde-fous** :

- **Fenêtre terminal stylisée** : barre supérieure avec les 3 pastilles (rouge/jaune/vert), titre de fenêtre, pour les blocs de commandes et certains conteneurs visuels.
- **Prompts `$`** dans les blocs de commande, distinguant visuellement l'input de l'output.
- **Headers de section façon CLI** (ex. `§ 03 — Théorie` comme sur l'étalon, ou un style `~/guide/03-concepts $`).
- **Effets autorisés** : curseur clignotant, légère animation de typing sur le hero, éventuelle "boot sequence" courte au premier chargement.
- **Garde-fous obligatoires** :
  - Les effets ne s'appliquent **jamais** au corps de texte qu'on lit longtemps (pas de typing sur les paragraphes pédagogiques).
  - Respecter `prefers-reduced-motion` : toute animation se désactive si l'utilisateur l'a demandé au niveau système.
  - Aucune animation ne doit retarder l'accès au contenu ni nuire aux performances (le contenu est prioritaire sur le spectacle).
  - Une "boot sequence" éventuelle est courte, skippable, et ne se rejoue pas à chaque navigation.

Principe directeur : **le thème sert le contenu, jamais l'inverse.** Une session d'apprentissage dure 1 à 2 h ; rien ne doit lasser ou gêner à la troisième lecture.

### 2.5 Schémas — obligatoires

**Chaque guide doit comporter des schémas**, pas seulement du texte et du code. L'étalon Fast-Docker en donne le niveau attendu : architecture client/daemon/registry, cycle de vie, couches d'image, modes réseau, multi-stage build, etc.

- Format **SVG** (net à toute résolution, léger, stylable selon le thème clair/sombre, imprimable proprement en PDF).
- Intégrés **inline** dans le HTML (pas d'images externes lourdes), pour rester cohérents avec le thème (couleurs ambre/sombre) et basculer avec le mode clair/sombre.
- Chaque schéma porte une **légende** numérotée et explicative (ex. *« Schéma 1. Architecture client / daemon / registry. »*), bilingue.
- Un schéma doit **expliquer un concept**, pas décorer. S'il n'aide pas la compréhension, il n'a pas sa place.

---

## 3. Structure de page obligatoire

Cette section définit l'ordre canonique des blocs et les éléments **non négociables**. La trame pédagogique reprend l'étalon Fast-Docker ; les blocs marqués 🆕 sont ceux qui manquent à l'étalon et que tu dois désormais inclure systématiquement.

### 3.1 Ordre canonique des blocs

1. **Hero** — titre du guide, accroche, métadonnées clés (durée, niveau, nombre de labs/étapes, repository source). Bascule FR/EN et bascule clair/sombre accessibles ici.
2. **🆕 Bandeau CTA discret** — une ligne sobre rappelant que ce guide fait partie de la formation jiha.tech, avec lien vers la plateforme. Discret, non intrusif (voir §3.2).
3. **Sommaire** — table des matières ancrée, bilingue.
4. **Introduction / Pourquoi ce guide** — y compris « à qui ça s'adresse » et « quand ce n'est pas le bon choix ».
5. **Prérequis** — connaissances supposées + installation. 🆕 Les prérequis qui correspondent à d'autres guides sont des **liens inter-guides** (voir §3.4).
6. **Concepts fondamentaux + schémas** — la théorie avant la pratique. Schémas SVG obligatoires (voir §2.5).
7. **Parcours d'apprentissage** — l'ordre recommandé de progression dans le guide.
8. **Contenu principal** — les labs / étapes, chacun suivant la micro-structure pédagogique (objectif / durée / concepts / commandes / pièges / validation).
9. **Cheatsheet** — aide-mémoire des commandes clés, imprimable.
10. **Et après ?** — la suite logique. 🆕 Liens inter-guides cliquables (voir §3.4) + 🆕 CTA fort vers la plateforme (voir §3.2).
11. **Ressources** — liens externes officiels, sans remplissage.
12. **🆕 Bloc lead magnet / PDF** — téléchargement PDF du guide (voir §3.3). Placé en fin de contenu, peut aussi être rappelé dans le hero via un bouton.
13. **Footer** — marque jiha.tech, logo, licence, mention édition/date, lien plateforme.

### 3.2 CTA plateforme — non négociable

La page n'est jamais un cul-de-sac. Trois points de contact, en intensité croissante :

- **Bandeau haut (discret)** : une ligne du type « Ce guide fait partie de la formation jiha.tech — [découvrir le parcours] ». Sobre, n'interrompt pas la lecture.
- **CTA fort en fin de guide** (dans « Et après ? ») : le moment où le lecteur a terminé un cours gratuit et a le plus de motivation. Message orienté valeur : suivi de progression, parcours structuré, guides avancés. C'est le CTA principal.
- **Footer** : rappel discret + lien.

Pas de CTA au milieu du contenu (entre théorie et labs) : ça couperait l'élan d'apprentissage. On capte l'attention à la fin, quand le lecteur a obtenu de la valeur.

Tous les CTA pointent vers la plateforme jiha.tech (placeholder d'URL `[URL_PLATEFORME]` tant qu'elle n'est pas en ligne — voir §6). Le wording marketing exact sera affiné via un skill dédié ; pour l'instant, des formulations claires orientées bénéfice suffisent.

### 3.3 Bouton / bloc PDF — le lead magnet

Le PDF **est** le produit gratuit distribué sur Instagram et LinkedIn.

- **Génération** : le PDF est produit **à partir de la page elle-même** (une feuille de style print soignée + bouton « Télécharger en PDF » qui déclenche l'impression / export). Raison : un seul contenu source à maintenir. Toute correction du guide se répercute automatiquement sur le PDF, sans divergence.
- **Qualité print obligatoire** : la feuille de style `@media print` doit être traitée comme un livrable à part entière, pas un effet de bord. Les schémas SVG s'impriment nets ; les blocs terminal restent lisibles ; les couleurs s'adaptent au papier (l'ambre sur blanc doit rester contrasté) ; les liens affichent leur URL ; la pagination est propre (pas de coupures au milieu d'un bloc de code).
- **Pas de capture d'email sur la page en v1** : le téléchargement PDF est **libre et direct** sur la page web. La capture de leads se fait en amont, sur Instagram/LinkedIn (les gens commentent un mot-clé, reçoivent le PDF en DM). La page web sert l'audience qui arrive déjà sur le site ; on ne met pas de friction. La capture d'email sur le site (formulaire, service tiers type Formspree, séquence) sera ajoutée avec un skill marketing en temps voulu — prévoir l'emplacement, pas l'implémentation.

### 3.4 Liens inter-guides — la cohérence du parcours

C'est ce qui transforme des pages isolées en un parcours. Les prérequis (§5 de la page) et la section « Et après ? » (§10) référencent d'autres guides.

Règle de gestion d'un lien vers un guide **pas encore publié** :

- S'il existe → lien cliquable normal vers sa page.
- S'il n'existe pas encore → afficher l'entrée **grisée avec une étiquette « bientôt / soon »**, non cliquable. On ne masque pas (le lecteur voit le parcours complet qui l'attend, ça crée de l'anticipation) et on ne pointe pas vers une 404.
- L'état publié/à venir de chaque guide doit être **piloté par les données**, pas codé en dur dans chaque page (voir §5 et §6 : un manifeste de guides centralisé). Quand un guide est publié, mettre à jour le manifeste suffit à activer tous les liens vers lui, sur toutes les pages.

### 3.5 Bilingue dans la structure

Chaque bloc ci-dessus existe en FR **et** EN. La bascule de langue agit sur l'ensemble de la page de façon cohérente (pas de page à moitié traduite). L'approche technique (duplication inline comme l'étalon, ou bascule par attribut/classe) est laissée à ton jugement, sous deux contraintes : le contenu des deux langues doit rester synchronisé à la source, et le PDF doit pouvoir être généré dans une langue donnée sans l'autre (un PDF FR propre, un PDF EN propre — pas un PDF bilingue mélangé).

---

## 4. Distribution & lead magnet

[À écrire]

---

## 5. Contraintes techniques

Principe directeur : **statique et simple aujourd'hui, structuré pour ne rien réécrire demain.** Chaque choix v1 doit faciliter (ou au moins ne pas bloquer) la migration v2 vers une plateforme avec CMS, comptes et suivi de progression (voir §7).

### 5.1 v1 — site statique

- **Sortie statique pure** : HTML/CSS/JS, hébergeable tel quel sur GitHub Pages. Aucun back-end, aucune base de données, aucune authentification, aucun build serveur requis pour servir les pages.
- **Pas de dépendance lourde imposée** : le choix d'un éventuel générateur de site statique (SSG) est laissé à ton jugement (voir §5.2), mais le résultat livré doit rester un ensemble de fichiers statiques.
- **Fonctionne sans JS pour l'essentiel** : le contenu du guide (texte, code, schémas) doit être lisible même si le JS échoue. Le JS gère l'enrichissement (bascule langue/thème, effets, copie de bloc de code), pas l'accès au contenu. C'est aussi ce qui garantit un PDF et un référencement propres.
- **Pas de stockage navigateur fragile pour de la donnée critique** : la bascule clair/sombre et la langue peuvent utiliser `localStorage`, mais aucune donnée qui devra survivre à la v2 (progression, etc.) ne doit être stockée ainsi en v1. La progression n'existe pas en v1 ; elle arrivera avec les comptes en v2.

### 5.2 Séparation contenu / présentation — critique pour la v2

C'est la contrainte la plus importante du document. La v2 (CMS Sanity, parcours, membres) ne pourra réutiliser le travail v1 que si le **contenu** est séparé de la **présentation**.

- Le contenu d'un guide vit dans un **fichier-guide structuré** (format défini dans `GUIDE-TEMPLATE.md`) : métadonnées en en-tête + corps structuré, dans les deux langues.
- La page web est une **vue** générée à partir de ce fichier, pas le contenu lui-même. On ne doit jamais avoir à éditer du HTML pour corriger une faute dans un guide : on édite le fichier-guide, on régénère.
- Conséquence concrète : quand viendra Sanity, on importe les fichiers-guides comme source de contenu sans avoir à « désosser » des pages HTML.

### 5.3 Manifeste de guides centralisé

Un **fichier de données unique** (ex. `guides.json` ou équivalent) recense tous les guides du parcours et, pour chacun : identifiant, titre FR/EN, slug/URL, statut (`published` / `coming-soon`), niveau, durée, prérequis (par identifiants d'autres guides), suite (idem), ordre dans le parcours.

- Les **liens inter-guides** (§3.4), l'état grisé « bientôt », le sommaire du parcours, et tout futur affichage de progression se basent sur ce manifeste — **jamais** sur des liens codés en dur page par page.
- Publier un guide = ajouter/passer son entrée à `published` dans le manifeste. Tous les liens vers lui s'activent automatiquement, sur toutes les pages.
- Ce manifeste est aussi la **graine de la v2** : il décrit déjà la structure du parcours que la plateforme orchestrera.

### 5.4 Métadonnées exploitables

- Chaque page expose des métadonnées propres : `title`, meta description, balises Open Graph / Twitter Card (le partage Insta/LinkedIn pointera vers ces pages — l'aperçu doit être soigné), langue, canonical.
- Les métadonnées proviennent du fichier-guide et du manifeste, pas de saisie manuelle dans le HTML.
- SEO et tags d'analytics seront affinés via un skill marketing — prévoir l'emplacement, ne pas surconstruire maintenant.

### 5.5 Accessibilité & performance — socle minimal

Un skill technique approfondira ; socle non négociable dès la v1 :

- Contraste WCAG AA, navigation clavier, `prefers-reduced-motion` respecté (cf. §2.4), images/schémas avec alternative textuelle.
- Pages légères : pas de framework lourd pour afficher du contenu essentiellement statique, SVG inline optimisés, JS minimal et différé.
- Le poids et le temps de chargement comptent : l'audience arrive souvent depuis mobile (lien Insta/LinkedIn).

---

## 6. Conventions

Conventions par défaut, pensées pour rester stables de la v1 (GitHub Pages) à la v2 (plateforme). Si un choix gêne, il peut être ajusté tant qu'il reste **cohérent sur tous les guides**.

### 6.1 Identifiant de guide

- Chaque guide a un **identifiant stable, en minuscules, sans accents, en kebab-case** : ex. `docker-fondamentaux`, `git-fondamentaux`, `traefik`, `vaultwarden`, `immich`, `monitoring`.
- Cet identifiant est la clé dans le manifeste (§5.3) et sert à référencer prérequis et suites entre guides. **Il ne change jamais** une fois publié (sinon les liens cassent). Choisir un nom durable, pas lié à une version.

### 6.2 Slugs & URLs

- URL d'un guide : `/<lang>/guides/<identifiant>/` avec `<lang>` = `fr` ou `en` (ex. `/fr/guides/docker-fondamentaux/`, `/en/guides/docker-fondamentaux/`). **URLs distinctes par langue** — choix aligné sur la plateforme (v2) et meilleur pour le SEO.
- **Pourquoi des URLs par langue (et non une seule page à bascule)** : Google indexe deux pages réelles, on pose des balises `hreflang` (FR ↔ EN), et chaque langue a une URL partageable propre — utile pour les posts Instagram/LinkedIn ciblés FR ou EN. La bascule FR/EN de la page pointe alors vers l'URL équivalente dans l'autre langue, elle ne fait pas qu'échanger le texte en place.
- Les ancres internes (sommaire) sont stables, lisibles et **identiques entre les deux langues** : `#prerequis`, `#concepts`, `#lab-01`, etc. (sans accents, kebab-case). Ancres communes = liens alternate simples.
- L'identifiant (`<identifiant>`) reste **neutre en langue** et identique dans les deux URLs : seule la racine `/<lang>/` change. Une clé unique par guide (cf. §6.1), quelle que soit la langue.

> Note de cohérence v1/v2 : pages statiques (v1) et plateforme (v2) partagent la **même convention d'URL** `/<lang>/guides/<identifiant>/`. Un guide servi en page statique puis intégré à la plateforme garde une URL cohérente. Les balises `canonical` et `hreflang` sont posées dès la v1.

### 6.3 Structure de dossiers (v1)

Indicative — adapte selon le SSG retenu, en gardant l'esprit :

```
/
├── guides.json                 # le manifeste central (§5.3)
├── content/                    # fichiers-guides structurés (source de vérité)
│   ├── docker-fondamentaux.md  # (format GUIDE-TEMPLATE.md)
│   ├── traefik.md
│   └── ...
├── guides/                     # pages générées (sortie statique)
│   └── docker-fondamentaux/
│       └── index.html
├── assets/
│   ├── logo/                   # LOGO_JIHA_TECHSVG.svg
│   ├── styles/                 # CSS (dont la feuille @media print, §3.3)
│   └── js/                     # JS minimal (bascules, copie, effets)
└── index.html                  # accueil / sommaire du parcours (basé sur guides.json)
```

Le dossier `content/` est la **source de vérité** ; `guides/` est généré. On n'édite jamais `guides/` à la main.

### 6.4 Nommage des fichiers-guides

- Un fichier par guide, nommé d'après l'identifiant : `content/<identifiant>.md`.
- Si le format retenu sépare les langues en deux fichiers, les nommer `content/<identifiant>.fr.md` et `content/<identifiant>.en.md` ; sinon, un seul fichier bilingue structuré. Le choix est fixé dans `GUIDE-TEMPLATE.md` (cohérent pour tous).

### 6.5 Placeholders à remplacer en une passe

Centraliser les valeurs encore indéterminées pour qu'elles soient remplaçables d'un coup, idéalement via le manifeste ou un fichier de config :

- `[NOM_PLATEFORME]` — nom de produit (le projet n'en a pas encore ; marque = jiha.tech en attendant).
- `[URL_PLATEFORME]` — URL de la plateforme tant qu'elle n'est pas en ligne.
- `[URL_PDF:<identifiant>]` si un PDF pré-généré venait à remplacer la génération à la volée (non retenu en v1, cf. §3.3, mais l'emplacement est réservé).

Ne jamais disséminer ces valeurs en dur dans chaque page : un seul endroit à mettre à jour.

---

## 7. Trajectoire v2

Cette section n'est **pas** à implémenter maintenant. Elle existe pour que les choix v1 soient pris en connaissance de la suite, et pour qu'aucune décision v1 ne ferme une porte.

### 7.1 Ce que devient le projet

La v1 (pages statiques + PDF lead magnet) alimente une **plateforme de formation** jiha.tech avec :

- **Comptes membres** (inscription, connexion).
- **Suivi de progression** par utilisateur (cours commencés, terminés, position dans le parcours).
- **Parcours structuré** : les guides isolés deviennent un cheminement ordonné avec prérequis vérifiés.
- **Modèle d'abonnement** : premier cours gratuit, contenu avancé payant.
- **CMS** (Sanity envisagé) pour gérer le contenu sans toucher au code.
- **Hébergement** possiblement migré (Netlify/Vercel/autre) — décision v2, GitHub Pages suffit en v1.

### 7.2 Ce que la v1 prépare déjà (et ne doit pas casser)

- **Le manifeste de guides (§5.3)** devient la description du parcours côté plateforme. Le garder propre et exhaustif dès la v1, c'est construire la colonne vertébrale de la v2.
- **La séparation contenu / présentation (§5.2)** permet d'importer les fichiers-guides dans Sanity sans réécriture. C'est la raison d'être de cette contrainte.
- **Les identifiants de guides stables (§6.1)** deviennent les clés de progression par utilisateur. Un identifiant qui change en v2 = un historique de progression cassé. D'où l'exigence de stabilité dès maintenant.
- **Les CTA (§3.2)** pointent déjà vers `[URL_PLATEFORME]` : le jour où elle existe, on renseigne l'URL, et toutes les pages convertissent.
- **Le gating freemium** : en v1, tout le contenu publié est gratuit (c'est le lead magnet). Le marquage `published` / `coming-soon` du manifeste est l'embryon du futur marquage `free` / `premium`. Prévoir que le manifeste puisse accueillir un statut d'accès sans refonte.

### 7.3 Ce qu'on n'anticipe pas (volontairement)

Pour ne pas sur-construire la v1 :

- Pas d'auth, pas de base de données, pas de paiement en v1.
- Pas de capture d'email sur le site en v1 (cf. §3.3) — emplacement réservé, implémentation plus tard.
- Pas de logique de progression côté client en v1 — elle appartient à la v2 avec comptes.

Le bon réflexe : **construire la v1 comme un site statique excellent et bien structuré**, pas comme une demi-plateforme. La structure (manifeste, contenu séparé, identifiants stables) suffit à rendre la v2 fluide ; le reste serait du travail jeté.

---

*Fin du BUILD-SPEC. Documents associés : `GUIDE-TEMPLATE.md` (format d'un fichier-guide) et `CHECKLIST.md` (cohérence inter-guides + vérifications techniques).*

---

*Slots prévus pour plus tard (skills dédiés) : SEO/analytics/capture (section marketing), accessibilité/perfs (section technique).*
