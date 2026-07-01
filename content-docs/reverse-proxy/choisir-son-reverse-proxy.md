---
id: choisir-son-reverse-proxy
slug: choisir-son-reverse-proxy
category: reverse-proxy
order: 1
title_fr: "Traefik, Nginx ou Caddy : lequel choisir ?"
title_en: "Traefik, Nginx or Caddy: which one to pick?"
description_fr: "Comparatif honnête de Traefik, Nginx et Caddy pour choisir le reverse proxy adapté à ton homelab ou ton serveur."
description_en: "An honest comparison of Traefik, Nginx and Caddy to pick the right reverse proxy for your homelab or server."
tags: [reverse-proxy, traefik, nginx, caddy]
updated: "2026-07-01"
related_guide: traefik
---

## À quoi ça sert | What it's for

:::lang fr
Un reverse proxy est le point d'entrée unique de ton serveur : il reçoit tout le trafic HTTP/HTTPS et le route vers le bon service selon le nom de domaine demandé. C'est aussi lui qui gère les certificats TLS — un seul endroit pour le HTTPS, au lieu d'un par service.
:::

:::lang en
A reverse proxy is the single entry point of your server: it receives all HTTP/HTTPS traffic and routes it to the right service based on the requested domain name. It's also where TLS certificates live — one place to handle HTTPS instead of one per service.
:::

## Les trois candidats | The three candidates

:::lang fr
**Traefik** est pensé pour les conteneurs. Il lit les labels de tes services Docker et crée les routes tout seul : tu ajoutes un conteneur avec 3 labels, il est en ligne avec HTTPS automatique (Let's Encrypt). Zéro reload, zéro fichier de conf par service. La contrepartie : la configuration initiale (fichier statique + labels dynamiques) demande un petit temps d'apprentissage, et le débogage peut être opaque au début.

**Nginx** est la référence historique : ultra-performant, présent partout, documenté à l'infini — la moindre erreur a déjà sa réponse sur Stack Overflow. Mais tout est manuel : un bloc `server` par service, un reload à chaque changement, et le HTTPS passe par certbot (un outil séparé, avec son cron de renouvellement). Ça marche très bien, mais ça ne s'automatise pas tout seul.

**Caddy** est le champion de la simplicité : HTTPS automatique par défaut (littéralement zéro config pour les certificats) et un `Caddyfile` de 3 lignes pour proxifier un service. Son écosystème est plus petit, et la découverte Docker native n'existe pas dans le binaire officiel (il faut un plugin tiers comme `caddy-docker-proxy`).
:::

:::lang en
**Traefik** is built for containers. It reads the labels on your Docker services and creates routes on its own: add a container with 3 labels and it's live with automatic HTTPS (Let's Encrypt). No reloads, no per-service config file. The trade-off: the initial setup (static file + dynamic labels) has a learning curve, and debugging can feel opaque at first.

**Nginx** is the historic reference: extremely fast, everywhere, endlessly documented — every error you'll ever hit already has a Stack Overflow answer. But everything is manual: one `server` block per service, a reload on every change, and HTTPS goes through certbot (a separate tool with its own renewal cron). It works great, but it doesn't automate itself.

**Caddy** is the simplicity champion: automatic HTTPS by default (literally zero config for certificates) and a 3-line `Caddyfile` to proxy a service. Its ecosystem is smaller, and native Docker discovery isn't in the official binary (you need a third-party plugin like `caddy-docker-proxy`).
:::

## Tableau de synthèse | Comparison table

:::lang fr
| Critère | Traefik | Nginx | Caddy |
|---|---|---|---|
| HTTPS auto | ✅ intégré (Let's Encrypt) | ❌ via certbot | ✅ intégré, zéro config |
| Découverte Docker | ✅ native (labels) | ❌ config manuelle | ⚠️ plugin tiers |
| Config | Moyenne (labels + statique) | Verbeuse, un fichier par service | Minimale (Caddyfile) |
| Écosystème | Grand, orienté conteneurs | Immense, ubiquitaire | Plus petit, en croissance |
:::

:::lang en
| Criterion | Traefik | Nginx | Caddy |
|---|---|---|---|
| Auto HTTPS | ✅ built-in (Let's Encrypt) | ❌ via certbot | ✅ built-in, zero config |
| Docker discovery | ✅ native (labels) | ❌ manual config | ⚠️ third-party plugin |
| Config | Medium (labels + static file) | Verbose, one file per service | Minimal (Caddyfile) |
| Ecosystem | Large, container-focused | Huge, ubiquitous | Smaller, growing |
:::

## Notre choix pour le parcours | Our pick for the track

:::lang fr
**Traefik.** Le parcours jiha.tech est centré sur Docker, et c'est exactement là que Traefik brille : chaque service que tu déploieras (Vaultwarden, Immich, monitoring…) s'expose avec quelques labels dans son `docker-compose.yml`, sans jamais toucher à la config du proxy. Tu apprends une fois, tu réutilises partout — et c'est le pattern que tu retrouveras en entreprise sur les stacks conteneurisées.
:::

:::lang en
**Traefik.** The jiha.tech track is Docker-centric, and that's exactly where Traefik shines: every service you'll deploy (Vaultwarden, Immich, monitoring…) exposes itself with a few labels in its `docker-compose.yml`, without ever touching the proxy config. Learn it once, reuse it everywhere — and it's the same pattern you'll meet at work on containerized stacks.
:::

```yaml
# Exposer un service avec Traefik = 3 labels / Exposing a service with Traefik = 3 labels
services:
  app:
    image: myapp:latest
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.app.rule=Host(`app.mondomaine.fr`)"
      - "traefik.http.routers.app.tls.certresolver=letsencrypt"
```

## Quand choisir autre chose | When to pick something else

:::lang fr
- **Caddy** si tu n'utilises pas (ou peu) Docker, ou si tu veux le HTTPS le plus simple du marché pour 2-3 services statiques. Pour un premier serveur sans conteneurs, c'est imbattable.
- **Nginx** si tu vises la performance brute (très fort trafic, cache fin, tuning), si ton hébergeur/ta boîte l'impose, ou si tu veux apprendre l'outil que tu croiseras dans 80 % des infras existantes.
- Et si tu as déjà un proxy qui marche : garde-le. Migrer un reverse proxy fonctionnel juste pour la hype est rarement un bon investissement.
:::

:::lang en
- **Caddy** if you use little or no Docker, or you want the simplest HTTPS out there for 2-3 static services. For a first server without containers, it's unbeatable.
- **Nginx** if you need raw performance (heavy traffic, fine-grained caching, tuning), if your host/company mandates it, or if you want to learn the tool you'll find in 80% of existing infrastructures.
- And if you already have a proxy that works: keep it. Migrating a working reverse proxy for the hype is rarely a good investment.
:::
