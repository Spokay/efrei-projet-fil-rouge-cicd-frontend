# SonarQube — Configuration

## Serveur

- Instance : `sonar-spokay`
- URL : `https://sonar.spokayhub.top`

## Projet

- **Project key** : `efrei-projet-fil-rouge-cicd-frontend`
- **Config** : `sonar-project.properties` à la racine du repo

## Webhook Jenkins

Requis pour `waitForQualityGate`. Configurer dans SonarQube :
`Administration → Webhooks → Create`

| Champ | Valeur |
|-------|--------|
| Name | jenkins |
| URL | `https://<jenkins-url>/sonarqube-webhook/` |

## Quality Gate

Gate par défaut appliquée. Pipeline bloquée si échec.
