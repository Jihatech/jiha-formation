@AGENTS.md

# jiha-formation : plateforme de formation JIHA.tech

Plateforme en production sur Vercel (`learn.jiha.tech`) : comptes, parcours de
guides, QCM, examens blancs, progression. Objectif produit actuel : **des
étudiants peuvent s'inscrire et suivre le parcours**. Tout travail se juge à
cette aune.

## Carte des repos (où vit quoi)

| Repo | Rôle | Statut |
|---|---|---|
| `Jihatech/jiha-formation` (ici) | Plateforme Next.js 16 + Supabase, hébergée sur Vercel | Production |
| `Jihatech/JIHA-Learn` | Source de vérité du contenu : `content/<id>.md`, `guides.json`, `assets/figures/` | Production (sync au build) |
| `Jihatech/jiha-learn-infra` | Cluster Kubernetes homelab (Proxmox, Kestra, Ansible) | Gelé : réservé aux futurs labs étudiants hébergés |
| `Jihatech/jiha-learn-app`, `jiha-learn-gitops` | Vides | Ne rien y construire sans décision explicite |

Flux : commit sur `JIHA-Learn/main` → GitHub Action `vercel-resync` → Deploy Hook
Vercel → `prebuild` resynchronise le contenu (`scripts/sync-content.mjs`).

## Invariants (ne jamais casser)

- `id` de guide stable : c'est la clé de progression en base. Jamais renommé.
- Bilingue FR/EN systématique, URLs `/<lang>/...`, code jamais dupliqué par langue.
- `guides.json` = structure ; la base ne stocke que comptes + progression.
- Contenu de `content/` = généré par la sync. Ne pas l'éditer ici.
- Infos légales : uniquement dans `lib/legal/config.ts`.

## Toolbox (réutiliser, ne pas recréer)

| Besoin | Fichier |
|---|---|
| Format d'un guide | `docs/GUIDE-TEMPLATE.md` |
| Format d'une fiche /docs | `docs/FICHE-TEMPLATE.md` |
| Relecture d'un guide (bugs réels déjà vécus, section B) | `docs/CHECKLIST.md` |
| Specs | `docs/PLATFORM-SPEC.md`, `docs/BUILD-SPEC.md` |
| Planning | `ROADMAP.md` (à tenir à jour à chaque livraison) |

## Commandes

```bash
pnpm install
pnpm dev                 # sync contenu + serveur local
pnpm lint && pnpm exec tsc --noEmit
pnpm check               # parser + quiz + légal
pnpm build               # build de prod (sync + pagefind)
pnpm check:legal --strict  # bloquant avant ouverture publique
```

## Skills du projet

- `mise-en-prod` : toute livraison en production ou vérification « prêt pour les étudiants ».

## Règles de travail (orientées production)

1. **Chaque session se termine par une PR mergeable ou un stop explicite** qui dit ce qui bloque et qui doit agir.
2. **Debug limité dans le temps** : après 3 tentatives infructueuses sur un même problème, s'arrêter, écrire hypothèses et preuves, demander une décision.
3. **Pas de chantier hors objectif** : une amélioration qui ne rapproche pas d'un étudiant inscrit va dans `ROADMAP.md`, pas dans la PR courante.
4. **Preuve avant livraison** : lint, typecheck, `pnpm check` et `pnpm build` verts avant d'annoncer qu'un travail est fini.
5. Un bug trouvé = un garde-fou ajouté (test, check ou ligne de `docs/CHECKLIST.md`), pour ne jamais le revivre.
