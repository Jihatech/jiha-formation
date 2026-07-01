---
id: git-cheatsheet
slug: git-cheatsheet
category: git
order: 1
title_fr: "Git : les commandes essentielles"
title_en: "Git: essential commands"
description_fr: "Cheatsheet des commandes Git à connaître : démarrage, cycle quotidien, branches, inspection et pièges classiques."
description_en: "Cheatsheet of the Git commands you need: setup, daily cycle, branches, inspection and classic pitfalls."
tags: [git, cli, cheatsheet]
updated: "2026-07-01"
related_guide: git-fondamentaux
---

## Démarrer | Getting started

:::lang fr
Avant tout premier commit, dis à Git qui tu es — ces infos sont gravées dans chaque commit. Ensuite, deux façons d'obtenir un dépôt : tu en crées un (`init`) ou tu en récupères un existant (`clone`).
:::
:::lang en
Before your first commit, tell Git who you are — that info is baked into every commit. Then there are two ways to get a repo: create one (`init`) or grab an existing one (`clone`).
:::

```bash
git config --global user.name "Ton Nom"
git config --global user.email "toi@example.com"

git init                # nouveau dépôt dans le dossier courant / new repo in current dir
git clone <url>         # copie un dépôt distant / copy a remote repo
```

## Le cycle quotidien | The daily cycle

:::lang fr
90 % de ta vie avec Git tient en cinq commandes. Le réflexe à prendre : `git status` avant et après chaque opération — c'est ta boussole, elle te dit toujours où tu en es et souvent quoi faire ensuite.
:::
:::lang en
90% of your life with Git fits in five commands. The habit to build: `git status` before and after every operation — it's your compass, it always tells you where you stand and often what to do next.
:::

```bash
git status                     # où j'en suis ? / where am I?
git add <fichier>              # stage un fichier / stage a file
git add -p                     # stage morceau par morceau / stage hunk by hunk
git commit -m "message clair"  # enregistre le snapshot / record the snapshot
git pull                       # récupère + intègre le distant / fetch + integrate remote
git push                       # publie tes commits / publish your commits
```

:::lang fr
Astuce : `git add -p` te fait relire chaque modification avant de la stager. C'est le meilleur moyen de faire des commits propres et d'attraper un `console.log` oublié.
:::
:::lang en
Tip: `git add -p` makes you re-read each change before staging it. It's the best way to craft clean commits and catch a forgotten `console.log`.
:::

## Branches | Branches

:::lang fr
Une branche coûte zéro : crée-en une par fonctionnalité ou correctif. Pour ramener son contenu, `merge` fusionne (historique fidèle), `rebase` réécrit tes commits par-dessus la cible (historique linéaire) — retiens juste : **jamais de rebase sur des commits déjà poussés et partagés**.
:::
:::lang en
A branch costs nothing: create one per feature or fix. To bring its content back, `merge` combines histories (faithful log), `rebase` replays your commits on top of the target (linear log) — just remember: **never rebase commits that are already pushed and shared**.
:::

```bash
git switch -c ma-feature   # crée et bascule / create and switch
git switch main            # revient sur main / back to main
git branch                 # liste les branches / list branches
git merge ma-feature       # fusionne dans la branche courante / merge into current branch
git rebase main            # rejoue tes commits sur main / replay your commits onto main
git branch -d ma-feature   # supprime une branche fusionnée / delete a merged branch
```

## Inspecter | Inspect

:::lang fr
Avant de committer, de merger ou de débugger : regarde. `diff` pour les modifs en cours, `log` pour l'histoire, `show` pour un commit précis, `blame` pour savoir quel commit a touché quelle ligne (et lire son message, pas pour accuser un collègue).
:::
:::lang en
Before committing, merging or debugging: look. `diff` for pending changes, `log` for history, `show` for a specific commit, `blame` to find which commit touched which line (and read its message — not to point fingers).
:::

```bash
git log --oneline --graph --all   # historique compact et visuel / compact visual history
git diff                          # modifs non stagées / unstaged changes
git diff --staged                 # modifs stagées / staged changes
git show <commit>                 # détail d'un commit / one commit in detail
git blame <fichier>               # qui a modifié quelle ligne / who changed which line
```

## Les pièges | Pitfalls

:::lang fr
Les erreurs qui reviennent tout le temps :

- **`git pull` avec des modifs en cours** → conflit ou refus. Commit ou `git stash` d'abord.
- **Committer sur `main` par réflexe** → prends l'habitude du `git switch -c` avant de coder.
- **⚠️ `git checkout -- <fichier>` / `git restore <fichier>`** écrase tes modifs non commitées, **sans retour possible**. Vérifie avec `git diff` avant.
- **⚠️ `git clean -fd`** supprime définitivement les fichiers non suivis. Fais toujours un `git clean -nd` (dry-run) d'abord.
- **Fichiers sensibles commités** (`.env`, clés) → un `.gitignore` propre dès le début coûte moins cher qu'une purge d'historique.

Pour annuler proprement une bêtise, voir la fiche [git-annuler](/docs/git/git-annuler).
:::
:::lang en
The mistakes that keep coming back:

- **`git pull` with pending changes** → conflict or refusal. Commit or `git stash` first.
- **Committing on `main` out of habit** → make `git switch -c` a reflex before coding.
- **⚠️ `git checkout -- <file>` / `git restore <file>`** overwrites your uncommitted changes, **with no way back**. Check with `git diff` first.
- **⚠️ `git clean -fd`** permanently deletes untracked files. Always run `git clean -nd` (dry-run) first.
- **Committed secrets** (`.env`, keys) → a proper `.gitignore` from day one is far cheaper than a history purge.

To cleanly undo a mistake, see the [git-annuler](/docs/git/git-annuler) sheet.
:::

```bash
git stash          # met de côté tes modifs en cours / shelve pending changes
git stash pop      # les récupère / bring them back
git clean -nd      # dry-run : montre ce qui serait supprimé / shows what would be deleted
```
