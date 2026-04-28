# Jenkins Pipeline — Environnement requis

## Plugins Jenkins requis

| Plugin | Usage |
|--------|-------|
| Git | Checkout |
| NodeJS | Outil `node-20` |
| Docker Pipeline | `withDockerRegistry` |
| SonarQube Scanner | `withSonarQubeEnv`, `waitForQualityGate` |
| SSH Agent | `sshagent` |
| Credentials Binding | `withCredentials` |

## Outils Jenkins (`Manage Jenkins → Tools`)

| Nom | Type | Version |
|-----|------|---------|
| `node-20` | NodeJS Installation | 20.x LTS |
| `SonarScanner` | SonarQube Scanner | latest |

## Configuration SonarQube (`Manage Jenkins → Configure System`)

- Serveur SonarQube nommé **`sonar-spokay`**
- Webhook SonarQube → Jenkins configuré (requis pour `waitForQualityGate`)
  - Dans SonarQube : `Administration → Webhooks → Create`
  - URL : `https://<jenkins-url>/sonarqube-webhook/`

Voir [SONAR.md](./SONAR.md) pour la configuration complète.

## Credentials requis

Les credentials suivent le pattern `{ENV}-{type}` où `{ENV}` = `stg`, `prod`, etc.

| Credential ID | Type | Contenu |
|---------------|------|---------|
| `registry-credentials` | Username/Password | Login Docker registry (partagé tous envs) |
| `frontend-{ENV}-ssh-credentials` | SSH Private Key | Clé SSH vers la VM cible (frontend) |
| `frontend-{ENV}-env` | Secret File | Fichier `.env` injecté dans le container |

## Paramètres pipeline

| Paramètre | Type | Défaut | Description |
|-----------|------|--------|-------------|
| `DEPLOY_ENV` | Choice | `stg` | Environnement cible (`stg`, `prod`, …) |
| `REGISTRY` | String | `registry.spokayhub.top` | URL du registry Docker |
| `GIT_URL` | String | URL du repo | URL du dépôt Git à builder |
| `GIT_BRANCH` | String | `master` | Branche Git à builder |
| `TARGET_PLATFORM` | String | `linux/arm64` | Plateforme Docker build |
| `VM_HOST` | String | — | IP ou hostname de la VM cible |
| `VM_USER` | String | — | Utilisateur SSH sur la VM cible |

## Ajouter un environnement (ex: `prod`)

1. Créer les credentials : `frontend-prod-ssh-credentials`, `frontend-prod-env`
2. Créer `docker-compose.prod.yml` à la racine du repo (copier `docker-compose.stg.yml`, adapter `container_name`)
3. Ajouter `prod` dans le `choices` du paramètre `DEPLOY_ENV` dans le Jenkinsfile
4. Lancer la pipeline avec `DEPLOY_ENV=prod`, `VM_HOST` et `VM_USER` de la VM prod

## Déploiement — fichiers transférés

Les fichiers sont déposés dans `/tmp/` à chaque déploiement (toujours accessible en écriture).

| Fichier | Destination |
|---------|-------------|
| `.env` (credential `frontend-{ENV}-env`) | `/tmp/frontend-{ENV}.env` |
| `docker-compose.{ENV}.yml` | `/tmp/docker-compose.{ENV}.yml` |

> Les variables d'environnement sont baked dans le container au `docker compose up`.
> Le restart automatique (`unless-stopped`) n'a pas besoin des fichiers `/tmp/`.

## Prérequis sur la VM cible

- Docker + Docker Compose plugin (`docker compose` v2)
- Port 80 ouvert
- Utilisateur SSH avec droits `docker`
