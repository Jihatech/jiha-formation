# jiha-formation — Plateforme de formation jiha.tech

Plateforme de formation DevOps / cloud / self-hosting : comptes membres, suivi de
progression et parcours structuré, **par-dessus** le contenu pédagogique de la couche v1.

> **Source de vérité du contenu** : le repo [`Jihatech/JIHA-Learn`](https://github.com/Jihatech/JIHA-Learn).
> Cette plateforme **consomme** ses artefacts (`guides.json` + `content/<id>.md`) — elle ne les réécrit pas.
> Voir `docs/` (specs) et `PLATFORM-SPEC` pour le détail.

## Stack

- **Next.js 16** (App Router) — SSR/ISR, SEO bilingue.
- **Supabase** (Postgres + Auth) — comptes + progression _(Lot 3)_.
- **Vercel** — hébergement _(Lot 5)_.

## Principes non négociables (hérités des specs)

- **Bilingue FR/EN systématique**, URLs distinctes `/<lang>/guides/<id>/` + `hreflang`/`canonical`.
- **`guides.json` = source de vérité de la structure** ; la BDD ne stocke que comptes + progression.
- **`id` de guide stable** = clé de progression, jamais régénéré.
- **Thème terminal/CRT, ambre `#FFB627`**, sombre par défaut, `prefers-reduced-motion` respecté.

## Développement

```bash
pnpm install
pnpm dev          # http://localhost:3000 → redirige vers /fr ou /en
pnpm build        # build de production
pnpm lint
```

## Structure

```
app/[lang]/          Pages bilingues (routing par langue)
components/          Chrome (header, footer, bascules thème/langue)
lib/i18n/            Config locales + dictionnaires UI
proxy.ts             Redirection / → /<lang> (ex-middleware, convention Next 16)
content/             Contenu vendorisé depuis JIHA-Learn (Lot 2, généré — non édité à la main)
lib/content/         Parseur (grammaire :::lang / :::figure) + sync (Lot 2)
docs/                Specs de référence (PLATFORM-SPEC, BUILD-SPEC, GUIDE-TEMPLATE, CHECKLIST)
```

## Avancement (phase 1 — MVP)

- [x] **Lot 1** — Scaffold + thème CRT/ambre + i18n (URLs par langue).
- [ ] **Lot 2** — Sync contenu JIHA-Learn + parseur (cible : Vaultwarden bilingue avec figures).
- [ ] **Lot 3** — Supabase : auth (email+mdp + GitHub OAuth) + table `progress`.
- [ ] **Lot 4** — Dashboard de progression + marquage « terminé » (par `step-xx`).
- [ ] **Lot 5** — Déploiement Vercel.
