# CHECKLIST — Cohérence inter-guides & vérifications techniques

> À passer sur chaque guide **avant publication** (avant génération de la page et du PDF).
> Combine : cohérence du parcours, conformité au BUILD-SPEC, et les vérifications techniques
> issues de la passe qualité (erreurs réelles déjà rencontrées).
>
> Usage humain (relecture) ET base pour les agents critiques du pipeline IA.
> Version : 1.0 — juin 2026

---

## A. Cohérence de parcours (inter-guides)

- [ ] **Identifiant stable** : `id` sans accent, kebab-case, sans numéro de version, jamais modifié après publication.
- [ ] **Prérequis cohérents** : chaque `id` listé en `prerequisites` existe dans le manifeste et a un `order` inférieur (un prérequis vient avant dans le parcours).
- [ ] **Suite cohérente** : chaque `id` listé en `next` existe dans le manifeste.
- [ ] **Pas de cycle** : A prérequis de B et B prérequis de A = interdit.
- [ ] **Concepts chaînés** : un concept utilisé comme acquis ici a été introduit dans un guide prérequis (ne pas supposer connu ce qui n'a jamais été enseigné).
- [ ] **Vocabulaire constant** : un même concept porte le même nom dans tous les guides (ex. toujours « reverse proxy », pas tantôt « proxy inverse » tantôt « frontal »).
- [ ] **Niveau cohérent** avec la position : un guide `beginner` ne suppose pas d'acquis `advanced`.

## B. Cohérence technique transverse (⚠️ issues de la passe qualité réelle)

Ces points correspondent à des erreurs **réellement trouvées** dans les guides. Chaque agent critique doit les vérifier explicitement.

- [ ] **Noms de ressources partagées identiques entre guides liés.** Ex. le `certresolver` Traefik nommé `le` doit être appelé `le` dans Vaultwarden, Immich, monitoring — pas `letsencrypt` ici et `le` là. *(Bug réel : Vaultwarden utilisait `letsencrypt` au lieu de `le`.)*
- [ ] **Réseau Docker partagé cohérent.** Le réseau (`proxy`) porte le même nom partout, et seuls les services à exposer y sont attachés — jamais les bases de données / caches / services ML. *(Bug réel : risque d'exposer db/redis d'Immich.)*
- [ ] **Échappement des `$` correct selon le contexte.** Dans un `.env` chargé par `env_file` → valeur brute, **pas** de doublement. Dans le `compose.yaml` directement (interpolation `${...}`) → doubler en `$$`. Vérifier hashes (Argon2id, htpasswd, basic auth). *(Bug réel : instruction inversée dans Traefik, monitoring ET Vaultwarden.)*
- [ ] **Pas de guillemets parasites dans `.env`.** Les guillemets simples/doubles peuvent finir littéralement dans la valeur selon la version de Compose → casse silencieuse (ex. `ADMIN_TOKEN`). *(Bug réel : Vaultwarden.)*
- [ ] **Aucun binaire supposé présent dans une image minimale.** Ne pas appeler un outil (`sqlite3`, etc.) dans un conteneur via `exec` sans avoir vérifié qu'il existe dans l'image. Préférer l'outil de l'hôte ou la commande officielle. *(Bug réel : backup Vaultwarden appelait `sqlite3` absent de l'image.)*
- [ ] **Mécanisme ACME décrit correctement.** TLS challenge → port **443** requis depuis Internet ; HTTP challenge → port **80**. Ne pas confondre. *(Bug réel : Traefik affirmait que le port 80 servait au TLS challenge.)*
- [ ] **Portée d'un wildcard exacte.** Distinguer wildcard **DNS** (routage) et certificat **wildcard** (nécessite DNS challenge). Ne pas laisser croire qu'un TLS challenge produit un certif `*.domaine`. *(Bug réel : Traefik.)*
- [ ] **Versions d'images pinées**, jamais `:latest` (ni `release` flottant pour Immich). Cohérence avec `validated_version` du front-matter.
- [ ] **Examen ciblé toujours actif.** Le code de certification cité (titre, filière, quiz) n'est pas retiré par l'éditeur ; vérifié automatiquement par `retired-exams.json` (JIHA-Learn) et `pnpm check:exams`. *(Bug réel : toute la filière sécurité Azure préparait encore l'ex-AZ-500, retiré le 31/08/2026 au profit du SC-500.)*
- [ ] **Guide rejoué sur une machine vierge.** Chaque commande a été exécutée telle qu'écrite sur une Ubuntu neuve, avec la version courante des outils. *(Rejeu d'octobre 2026, filière Docker : 3 Dockerfile qui ne buildaient pas, 4 explications fausses sur Docker 29.)*
- [ ] **Pas de commentaire en fin d'instruction Dockerfile.** Seul `RUN` tolère `# …` en fin de ligne ; `COPY`, `ENV`, `ARG`… cassent le build ou créent des variables parasites. Vérifié par `node scripts/check-code.mjs` (JIHA-Learn). *(Bug réel : docker-images-dockerfile.)*
- [ ] **Sémantique vérifiée sur la version installée.** `prune --volumes` et `docker volume prune` n'enlèvent que les volumes anonymes depuis Docker Engine 23 ; `.NetworkSettings.IPAddress` n'existe plus en Docker 29 ; Docker Content Trust est retiré ; `docker compose up` applique `deploy.replicas`. QCM compris. *(Bugs réels : docker-fondamentaux, docker-stockage, docker-reseau, docker-securite, docker-swarm.)*
- [ ] **Attente explicite après un démarrage asynchrone.** Base de données lancée en `-d`, `docker stack deploy`, réconciliation Swarm : une vérification collée juste après échoue pour une mauvaise raison. Ajouter une attente ou `--detach=false`. *(Bugs réels : docker-fondamentaux, docker-swarm, docker-projet-entreprise.)*
- [ ] **Volumes déclarés par l'image montés sur un volume nommé.** Vérifier `docker image inspect <img> --format '{{json .Config.Volumes}}'` ; sinon `down`/`up` crée un volume anonyme orphelin. *(Bug réel : WordPress `/var/www/html` dans docker-compose.)*
- [ ] **Noms préfixés par la stack ou le projet.** `docker stack deploy … atelier` crée `atelier_redis-data` : le ménage vise le nom préfixé, sans masquer l'erreur par `2>/dev/null`. *(Bug réel : docker-projet-entreprise.)*
- [ ] **Rien de supposé présent sur une machine neuve.** Pas de `~/.bash_history`, pas de `sshd`, pas de `jq` : installer avant le bloc qui l'utilise, ou annoncer la sortie vide. *(Bug réel : art-of-command-line, le tout premier guide gratuit.)*
- [ ] **Accès distant protégé avant de le restreindre.** Avant de couper un mode d'accès (mot de passe SSH, root, port, pare-feu), le guide fait tester une **nouvelle** connexion depuis le poste de l'étudiant, dans un second terminal, et vérifie le port SSH réel. Pas de `--force`/`-y` qui retire le garde-fou natif (`ufw --force enable`). Bloc de retour arrière fourni. *(Bugs réels : linux-reseau-securite, linux-projet-entreprise.)*
- [ ] **Une option de tolérance n'est pas une validation.** Avec `nofail`, `mount -a` rend 0 même si l'UUID est faux : valider par `findmnt --verify`. Aucune écriture dans un fichier système (`fstab`, `sudoers`, `sshd_config`) avec une variable non vérifiée (`[ -n "$UUID" ]`). *(Bugs réels : linux-fichiers-disques, linux-projet-entreprise.)*
- [ ] **Sorties vérifiées dans une vraie session Ubuntu.** umask `0002` (fichiers `-rw-rw-r--`), `fs.protected_regular` dans `/tmp` (pas de démo de droits entre utilisateurs dans `/tmp`), `journalctl` sans `sudo` vide pour un compte hors `adm`. *(Bugs réels : linux-fondamentaux, linux-utilisateurs-permissions, linux-boot-systemd.)*
- [ ] **Exemples sur des éléments présents sur une machine neuve.** Un service, un paquet ou un outil cité (`ssh.service`, `parted`, `file`) est installé par le guide avant usage, ou remplacé par un élément présent (`cron`). *(Bugs réels : linux-utilisateurs-permissions, linux-fichiers-disques.)*
- [ ] **Ménage ciblé et sûr.** Il commence par `cd ~` (pas de « target is busy »), cible les ressources du guide (`losetup -d "$LOOP"`, pas `-D`), utilise `sudo` pour les fichiers créés par un service root. *(Bugs réels : linux-fichiers-disques, linux-boot-systemd.)*
- [ ] **Scripts : entrée validée, écriture atomique, exécution root sur un fichier root.** Argument non numérique refusé ; sauvegarde écrite dans un fichier temporaire puis `mv` ; un service root n'exécute jamais un script modifiable par l'utilisateur. *(Bugs réels : linux-scripting-bash, linux-projet-entreprise.)*
- [ ] **Un tableau de référence n'est pas un bloc `bash`.** Deux colonnes de commandes à lire vont en bloc `text`. *(Bug réel : linux-paquets.)*
- [ ] **Commande effet de bord = avertissement.** Toute commande destructive (`down -v`, `rm -rf`, `prune --volumes`, `--force`) est accompagnée d'un avertissement explicite.

## C. Conformité pédagogique (BUILD-SPEC §3 + ADN éditorial)

- [ ] **« Pourquoi » présent** pour chaque étape sensible (pas juste « tape ça »).
- [ ] **« Quand ce n'est PAS le bon choix »** présent dans l'intro.
- [ ] **Prérequis honnêtes** (pas « Docker installé » mais le concept réellement requis).
- [ ] **Critères de succès observables** (pas « voilà c'est fini »).
- [ ] **Pièges connus** : au moins 3, concrets, vécus.
- [ ] **Vérification après chaque étape** du walkthrough (action → pourquoi → vérification).
- [ ] **Au moins un schéma** dans la partie concepts (obligatoire, cf. BUILD-SPEC §2.5).
- [ ] **Ressources sans remplissage** : 3–5 liens officiels max, pas de bourrage.

## D. Conformité structurelle & technique (BUILD-SPEC §3, §5, §6)

- [ ] **Tous les blocs obligatoires présents** dans l'ordre canonique (§3.1), y compris bandeau CTA, CTA fort, bloc PDF, footer (injectés par le générateur — vérifier qu'ils apparaissent bien sur la page générée).
- [ ] **CTA plateforme** présents (haut + fin + footer), pointant vers `[URL_PLATEFORME]`.
- [ ] **Bouton/bloc PDF** présent et fonctionnel ; **feuille `@media print` testée** (schémas nets, code lisible, pas de coupure au milieu d'un bloc, URLs affichées).
- [ ] **Liens inter-guides résolus via le manifeste** : guides publiés → cliquables ; non publiés → grisés « bientôt / soon », jamais de 404, jamais codés en dur.
- [ ] **Page lisible sans JS** : contenu (texte, code, schémas) accessible si le JS échoue.
- [ ] **Métadonnées** : title, meta description, Open Graph FR/EN soignés (aperçu de partage Insta/LinkedIn correct).
- [ ] **Entrée manifeste** créée/à jour avec le bon `status`.

## E. Bilingue (BUILD-SPEC §3.5 + GUIDE-TEMPLATE)

- [ ] **Aucune section à moitié traduite** : chaque bloc de prose a sa paire `:::lang fr` + `:::lang en`.
- [ ] **Tous les champs front-matter `_fr` ET `_en`** remplis.
- [ ] **Légendes de schémas bilingues.**
- [ ] **Blocs de code non dupliqués** par langue (écrits une fois).
- [ ] **Bascule FR/EN cohérente** : pas de page moitié FR moitié EN après bascule.
- [ ] **PDF mono-langue propre** : un PDF FR, un PDF EN, jamais mélangés.

## F. Accessibilité & performance — socle (BUILD-SPEC §2.4, §5.5)

- [ ] **`prefers-reduced-motion` respecté** : effets terminal désactivables.
- [ ] **Contraste WCAG AA** (ambre sur sombre, et variante claire).
- [ ] **Navigation clavier** fonctionnelle.
- [ ] **Schémas avec alternative textuelle.**
- [ ] **Page légère** : SVG inline optimisés, JS minimal et différé, pas de framework lourd pour du statique.
- [ ] **Mobile d'abord** : l'audience arrive souvent depuis un lien Insta/LinkedIn sur mobile.

---

## Mode d'emploi pour le pipeline IA

Quand le pipeline génère un guide, configurer les **agents critiques** pour qu'ils vérifient ces listes par rôle :

- **Critique « débutant »** → section C (le « pourquoi » est-il clair pour qui n'y connaît rien ?).
- **Critique « sysadmin/technique »** → sections B et D (les commandes sont-elles justes ? les pièges techniques évités ?).
- **Critique « cohérence parcours »** → sections A et E (le guide s'insère-t-il proprement dans le skill tree, dans les deux langues ?).
- **Critique « plateforme/structure »** → sections D et F (conformité BUILD-SPEC, accessibilité, PDF).

La **section B est la plus précieuse** : elle encode des erreurs réelles déjà commises. Un agent qui la respecte évite de reproduire à l'échelle les bugs trouvés à la main.

---

*Documents associés : `BUILD-SPEC.md` (brief de génération) et `GUIDE-TEMPLATE.md` (format d'un fichier-guide).*
