---
id: docker-nettoyage-disque
slug: docker-nettoyage-disque
category: conteneurs
order: 2
title_fr: "Docker : libérer de l'espace disque"
title_en: "Docker: reclaim disk space"
description_fr: "Disque plein à cause de Docker ? Diagnostique avec docker system df puis nettoie images, build cache, volumes et logs sans perdre tes données."
description_en: "Disk full because of Docker? Diagnose with docker system df, then clean images, build cache, volumes and logs without losing your data."
tags: [docker, disque, maintenance]
updated: "2026-07-01"
related_guide: docker-fondamentaux
---

## Diagnostiquer d'abord | Diagnose first

:::lang fr
Avant de supprimer quoi que ce soit, mesure. `docker system df` ventile l'espace par type (images, conteneurs, volumes, build cache) et surtout la colonne **RECLAIMABLE** : ce que tu peux récupérer sans risque.
:::

:::lang en
Before deleting anything, measure. `docker system df` breaks disk usage down by type (images, containers, volumes, build cache), and most importantly the **RECLAIMABLE** column: what you can safely get back.
:::

```bash
docker system df           # vue d'ensemble / overview
docker system df -v        # détail par image/volume/conteneur / per-item detail
sudo du -h --max-depth=1 /var/lib/docker | sort -hr   # qui pèse quoi sur le disque / what weighs what on disk
```

:::lang fr
Si `overlay2/` domine, ce sont les images et layers. Si `volumes/` domine, ce sont tes données (prudence). Si `containers/` est énorme, ce sont probablement des **logs** qui gonflent — voir plus bas.
:::

:::lang en
If `overlay2/` dominates, it's images and layers. If `volumes/` dominates, it's your data (be careful). If `containers/` is huge, it's probably **logs** ballooning — see below.
:::

## Nettoyer par cible | Clean by target

:::lang fr
Nettoie du moins risqué au plus risqué. Conteneurs arrêtés et images *dangling* (les `<none>` orphelines laissées par les rebuilds) : sans danger. Le build cache : sans danger aussi, il sera juste reconstruit au prochain build.
:::

:::lang en
Clean from least to most risky. Stopped containers and *dangling* images (the orphaned `<none>` left behind by rebuilds): harmless. Build cache: harmless too, it just gets rebuilt on the next build.
:::

```bash
docker container prune                 # conteneurs arrêtés / stopped containers
docker image prune                     # images dangling uniquement / dangling images only
docker image prune -a                  # + toute image sans conteneur associé / + any image not used by a container
docker builder prune                   # build cache
docker builder prune --filter until=168h   # cache de plus de 7 jours / cache older than 7 days
```

:::lang fr
:::warning
`docker image prune -a` supprime **toutes** les images qu'aucun conteneur n'utilise — y compris celles que tu comptais relancer plus tard. Elles seront re-téléchargées, mais sur une connexion lente ou un registre privé, ça se paie.
:::
:::

:::lang en
:::warning
`docker image prune -a` removes **every** image not used by a container — including ones you meant to run again later. They can be re-pulled, but on a slow connection or a private registry, that costs you.
:::
:::

## Volumes : la zone dangereuse | Volumes: the danger zone

:::lang fr
Les volumes contiennent tes **données** : bases de données, uploads, configs. Un volume "inutilisé" est juste un volume qu'aucun conteneur ne référence *en ce moment* — par exemple parce que tu as fait `docker compose down` avant de nettoyer.

⚠️ Ne lance jamais cette commande sans avoir listé et vérifié ce qu'elle va détruire. Un volume supprimé est **irrécupérable**.
:::

:::lang en
Volumes hold your **data**: databases, uploads, configs. An "unused" volume is just one no container references *right now* — for instance because you ran `docker compose down` before cleaning up.

⚠️ Never run this command without listing and checking what it's about to destroy. A deleted volume is **unrecoverable**.
:::

```bash
docker volume ls -f dangling=true      # d'abord : lister les candidats / first: list the candidates
docker volume prune                    # ⚠️ supprime les volumes non référencés / deletes unreferenced volumes
```

## Les logs qui gonflent | Ballooning logs

:::lang fr
Par défaut, le driver `json-file` écrit les logs de chaque conteneur dans `/var/lib/docker/containers/<id>/<id>-json.log` — **sans aucune limite**. Un conteneur bavard peut remplir ton disque en quelques semaines. Trouve les coupables :
:::

:::lang en
By default, the `json-file` driver writes each container's logs to `/var/lib/docker/containers/<id>/<id>-json.log` — **with no limit at all**. One chatty container can fill your disk in weeks. Find the culprits:
:::

```bash
sudo find /var/lib/docker/containers -name '*-json.log' -exec du -h {} + | sort -hr | head
```

:::lang fr
La vraie solution est de **plafonner** les logs via le daemon. Dans `/etc/docker/daemon.json` :
:::

:::lang en
The real fix is to **cap** logs at the daemon level. In `/etc/docker/daemon.json`:
:::

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

```bash
sudo systemctl restart docker
```

:::lang fr
Chaque conteneur sera limité à 3 fichiers de 10 Mo en rotation. Attention : ça ne s'applique qu'aux conteneurs **créés après** le redémarrage — recrée les existants (`docker compose up -d --force-recreate`) pour en profiter.
:::

:::lang en
Each container is capped at 3 rotated 10 MB files. Note: this only applies to containers **created after** the restart — recreate existing ones (`docker compose up -d --force-recreate`) to benefit.
:::

## Le grand nettoyage | The big cleanup

:::lang fr
⚠️ `docker system prune -a --volumes` combine tout : conteneurs arrêtés, **toutes** les images inutilisées, tout le build cache, tous les réseaux orphelins **et tous les volumes non référencés** — donc potentiellement tes bases de données si les services sont éteints à ce moment-là. Ne l'utilise que si tu peux répondre "oui" à : *"je peux tout perdre sur cette machine ?"*. Sinon, nettoie cible par cible comme ci-dessus.
:::

:::lang en
⚠️ `docker system prune -a --volumes` combines everything: stopped containers, **all** unused images, the whole build cache, orphaned networks **and every unreferenced volume** — potentially your databases if the services happen to be down at that moment. Only use it if you can answer "yes" to: *"can I afford to lose everything on this machine?"*. Otherwise, clean target by target as above.
:::

```bash
docker system prune                    # version prudente : ni images taguées, ni volumes / safe version: no tagged images, no volumes
docker system prune -a --volumes      # ⚠️ tout, y compris les volumes / everything, volumes included
```
