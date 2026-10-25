---
name: mise-en-prod
description: Livrer une version de la plateforme JIHA.tech en production, ou vérifier qu'elle est prête pour que des étudiants s'inscrivent. Utiliser pour tout déploiement, release, go-live ou « est-ce que c'est prêt ? ».
---

# Mise en production de jiha-formation

## Objectif

Une version en production où un étudiant peut, sans aide : découvrir la
plateforme, s'inscrire, confirmer son email, se connecter, suivre un guide,
valider un QCM, retrouver sa progression et supprimer son compte.

## Entrées requises

- La branche ou la PR à livrer (par défaut : `main`).
- Le type de livraison : **release courante** (étapes 1 à 5) ou **ouverture publique** (étapes 1 à 6).

## Étapes (dans l'ordre, sans en sauter)

1. **Périmètre** : lister les PR incluses. Tout ce qui n'aide pas directement un étudiant inscrit est retiré de la livraison et noté dans `ROADMAP.md`.
2. **Preuve locale** : `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm check`, `pnpm build`. Tout doit être vert. Un échec = on corrige ou on retire la PR fautive, on ne contourne pas.
3. **CI** : la CI GitHub (`.github/workflows/ci.yml`) est verte sur le commit livré.
4. **Déploiement** : merge sur `main` → déploiement Vercel automatique. Vérifier que le déploiement de production est `READY` et noter son URL et son SHA.
5. **Vérification en production** (smoke test) :
   - `/fr`, `/en`, `/fr/signup`, `/fr/legal/notice` répondent 200.
   - Parcours complet : `BASE_URL=https://learn.jiha.tech TEST_EMAIL=… TEST_PASSWORD=… node scripts/journey-e2e.mjs` (compte de test dédié, jamais un compte réel).
   - Aucune nouvelle erreur runtime Vercel dans l'heure qui suit.
6. **Ouverture publique uniquement** : passer la checklist « Prêt pour les étudiants » ci-dessous.
7. **Trace** : rédiger les notes de version avec `templates/release-notes.md` et mettre à jour `ROADMAP.md`.

## Règles

- Utiliser `templates/release-notes.md` pour chaque livraison ; ne pas réinventer le format.
- Infos légales : modifier uniquement `lib/legal/config.ts`. Vérifier avec `pnpm check:legal --strict`.
- Si un point dépend d'une action humaine (console Supabase, Google Cloud, Resend, Vercel), **ne pas le cocher** : le lister dans le rapport final avec l'action exacte à faire et qui la fait.
- Debug limité : 3 tentatives max sur un même échec, puis stop avec hypothèses et preuves.
- Rollback : en cas de régression en production, **promouvoir le déploiement précédent dans Vercel d'abord**, corriger ensuite.
- Ne jamais livrer le premium (Stripe) sans CGV dédiées et `active: true` du sous-traitant Stripe dans `lib/legal/config.ts`.

## Test du parcours étudiant (avant toute livraison qui touche l'auth, les guides ou le tableau de bord)

En local, jamais sur la production (le script crée puis supprime un compte) :

```bash
npx supabase start -x vector,logflare,imgproxy,supavisor,postgres-meta   # Supabase + Mailpit
# .env.local : NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 + clés affichées par la commande
pnpm build && pnpm start
pnpm journey:student      # 16 vérifications, captures dans ./journey-shots
npx supabase stop
```

Couvre : inscription et consentement, email de confirmation, guide validé par QCM, persistance,
examen blanc, déconnexion, mot de passe oublié jusqu'au nouveau mot de passe, suppression du compte.
Non couvert (à tester à la main en prod) : connexion Google, emails réels (SMTP), paiement.

## Checklist « Prêt pour les étudiants » (ouverture publique)

| # | Point | Comment le prouver |
|---|---|---|
| L1 | Infos légales complètes | `pnpm check:legal --strict` sort en 0 |
| L2 | Pages légales liées au footer et à la case de consentement | Ouvrir `/fr/signup`, suivre les deux liens |
| E1 | SMTP dédié (ex. Resend) configuré dans Supabase Auth | Inscription test : email reçu en moins de 2 min, expéditeur `@jiha.tech` |
| E2 | Email de réinitialisation reçu | Parcours « mot de passe oublié » |
| G1 | Écran de consentement Google OAuth publié (hors mode Testing) | Connexion Google avec un compte non listé comme testeur |
| S1 | URL de prod dans *Site URL* et *Redirect URLs* Supabase | Confirmation email qui ramène sur `learn.jiha.tech` |
| S2 | Plan Supabase compatible avec l'usage (pause du projet gratuit après inactivité) | Décision écrite dans `ROADMAP.md` |
| P0 | Parcours étudiant complet vert en local | `pnpm journey:student` : 16/16 |
| P1 | Parcours e2e complet vert en production | `scripts/journey-e2e.mjs` |
| P2 | Suppression de compte effective | Compte test supprimé, reconnexion impossible |
| M1 | Rendu mobile correct (header, signup, guide) | Capture à 390 px de large |

## Definition of Done

- [ ] Étapes 1 à 5 faites et prouvées (commandes vertes, URL et SHA du déploiement notés).
- [ ] Pour une ouverture publique : les 10 points de la checklist sont prouvés, ou listés comme bloquants avec l'action humaine requise.
- [ ] Notes de version rédigées depuis `templates/release-notes.md`.
- [ ] `ROADMAP.md` à jour (date, ce qui est livré, ce qui est reporté).
- [ ] Aucun point coché sans preuve observable.

Vérifier ce travail contre cette Definition of Done **avant** de l'annoncer comme terminé.
