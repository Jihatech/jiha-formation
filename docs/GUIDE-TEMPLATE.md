# GUIDE-TEMPLATE — Format d'un fichier-guide

> Source de vérité d'un guide. Un seul fichier par guide, bilingue FR/EN.
> Lu par le générateur (cf. `BUILD-SPEC.md`) pour produire la page web et le PDF.
> Stocké dans `content/<identifiant>.md`.
>
> Version : 1.0 — juin 2026

---

## Principe

**Un fichier = un guide = les deux langues.** FR et EN vivent ensemble pour rester synchronisés : impossible de publier une section traduite à moitié sans que ça se voie à l'édition.

Deux zones :
1. **Front-matter (YAML)** — toutes les métadonnées, avec les champs courts dupliqués en `_fr` / `_en`. C'est ce qui alimente le manifeste, les métadonnées de page, les cartes de parcours.
2. **Corps (Markdown balisé)** — le contenu long. Chaque bloc de prose existe en deux versions, encadrées par des marqueurs de langue explicites.

Le générateur lit ce fichier et produit : la page bilingue (avec bascule), le PDF FR, le PDF EN, et l'entrée de manifeste.

---

## 1. Front-matter (métadonnées)

```yaml
---
# — Identité (ne change JAMAIS une fois publié, cf. BUILD-SPEC §6.1) —
id: vaultwarden
slug: vaultwarden
order: 6                         # position dans le parcours
status: published               # published | coming-soon

# — Titres & accroches (bilingue) —
title_fr: "Vaultwarden — Ton gestionnaire de mots de passe self-hosté"
title_en: "Vaultwarden — Your self-hosted password manager"
tagline_fr: "Déploie ton propre serveur compatible Bitwarden, léger et privé."
tagline_en: "Deploy your own lightweight, private Bitwarden-compatible server."

# — Métadonnées pédagogiques —
level: intermediate             # beginner | intermediate | advanced
duration_min: 45                # durée estimée en minutes
repo: "dani-garcia/vaultwarden" # repository source
validated_version: "1.34.1"     # version de l'outil validée
last_review: "2026-06-16"

# — Relations de parcours (par id, cf. manifeste) —
prerequisites: [docker-fondamentaux, docker-compose, traefik]
next: [monitoring, immich]

# — Concepts travaillés (bilingue, pour cartes & SEO) —
concepts_fr: [volumes-persistants, variables-environnement, reverse-proxy, token-admin-hashe]
concepts_en: [persistent-volumes, environment-variables, reverse-proxy, hashed-admin-token]

# — Accès (embryon du freemium, cf. BUILD-SPEC §7.2) —
access: free                    # free | premium  (v1 : toujours free)

# — Partage social (Open Graph) —
og_description_fr: "Guide pas-à-pas pour héberger Vaultwarden : Docker, HTTPS, sauvegardes."
og_description_en: "Step-by-step guide to self-host Vaultwarden: Docker, HTTPS, backups."
---
```

**Règles front-matter :**
- Tout champ destiné à l'affichage dans les deux langues est dupliqué `_fr` / `_en`.
- Les champs techniques (id, slug, order, level, durations, versions, relations) sont **neutres en langue** — pas de duplication.
- `id` et `slug` sont stables et immuables après publication.
- `prerequisites` et `next` référencent des `id` d'autres guides. Le générateur résout l'état (publié → lien actif ; sinon → grisé « bientôt / soon ») via le manifeste.

---

## 2. Corps — balisage bilingue

Le corps suit l'ordre des blocs défini dans `BUILD-SPEC.md §3.1`. Chaque bloc de **prose** est fourni dans les deux langues via des marqueurs explicites :

```markdown
:::lang fr
Vaultwarden est une réécriture open-source du serveur Bitwarden en Rust.
Il fait la même chose mais consomme 10 à 20× moins de ressources.
:::

:::lang en
Vaultwarden is an open-source rewrite of the Bitwarden server in Rust.
It does the same job but uses 10–20× fewer resources.
:::
```

**Le code, lui, n'est PAS dupliqué** : une commande `docker compose up -d` est identique en FR et EN. Seuls les commentaires/explications autour changent de langue. Les blocs de code sont donc écrits une fois, hors marqueurs de langue :

````markdown
:::lang fr
**🤔 Pourquoi `-d` ?** Le conteneur tourne en arrière-plan et te rend la main.
:::
:::lang en
**🤔 Why `-d`?** The container runs in the background and frees your shell.
:::

```bash
docker compose up -d
```
````

**Règles corps :**
- Tout texte lu par l'utilisateur a ses deux versions `:::lang fr` et `:::lang en`, adjacentes.
- Les blocs de code, commandes, et noms de fichiers ne sont **pas** traduits (écrits une seule fois).
- Les **schémas SVG** (obligatoires, cf. BUILD-SPEC §2.5) ont leurs **légendes** en deux langues ; le schéma lui-même est unique, mais ses libellés internes doivent être soit neutres, soit fournis en deux variantes (préciser au générateur lequel).
- Le générateur produit un PDF mono-langue en ne gardant qu'un jeu de marqueurs : un PDF FR propre, un PDF EN propre (jamais mélangés).

---

