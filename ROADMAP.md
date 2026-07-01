# ROADMAP — jiha.tech

> Organisation du produit, du contenu et des chantiers. Mise à jour au fil des sessions.
> Dernière mise à jour : 2026-07-01.

---

## 1. Le modèle (décidé)

**Hybride** : une couche OUVERTE pour l'acquisition, un PRODUIT gated pour la valeur.

| Couche | URL | Accès | Rôle |
|---|---|---|---|
| **Docs** (fiches) | `/[lang]/docs/…` | Ouvert, indexable | SEO / acquisition → CTA vers le parcours |
| **Parcours** (guides) | `/[lang]/guides/…` | Gated (1er guide public) | Le produit : progression validée par QCM |
| **Dashboard** | `/[lang]/dashboard` | Connecté | Suivi, reprise, prochain guide |

## 2. Où vit quoi (règle de contribution)

| Contenu | Repo / lieu | Comment en ajouter |
|---|---|---|
| **Guides du parcours** | `Jihatech/JIHA-Learn` → `content/<id>.md` + `guides.json` + `assets/figures/*.svg` | Format `docs/GUIDE-TEMPLATE.md`. Commit → redeploy plateforme (sync au build) |
| **Fiches /docs** | ce repo → `content-docs/<categorie>/<slug>.md` | Format `docs/FICHE-TEMPLATE.md`. Commit → build |
| **Quiz** | ce repo → `lib/quiz/data/<guide-id>.json` | 1-3 questions bilingues par `step-xx` |
| **Catégories docs** | ce repo → `lib/docs/categories.ts` | Ajouter une entrée |
| **Comptes & progression** | Supabase (`profiles`, `progress`) | Jamais de contenu en base |

Invariants : ids stables (jamais renommés) · bilingue FR/EN systématique · code jamais dupliqué par langue · manifeste = source de vérité de la structure.

## 3. Chantiers

### En attente d'action humaine
- [ ] **Committer le zip livré dans JIHA-Learn** (6 guides convertis + guides.json + 8 SVG) → les 8 guides apparaissent au redeploy.
- [ ] **Merger la PR #4** (gating + QCM + /docs) → mise en prod.

### Court terme (plateforme)
- [ ] Quiz des 6 nouveaux guides (après commit JIHA-Learn).
- [ ] **D2** — Recherche instantanée (Pagefind) sur /docs + sitemap.xml.
- [ ] **D3** — UX docs sur les pages guides : ToC à droite, admonitions `:::note/:::warning`, bouton copier le code.

### Moyen terme (contenu)
- [ ] Fiches /docs en continu (cadence visée : 1-2 / semaine — le SEO se cumule).
- [ ] **Guides adossés à des repos GitHub réels** (du concret : forker/déployer un vrai projet). S'intègre au manifeste (`repo` déjà prévu).

### Phase 2 (brief V2, §Niveau 3-4)
- [ ] Domaine `jiha.tech` branché sur Vercel.
- [ ] Freemium : activer le gating `access: free|premium` du manifeste + Stripe.
- [ ] Analytics (Plausible) + emails transactionnels (Resend).
- [ ] Webhook JIHA-Learn → Deploy Hook Vercel (resync auto du contenu).

## 4. Fait (phase 1)

- [x] Plateforme Next.js + thème CRT/ambre, bilingue `/fr`-`/en` (hreflang/canonical).
- [x] Sync build-time depuis JIHA-Learn + parseur GUIDE-TEMPLATE.
- [x] Auth Supabase (email+mdp + Google), RLS, RGPD (consentement + suppression).
- [x] Progression par étape + dashboard (statuts, prochain guide à prérequis vérifiés).
- [x] Home dynamique (hero terminal animé, logos outils, parcours verrouillé) + logo.
- [x] Gating (parcours inscrit, 1er guide public) + QCM séquentiels (traefik, vaultwarden).
- [x] Base de connaissances /docs (6 fiches, 3 colonnes, ToC, CTA tunnel).
- [x] CI lint+build, déploiement Vercel, migration Supabase appliquée.
