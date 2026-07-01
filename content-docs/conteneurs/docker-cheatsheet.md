---
id: docker-cheatsheet
slug: docker-cheatsheet
category: conteneurs
order: 1
title_fr: "Docker : les commandes essentielles"
title_en: "Docker: essential commands"
description_fr: "Cheatsheet des commandes Docker à connaître : cycle de vie, inspection, images, volumes, réseaux et pièges classiques."
description_en: "Cheatsheet of the Docker commands you need: lifecycle, inspection, images, volumes, networks and classic pitfalls."
tags: [docker, cli, cheatsheet]
updated: "2026-07-01"
related_guide: docker-fondamentaux
---

## Cycle de vie | Lifecycle

:::lang fr
Lancer, lister, arrêter, supprimer : 90 % de ton quotidien Docker tient dans ces quatre commandes. Retiens surtout que `docker ps` seul ne montre que les conteneurs **en cours d'exécution** — ajoute `-a` pour voir aussi les arrêtés.
:::

:::lang en
Run, list, stop, remove: 90% of your day-to-day Docker fits in these four commands. Key detail: `docker ps` alone only shows **running** containers — add `-a` to also see stopped ones.
:::

```bash
docker run -d --name web -p 8080:80 nginx:1.27   # lancer en arrière-plan / run detached
docker ps -a                                     # tous les conteneurs / all containers
docker stop web                                  # arrêt propre (SIGTERM) / graceful stop
docker start web                                 # relancer un conteneur arrêté / restart a stopped one
docker rm web                                    # supprimer (doit être arrêté) / remove (must be stopped)
```

:::lang fr
⚠️ `docker rm -f web` force la suppression d'un conteneur **en marche** (SIGKILL, sans arrêt propre). Pratique en dev, à éviter sur une base de données en prod.
:::

:::lang en
⚠️ `docker rm -f web` force-removes a **running** container (SIGKILL, no graceful shutdown). Handy in dev, avoid it on a production database.
:::

## Inspecter & déboguer | Inspect & debug

:::lang fr
Un conteneur qui ne répond pas ? Dans l'ordre : les logs, puis un shell dedans, puis les métadonnées complètes. `stats` te dit en direct qui mange ta RAM.
:::

:::lang en
Container not responding? In order: the logs, then a shell inside, then the full metadata. `stats` shows you live who's eating your RAM.
:::

```bash
docker logs -f --tail 100 web        # suivre les 100 dernières lignes / follow last 100 lines
docker exec -it web sh               # shell dans le conteneur / shell inside the container
docker inspect web                   # tout le JSON : IP, mounts, env / full JSON: IP, mounts, env
docker inspect -f '{{.State.Status}}' web   # un champ précis / one specific field
docker stats                         # CPU/RAM en temps réel / live CPU/RAM
```

:::lang fr
Astuce : `docker exec` exige un conteneur **en marche**. S'il crashe au démarrage, lis d'abord `docker logs web`, puis inspecte le code de sortie avec `docker inspect -f '{{.State.ExitCode}}' web`.
:::

:::lang en
Tip: `docker exec` requires a **running** container. If it crashes at startup, read `docker logs web` first, then check the exit code with `docker inspect -f '{{.State.ExitCode}}' web`.
:::

## Images | Images

:::lang fr
Une image est le modèle, le conteneur en est une instance. Pine toujours une version (`nginx:1.27`), jamais `latest` en prod : `latest` change sous tes pieds à chaque pull.
:::

:::lang en
An image is the template, a container is an instance of it. Always pin a version (`nginx:1.27`), never `latest` in production: `latest` shifts under your feet on every pull.
:::

```bash
docker pull nginx:1.27                     # télécharger / download
docker images                              # lister les images locales / list local images
docker build -t monapp:1.0 .               # construire depuis un Dockerfile / build from Dockerfile
docker tag monapp:1.0 registry.example.com/monapp:1.0
docker push registry.example.com/monapp:1.0
docker rmi monapp:1.0                      # supprimer une image / remove an image
```

## Volumes & réseaux | Volumes & networks

:::lang fr
Les données vivent dans les **volumes**, pas dans le conteneur : supprimer un conteneur ne touche pas ses volumes nommés. Les **réseaux** permettent aux conteneurs de se parler par leur nom (DNS interne).
:::

:::lang en
Data lives in **volumes**, not in the container: removing a container leaves its named volumes intact. **Networks** let containers reach each other by name (built-in DNS).
:::

```bash
docker volume create data
docker run -d --name db -v data:/var/lib/postgresql/data postgres:16
docker volume ls
docker volume inspect data                 # où c'est stocké sur l'hôte / where it lives on the host

docker network create backend
docker network connect backend web         # web peut joindre db par son nom / web can reach db by name
docker network ls
```

:::lang fr
⚠️ `docker volume rm data` détruit les données **définitivement**. Vérifie qu'aucun conteneur ne l'utilise et que tu as une sauvegarde.
:::

:::lang en
⚠️ `docker volume rm data` destroys the data **permanently**. Make sure no container uses it and you have a backup.
:::

## Les pièges | Pitfalls

:::lang fr
- **Le conteneur "s'arrête tout seul"** : un conteneur vit tant que son processus principal (PID 1) tourne. Si ta commande se termine (ou passe en daemon), le conteneur s'arrête. C'est normal.
- **`-p 8080:80` dans le mauvais sens** : c'est toujours `hôte:conteneur`. Le port de gauche est celui que tu ouvres dans ton navigateur.
- **Modifier un fichier dans le conteneur** : perdu au prochain `rm` + `run`. Toute donnée à conserver passe par un volume ou un bind mount.
:::

:::lang en
- **The container "stops by itself"**: a container lives as long as its main process (PID 1) runs. If your command exits (or daemonizes), the container stops. That's by design.
- **`-p 8080:80` the wrong way round**: it's always `host:container`. The left-hand port is the one you open in your browser.
- **Editing a file inside the container**: gone after the next `rm` + `run`. Anything worth keeping goes in a volume or bind mount.
:::

## Aller plus loin | Going further

:::lang fr
Ces commandes sont la surface ; pour comprendre ce qui se passe dessous (images, layers, isolation, Compose), suis le guide **Docker fondamentaux** du parcours.
:::

:::lang en
These commands are the surface; to understand what happens underneath (images, layers, isolation, Compose), follow the **Docker fundamentals** guide in the learning path.
:::
