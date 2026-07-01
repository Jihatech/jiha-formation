# FICHE-TEMPLATE — Format d'une fiche de la base de connaissances

> Les fiches (`/docs`) sont la couche OUVERTE de jiha.tech : courtes, orientées
> réponse, indexables (SEO). Elles vivent dans `content-docs/<categorie>/<slug>.md`
> du repo plateforme. Même grammaire que les guides (`:::lang`, code partagé),
> avec deux différences : pas d'étapes `step-xx`, et des titres de section libres.

## Front-matter

```yaml
---
id: docker-cheatsheet            # stable, kebab-case, jamais renommé
slug: docker-cheatsheet
category: conteneurs             # id de catégorie (lib/docs/categories.ts)
order: 1                         # ordre dans la catégorie
title_fr: "Docker : les commandes essentielles"
title_en: "Docker: essential commands"
description_fr: "Cheatsheet des commandes Docker à connaître : cycle de vie, inspection, nettoyage."
description_en: "Cheatsheet of the Docker commands you need: lifecycle, inspection, cleanup."
tags: [docker, cli, cheatsheet]  # kebab-case, neutres en langue
updated: "2026-07-01"
related_guide: docker-fondamentaux   # optionnel : id de guide du parcours (CTA)
---
```

## Corps

- Sections `## <titre fr> | <titre en>` — le titre existe dans les deux langues,
  séparées par ` | `. L'ancre est dérivée du titre FR (kebab-case, sans accent),
  identique dans les deux langues. Sans ` | `, le même titre sert aux deux.
- Prose : paires `:::lang fr` puis `:::lang en` adjacentes, comme les guides.
- Blocs de code : écrits UNE fois, hors `:::lang` (jamais dupliqués/traduits).
- Pas de `### step-xx` (les fiches ne portent pas de progression).
- Longueur cible : 80–200 lignes. Une fiche = UNE question à laquelle on répond vite.

## Exemple de squelette

```markdown
## L'essentiel | The essentials
:::lang fr
[2-3 phrases droit au but.]
:::
:::lang en
[2-3 sentences, straight to the point.]
:::

```bash
docker ps -a
```

## Aller plus loin | Going further
[...]
```
