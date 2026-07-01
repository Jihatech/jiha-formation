---
id: git-annuler
slug: git-annuler
category: git
order: 2
title_fr: "Git : annuler (presque) n'importe quoi"
title_en: "Git: undo (almost) anything"
description_fr: "Restore, reset, revert, reflog : la bonne commande Git pour annuler chaque type d'erreur, sans casser l'historique partagé."
description_en: "Restore, reset, revert, reflog: the right Git command to undo each kind of mistake without breaking shared history."
tags: [git, annuler, restore]
updated: "2026-07-01"
related_guide: git-fondamentaux
---

## Annuler des modifs non stagées | Undo unstaged changes

:::lang fr
Tu as modifié un fichier et tu veux revenir à la dernière version commitée. ⚠️ `git restore` **écrase tes modifications sans retour possible** — vérifie avec `git diff` que tu ne jettes rien d'important.
:::
:::lang en
You changed a file and want to go back to the last committed version. ⚠️ `git restore` **overwrites your changes with no way back** — check with `git diff` that you're not throwing away anything important.
:::

```bash
git diff                   # relis ce que tu vas perdre / re-read what you're about to lose
git restore <fichier>      # ⚠️ écrase les modifs du fichier / discards the file's changes
git restore .              # ⚠️ écrase TOUTES les modifs / discards ALL changes
```

## Dé-stager un fichier | Unstage a file

:::lang fr
Tu as fait `git add` de trop ? `restore --staged` retire le fichier de la zone de staging **sans toucher à son contenu**. Aucun risque ici : tes modifs restent dans le fichier.
:::
:::lang en
Ran `git add` on too much? `restore --staged` removes the file from the staging area **without touching its content**. No risk here: your changes stay in the file.
:::

```bash
git restore --staged <fichier>
git restore --staged .     # dé-stage tout / unstage everything
```

## Corriger le dernier commit | Fix the last commit

:::lang fr
Message raté, fichier oublié ? `--amend` remplace le dernier commit par un nouveau. ⚠️ Ça **réécrit l'historique** : ne le fais que si le commit n'a **pas encore été poussé**. S'il est déjà sur le distant, utilise `revert` (section suivante).
:::
:::lang en
Bad message, forgotten file? `--amend` replaces the last commit with a new one. ⚠️ It **rewrites history**: only do it if the commit has **not been pushed yet**. If it's already on the remote, use `revert` (next section).
:::

```bash
git commit --amend -m "meilleur message"      # corrige le message / fix the message
git add fichier-oublie && git commit --amend --no-edit   # ajoute un fichier / add a file
```

## Annuler un commit poussé | Undo a pushed commit

:::lang fr
Le commit est déjà sur le distant, d'autres l'ont peut-être récupéré : ne réécris rien. `git revert` crée un **nouveau commit** qui applique l'inverse — l'historique reste intact et tout le monde reste synchronisé. C'est LA méthode sûre sur une branche partagée.
:::
:::lang en
The commit is already on the remote, others may have pulled it: don't rewrite anything. `git revert` creates a **new commit** that applies the inverse — history stays intact and everyone stays in sync. It's THE safe method on a shared branch.
:::

```bash
git revert <commit>        # annule ce commit par un commit inverse / undo via an inverse commit
git push
```

## Revenir en arrière localement | Roll back locally

:::lang fr
`git reset` déplace ta branche sur un commit antérieur. Trois modes, du plus doux au plus destructeur :

- `--soft` : les modifs des commits annulés restent **stagées** (parfait pour re-découper).
- `--mixed` (défaut) : elles restent dans les fichiers, **non stagées**.
- ⚠️ `--hard` : **tout est effacé**, commits ET modifs en cours. À réserver au local, et seulement après un `git status` propre dans ta tête.
:::
:::lang en
`git reset` moves your branch to an earlier commit. Three modes, from gentlest to most destructive:

- `--soft`: changes from the undone commits stay **staged** (great for re-splitting).
- `--mixed` (default): they stay in your files, **unstaged**.
- ⚠️ `--hard`: **everything is wiped**, commits AND pending changes. Local use only, and only when you're sure of your `git status`.
:::

```bash
git reset --soft HEAD~1    # annule le commit, garde tout stagé / undo commit, keep staged
git reset HEAD~1           # annule le commit, garde les fichiers / undo commit, keep files
git reset --hard HEAD~1    # ⚠️ efface commit ET modifs / wipes commit AND changes
```

## Retrouver un commit « perdu » | Recover a "lost" commit

:::lang fr
`reset --hard` de trop, branche supprimée ? Respire : un commit n'est presque jamais vraiment perdu. `git reflog` journalise **tous** les déplacements de `HEAD` pendant ~90 jours. Retrouve le hash d'avant la bêtise, et repars de là.
:::
:::lang en
One `reset --hard` too many, deleted a branch? Breathe: a commit is almost never truly lost. `git reflog` journals **every** move of `HEAD` for ~90 days. Find the hash from before the mistake, and start again from there.
:::

```bash
git reflog                        # historique des positions de HEAD / history of HEAD positions
git switch -c secours <hash>      # nouvelle branche sur le commit retrouvé / new branch on the recovered commit
```

## push --force : le vrai danger | push --force: the real danger

:::lang fr
⚠️ **Jamais de `git push --force` sur une branche partagée** : tu écrases les commits que tes collègues ont pu pousser entre-temps, sans avertissement. Si tu dois vraiment forcer (après un rebase de TA branche de feature), utilise `--force-with-lease` : il refuse de pousser si le distant a bougé depuis ta dernière lecture.
:::
:::lang en
⚠️ **Never `git push --force` on a shared branch**: you silently overwrite commits your teammates may have pushed in the meantime. If you really must force (after rebasing YOUR feature branch), use `--force-with-lease`: it refuses to push if the remote moved since you last fetched.
:::

```bash
git push --force-with-lease    # force "poli" : échoue si le distant a changé / "polite" force: fails if remote changed
```
