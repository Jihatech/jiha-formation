---
id: permissions-linux
slug: permissions-linux
category: linux
order: 1
title_fr: "Permissions Linux : chmod, chown et umask enfin clairs"
title_en: "Linux permissions: chmod, chown and umask made clear"
description_fr: "Comprendre les permissions Linux une bonne fois : lire ls -l, la notation octale, chmod, chown, et régler les erreurs Permission denied avec Docker."
description_en: "Understand Linux permissions once and for all: reading ls -l, octal notation, chmod, chown, and fixing Permission denied errors with Docker."
tags: [linux, permissions, chmod, chown]
updated: "2026-07-01"
related_guide: art-of-command-line
---

## Lire ls -l | Reading ls -l

```bash
ls -l script.sh
-rwxr-xr-- 1 alice devs 4096 Jul  1 10:00 script.sh
```

:::lang fr
Décompose `-rwxr-xr--` en 1 + 3 + 3 + 3 caractères :

- `-` : le type — `-` fichier, `d` dossier, `l` lien symbolique.
- `rwx` : le **propriétaire** (`alice`) peut lire, écrire, exécuter.
- `r-x` : le **groupe** (`devs`) peut lire et exécuter, pas écrire.
- `r--` : **les autres** peuvent seulement lire.

Trois blocs, toujours dans le même ordre : user, group, others. `r` = read, `w` = write, `x` = execute (pour un dossier, `x` = le droit d'y entrer).
:::

:::lang en
Break `-rwxr-xr--` into 1 + 3 + 3 + 3 characters:

- `-` : the type — `-` file, `d` directory, `l` symlink.
- `rwx` : the **owner** (`alice`) can read, write, execute.
- `r-x` : the **group** (`devs`) can read and execute, not write.
- `r--` : **others** can only read.

Three blocks, always in the same order: user, group, others. `r` = read, `w` = write, `x` = execute (for a directory, `x` means the right to enter it).
:::

## La notation octale | Octal notation

:::lang fr
Chaque droit vaut un nombre : `r` = **4**, `w` = **2**, `x` = **1**. Tu additionnes par bloc : `rwx` = 7, `r-x` = 5, `r--` = 4. D'où les classiques :

- **755** (`rwxr-xr-x`) : scripts et dossiers — le propriétaire fait tout, les autres lisent et traversent.
- **644** (`rw-r--r--`) : fichiers normaux — le propriétaire édite, les autres lisent.
- **600** (`rw-------`) : secrets (clés SSH, `.env`) — personne d'autre que toi.
:::

:::lang en
Each right has a value: `r` = **4**, `w` = **2**, `x` = **1**. Add them up per block: `rwx` = 7, `r-x` = 5, `r--` = 4. Hence the classics:

- **755** (`rwxr-xr-x`): scripts and directories — the owner does everything, others read and traverse.
- **644** (`rw-r--r--`): regular files — the owner edits, others read.
- **600** (`rw-------`): secrets (SSH keys, `.env`) — nobody but you.
:::

## chmod : changer les droits | chmod: changing rights

```bash
chmod 644 notes.txt        # octal : fixe tout d'un coup / octal: set everything at once
chmod u+x deploy.sh        # symbolique : ajoute x au propriétaire / symbolic: add x for the owner
chmod g-w,o-r config.yml   # retire w au groupe, r aux autres / remove w from group, r from others
chmod -R 755 /var/www/site # récursif sur un dossier / recursive on a directory
```

:::lang fr
Deux syntaxes, même résultat. L'octale (`chmod 644`) remplace **toutes** les permissions d'un coup — idéale quand tu sais l'état final voulu. La symbolique (`u+x`, `g-w`) modifie seulement ce que tu cites : `u`/`g`/`o`/`a` pour user/group/others/all, `+`/`-`/`=` pour ajouter/retirer/fixer.
:::

:::lang en
Two syntaxes, same result. Octal (`chmod 644`) replaces **all** permissions at once — ideal when you know the final state you want. Symbolic (`u+x`, `g-w`) only changes what you name: `u`/`g`/`o`/`a` for user/group/others/all, `+`/`-`/`=` to add/remove/set.
:::

## chown et chgrp : changer le propriétaire | chown and chgrp: changing ownership

```bash
sudo chown alice fichier.txt        # change le propriétaire / change the owner
sudo chown alice:devs fichier.txt   # propriétaire ET groupe / owner AND group
sudo chgrp devs fichier.txt         # groupe seulement / group only
sudo chown -R alice:devs /srv/app   # récursif / recursive
```

:::lang fr
`chmod` règle *quels droits* ; `chown` règle *à qui ils s'appliquent*. Changer le propriétaire demande `sudo` (tu ne peux pas « donner » un fichier). La forme `user:group` fait les deux en une commande.
:::

:::lang en
`chmod` sets *which rights*; `chown` sets *who they apply to*. Changing the owner requires `sudo` (you can't "give away" a file). The `user:group` form does both in one command.
:::

## Le classique « Permission denied » avec Docker | The classic Docker "Permission denied"

:::lang fr
Ton conteneur crashe avec `Permission denied` sur son volume monté ? C'est presque toujours un conflit d'UID : Linux ne compare pas des noms d'utilisateurs mais des **numéros**. Si le process du conteneur tourne avec l'UID 1000 mais que le dossier hôte appartient à root (UID 0), le conteneur ne peut pas écrire — peu importe les noms.

La solution : donner le dossier hôte à l'UID que le conteneur utilise (indiqué dans la doc de l'image, ou visible avec `docker exec <ctn> id`).
:::

:::lang en
Your container crashes with `Permission denied` on its mounted volume? It's almost always a UID mismatch: Linux doesn't compare usernames, it compares **numbers**. If the container process runs as UID 1000 but the host directory belongs to root (UID 0), the container can't write — names don't matter.

The fix: hand the host directory to the UID the container uses (stated in the image docs, or visible with `docker exec <ctn> id`).
:::

```bash
docker exec mon-conteneur id       # → uid=1000 gid=1000
sudo chown -R 1000:1000 ./app-data # aligne le dossier hôte sur l'UID du conteneur
                                   # align the host dir with the container UID
```

## umask en deux phrases | umask in two sentences

:::lang fr
`umask` définit les permissions **retirées par défaut** à chaque fichier créé : avec le umask courant `022`, un fichier naît en 644 (666 − 022) et un dossier en 755 (777 − 022). C'est pour ça que tes nouveaux fichiers ne sont jamais exécutables ni modifiables par le groupe sans que tu le demandes.
:::

:::lang en
`umask` defines the permissions **removed by default** from every file you create: with the common umask `022`, a file is born as 644 (666 − 022) and a directory as 755 (777 − 022). That's why your new files are never executable or group-writable unless you ask.
:::

## ⚠️ Ne fais pas chmod -R 777 | ⚠️ Don't chmod -R 777

:::lang fr
`chmod -R 777` « répare » l'erreur en donnant tous les droits à tout le monde — y compris à n'importe quel process compromis sur la machine. C'est le sparadrap qui masque le vrai problème (un mauvais propriétaire) et crée une faille durable.

À la place : identifie **qui** doit accéder (`ls -l`, `id`, `docker exec ... id`), puis corrige le propriétaire avec `chown` et garde des droits minimaux (755/644, 600 pour les secrets). Si plusieurs utilisateurs doivent écrire, crée un groupe commun plutôt que d'ouvrir à tous.
:::

:::lang en
`chmod -R 777` "fixes" the error by giving every right to everyone — including any compromised process on the machine. It's a band-aid that hides the real problem (wrong ownership) and leaves a lasting hole.

Instead: identify **who** needs access (`ls -l`, `id`, `docker exec ... id`), then fix ownership with `chown` and keep rights minimal (755/644, 600 for secrets). If several users must write, create a shared group rather than opening up to everyone.
:::
