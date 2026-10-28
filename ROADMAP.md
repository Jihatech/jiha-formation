# ROADMAP — jiha.tech

> Organisation du produit, du contenu et des chantiers. Mise à jour au fil des sessions.
> Dernière mise à jour : 2026-10-22.

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

### Maintenant : ouverture aux étudiants (go-live)
Objectif unique : un étudiant peut s'inscrire et suivre le parcours sans aide.
Checklist complète et preuves : skill `.claude/skills/mise-en-prod`.
- [x] Pages légales FR/EN (mentions, confidentialité, CGU) + liens footer et consentement.
- [x] CI bloquante : typecheck, parser, quiz (plateforme) ; lint strict `[A]`/`[E]` (JIHA-Learn).
- [ ] Compléter `lib/legal/config.ts` (exploitant, adresse, contact, directeur de publication, région Supabase).
- [ ] SMTP dédié (Resend) dans Supabase Auth.
- [ ] Écran de consentement Google OAuth publié.
- [ ] Parcours `journey-e2e` vert en production.
- [x] Parcours étudiant testé de bout en bout en local (`pnpm journey:student`, 16/16).
- [x] Corrigé : mot de passe oublié (le lien menait à une page inexistante, aucun écran pour choisir un nouveau mot de passe).
- [x] Corrigé : le menu affichait « Connexion » à un étudiant connecté (désormais « Déconnexion »).
- [ ] Emails Supabase (confirmation, réinitialisation) en anglais et au modèle par défaut : à traduire et habiller (Supabase > Auth > Email Templates).
- [ ] Environnement staging (`staging.learn.jiha.tech` + projet Supabase séparé) pour tester chaque PR sans toucher la prod.
- [ ] Auto-hébergement (`next start`) : pages prérendues /docs/<catégorie> et /legal en 404 quand Supabase est configuré (OK sur Vercel). À traiter avant toute migration vers le cluster.
- [x] Rejeu sur machine vierge du guide public et de la filière Docker (9 guides) : correctifs appliqués, garde-fou `check-code` dans JIHA-Learn.
- [x] Rejeu de la filière Linux (8 guides) sur VM systemd : correctifs appliqués (dont 3 risques de coupure SSH à distance).
- [ ] Rejeu des autres filières (Git, CI/CD, Ansible, Terraform, Kubernetes, homelab, clouds), une PR par filière.
- [ ] Rejouer les étapes LVM, reboot, GRUB et IPv6 de la filière Linux sur une vraie VM (non testables dans le bac à sable).
- [ ] Rejouer docker-swarm et docker-projet-entreprise sur une VM avec IPVS (routing mesh non testable dans le bac à sable).
- [ ] Header mobile : menu tronqué à 390 px (défilable horizontalement, peu découvrable).
- [x] Filière sécurité Azure : ex-AZ-500 remplacé par SC-500 (titres, quiz, badge) + garde-fou `check:exams`.
- [ ] SC-500 : écrire le volet « sécurisation des charges d'IA » (voir audit d'écart).

### Gelé (décision 2026-10-22)
- Cluster Kubernetes `jiha-learn-infra` : conservé pour les futurs labs étudiants hébergés (CaaS). La plateforme reste sur Vercel.
- App installable multiplateforme : piste PWA sur l'app existante, après le go-live.

### Court terme (plateforme)
- [x] **D2** — Recherche instantanée (Pagefind) sur /docs + sitemap.xml (+ robots.txt).
      Index généré au postbuild depuis les pages prérendues (`data-pagefind-body`,
      bilingue via `<html lang>`) ; sitemap = couche ouverte (home, docs, guide public).
- [x] **D3** — UX docs sur les pages guides : ToC à droite, admonitions `:::note/:::warning`, bouton copier le code.
      Admonitions dans la prose `:::lang` (guides ET fiches, syntaxe documentée
      dans les templates) ; bouton copier sur tous les blocs de code (terminaux
      et prose), rendu serveur + un seul îlot client délégué.

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
- [x] Les 8 guides convertis et publiés (JIHA-Learn) + quiz sur chaque étape.
- [x] Fixes prod : contenu embarqué dans les fonctions serverless
      (outputFileTracingIncludes) + route guide en force-dynamic
      (cookies interdits en rendu statique — DYNAMIC_SERVER_USAGE).
