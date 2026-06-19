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

## Configuration Supabase (une fois)

1. **Migration** : exécuter `supabase/migrations/0001_init.sql` dans Supabase → SQL Editor
   (tables `profiles`/`progress`, RLS, RPC `set_progress`/`unset_progress`/`delete_account`).
2. **Google OAuth** : créer des identifiants OAuth (Google Cloud Console → APIs & Services →
   Credentials → OAuth client ID, type *Web application*), avec l'URI de redirection autorisée
   `https://<ref>.supabase.co/auth/v1/callback` ; coller `client_id`/`client_secret` dans
   Supabase → Authentication → Providers → Google.
3. **URL Configuration** : *Site URL* + *Redirect URLs* = `<NEXT_PUBLIC_SITE_URL>/auth/callback`.

## Déploiement Vercel

1. Importer le repo dans Vercel (framework Next.js auto-détecté, build `pnpm build`).
2. Variables d'environnement (Project Settings → Environment Variables) — cf. `.env.example` :
   - `NEXT_PUBLIC_SITE_URL` = l'URL de production Vercel
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` *(optionnel au MVP — réservé)*
3. Ajouter l'URL de prod dans les *Redirect URLs* Supabase + les *Authorized redirect URIs* du client OAuth Google.
4. (Phase 2) Webhook GitHub sur JIHA-Learn → *Deploy Hook* Vercel pour re-synchroniser le contenu.

## Avancement (phase 1 — MVP)

- [x] **Lot 1** — Scaffold + thème CRT/ambre + i18n (URLs par langue).
- [x] **Lot 2** — Sync contenu JIHA-Learn + parseur + rendu bilingue (Vaultwarden/Traefik, figures).
- [x] **Lot 3** — Supabase : auth (email+mdp + Google OAuth) + table `progress` + RGPD.
- [x] **Lot 4** — Dashboard de progression + marquage par `step-xx` + prochain guide.
- [ ] **Lot 5** — Déploiement Vercel _(config + CI prêts ; déploiement = action manuelle)_.