## 3. Squelette complet d'un fichier-guide

Ordre des sections aligné sur `BUILD-SPEC.md §3.1`. Chaque `## SECTION` regroupe ses paires `:::lang`.

```markdown
---
[front-matter complet — voir §1]
---

## intro
:::lang fr
[Pourquoi ce guide existe. À qui ça s'adresse. Quand ce n'est PAS le bon choix.]
:::
:::lang en
[Why this guide exists. Who it's for. When it's NOT the right choice.]
:::

## objectives        <!-- 🎓 Ce que tu vas apprendre / What you'll learn -->
:::lang fr
- [concept 1]
- [concept 2]
:::
:::lang en
- [concept 1]
- [concept 2]
:::

## prerequisites      <!-- ✅ liés au manifeste, cf. front-matter -->
:::lang fr
[Prérequis honnêtes + installation. Les prérequis-guides sont rendus en liens.]
:::
:::lang en
[Honest prerequisites + setup. Guide-prerequisites are rendered as links.]
:::

## concepts           <!-- 🗺️ théorie + SCHÉMAS OBLIGATOIRES -->
:::lang fr
[Concepts fondamentaux.]
:::
:::lang en
[Core concepts.]
:::

<!-- schéma : référence le SVG + légende bilingue -->
:::figure architecture
caption_fr: "Schéma 1. Architecture du service derrière le reverse proxy."
caption_en: "Figure 1. Service architecture behind the reverse proxy."
:::

## walkthrough        <!-- 🛠️ labs / étapes -->
### step-01
:::lang fr
**Objectif.** [ce que fait cette étape]
**🤔 Pourquoi ?** [justification]
:::
:::lang en
**Goal.** [what this step does]
**🤔 Why?** [rationale]
:::

```bash
[commande — non traduite]
```

:::lang fr
**✅ Vérification :** [comment savoir que c'est bon]
:::
:::lang en
**✅ Check:** [how to know it worked]
:::

### step-02
[...]

## pitfalls           <!-- ⚠️ Pièges connus / Known pitfalls -->
:::lang fr
[Les heures de galère qu'on épargne.]
:::
:::lang en
[The hours of pain we save you.]
:::

## success            <!-- 🧪 Tu sais que c'est bon quand… -->
:::lang fr
[Critères de succès observables, en cases à cocher.]
:::
:::lang en
[Observable success criteria, as checkboxes.]
:::

## next               <!-- 🚀 Et après ? + CTA plateforme (généré) -->
:::lang fr
[Suite logique. Les guides-suite sont rendus en liens via le manifeste.]
:::
:::lang en
[Logical next steps. Follow-up guides are rendered as links via the manifest.]
:::

## cheatsheet         <!-- imprimable -->
:::lang fr
[Aide-mémoire des commandes clés.]
:::
:::lang en
[Key commands quick reference.]
:::

## resources          <!-- 📚 liens officiels, sans remplissage -->
:::lang fr
- [Doc officielle](url)
:::
:::lang en
- [Official docs](url)
:::
```

> Les blocs **CTA plateforme**, **bouton PDF**, **bandeau**, **footer**, **sommaire** et **liens inter-guides** ne sont **pas** écrits dans le fichier-guide : ils sont **injectés par le générateur** à partir du BUILD-SPEC et du manifeste. L'auteur du guide se concentre sur le contenu pédagogique ; la mécanique de plateforme est ajoutée automatiquement.

---

## 4. Ce que l'auteur fournit vs ce que le générateur ajoute

| Fourni par l'auteur (ce fichier) | Ajouté automatiquement par le générateur |
|----------------------------------|-------------------------------------------|
| Front-matter (métadonnées bilingues) | Hero, métadonnées HTML / Open Graph |
| Contenu pédagogique des sections (FR+EN) | Sommaire ancré |
| Schémas SVG + légendes bilingues | Bandeau CTA + CTA fort + footer |
| Commandes et blocs de code | Bouton/bloc PDF + feuille print |
| Listes de prérequis/suite (par id) | Résolution des liens inter-guides + état « bientôt » |
| | Bascules langue/thème, effets terminal |
| | Entrée dans le manifeste `guides.json` |

---

## 5. Checklist de complétude d'un fichier-guide

Avant de passer un fichier-guide au générateur :

- [ ] `id` et `slug` choisis pour durer (aucune version, aucun accent, kebab-case)
- [ ] Tous les champs `_fr` ET `_en` du front-matter remplis (aucun oubli de traduction)
- [ ] `prerequisites` / `next` ne référencent que des `id` valides
- [ ] Chaque bloc de prose a sa paire `:::lang fr` + `:::lang en`
- [ ] Au moins un schéma dans `concepts` (obligatoire)
- [ ] Légendes de schémas bilingues
- [ ] Blocs de code écrits une seule fois (non dupliqués par langue)
- [ ] Section « pourquoi » présente pour chaque étape sensible du walkthrough
- [ ] Critères de succès observables (pas « voilà, c'est fini »)
- [ ] `status` correct (`published` quand prêt, sinon `coming-soon`)

---

*Document associé : `BUILD-SPEC.md` (brief de génération) et `CHECKLIST.md` (cohérence inter-guides + vérifications techniques).*
