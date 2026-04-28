# Runbook — efrei-projet-fil-rouge-cicd-frontend

Application frontend React déployée via Jenkins CI/CD sur Azure VM, servie par nginx dans Docker.

## Stack

- **Frontend** : React 17 + TypeScript, build via `react-scripts`
- **Conteneur** : nginx (multi-stage Docker build)
- **Registry** : `registry.spokayhub.top`
- **CI/CD** : Jenkins → Docker → Azure VM
- **Qualité** : SonarQube + Quality Gate

## Pipeline

```
Checkout → Test → SonarQube Analysis → Quality Gate → Build → Push → Deploy
```

Voir [JENKINS.md](JENKINS.md) pour la configuration complète (plugins, credentials, paramètres).

## Qualité de code

Analyse statique TypeScript/CSS via SonarQube, bloquante sur Quality Gate.

Voir [SONAR.md](./SONAR.md) pour la configuration du projet SonarQube.

## Environnements

| Env | VM | Compose file |
|-----|----|--------------|
| `stg` | `172.179.237.62` | `docker-compose.stg.yml` |
| `prod` | — | `docker-compose.prod.yml` *(à créer)* |

## Prérequis VM

- Docker + `docker compose` v2
- Port 80 ouvert
- Utilisateur SSH avec droits `docker`
