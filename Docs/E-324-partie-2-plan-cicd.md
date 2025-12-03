# Plan CI/CD – Projet MOSBAM P Cloud

## 1. Objectifs du pipeline

### Fréquence des déploiements

- Objectif : déployer en production toutes les deux semaines (au minimum) et permettre des correctifs urgents en <24h.
- Justification : cadence alignée sur la vélocité du binôme et sur l’effort de validation manuelle côté enseignant, tout en gardant la possibilité de sorties rapides grâce à un pipeline automatisé.

### Besoins en rollback

- Mise en place d’images Docker versionnées pour le front (Nginx + build Vite) et l’API Node.js ; base de données MySQL sauvegardée automatiquement (dump journalier + sauvegarde avant migration).
- Rollback = redeployer l’image précédente + restaurer la BDD depuis le dernier snapshot validé. GitHub Actions conserve les artefacts nécessaires pendant 30 jours.

### Sécurité et conformité

- Scans automatiques (Dependabot + audit `npm audit`/`oxlint` + Snyk) à chaque PR.
- Secrets stockés dans GitHub Environments + Azure Key Vault. Aucun secret en clair dans le repo ou les workflows.
- Politique « branch protection » (revue + CI verte avant merge) pour éviter les modifications non vérifiées.

### Performances attendues

- Front précompilé via Vite + compression gzip/brotli, servi derrière Nginx.
- API dockerisée avec autoscaling horizontal (Azure Container Apps) sur base de CPU/RAM.
- Tests de charge légers (k6) exécutés en préproduction sur chaque release candidate.

### Contraintes techniques

- Monorepo avec deux runtimes (Node 20 pour l’API, Node 22 + Vite pour le front) → matrices de jobs nécessaires.
- Dépendance forte à MySQL 8 (Schéma géré par Sequelize) + stockage fichiers (uploads via Multer).
- Déploiement attendu sur infrastructure scolaire : priorité à des solutions containerisées (Docker Compose pour dev, Azure Container Apps + Azure Database for MySQL en prod).

## 2. Analyse technique

### Technologies et impact CI/CD

- **Frontend** : Vue 3 + Vite → nécessite étapes `npm install`, lint (ESLint/Oxlint), tests unitaires (Vitest), build `vite build`.
- **Backend** : Express + Sequelize → linting (Oxlint), tests (Jest/Supertest ou Vitest côté Node), migrations Sequelize, packaging docker.
- **Base de données** : MySQL 8 → migrations automatisées, backup avant déploiement, variables sensibles.
- **Docker Compose** pour dev → pipeline doit produire images compatibles Compose/k8s.
- **PDF/Docs** → non critiques pour pipeline mais stockés comme artefacts statiques.

### Hébergement et sécurisation

- **Staging & Prod** : Azure Container Apps (front + API) derrière Azure Front Door (TLS, WAF). MySQL managé (Azure Database for MySQL Flexible Server) avec firewall IP et connexions TLS obligatoires.
- Secrets de connexion gérés via Azure Key Vault et injectés comme variables d’environnement dans les containers.
- Sauvegardes automatisées MySQL + rétention 30 jours ; snapshots avant migration.

### Environnements

| Environnement | Usage                                       | Déploiement                                | Base de données                                  |
| ------------- | ------------------------------------------- | ------------------------------------------ | ------------------------------------------------ |
| Dev local     | Travail quotidien, Docker Compose           | manuel par les devs                        | MySQL locale via Compose                         |
| Intégration   | Tests automatiques post-merge sur `develop` | GitHub Actions (auto)                      | Base dédiée rafraîchie chaque nuit               |
| Staging       | Validation fonctionnelle par enseignant     | GitHub Actions (auto après release branch) | Clone ponctuel de prod, mêmes versions de schéma |
| Production    | Utilisateurs finaux                         | GitHub Actions (approbation manuelle)      | Azure MySQL HA + sauvegardes                     |

### Variables d’environnement clés

| Nom                                        | Service   | Usage                              |
| ------------------------------------------ | --------- | ---------------------------------- |
| `NODE_ENV`                                 | API/Front | Activer configuration adéquate     |
| `PORT`                                     | API       | Port d’écoute container            |
| `DATABASE_URL` (ou host/user/pass séparés) | API       | Connexion MySQL Sequelize          |
| `DB_SSL`                                   | API       | Forcer TLS vers MySQL managé       |
| `JWT_SECRET`                               | API       | Signature des tokens               |
| `REFRESH_TOKEN_SECRET`                     | API       | Sécuriser refresh tokens           |
| `STORAGE_PATH` ou `S3_BUCKET`              | API       | Localisation des fichiers uploadés |
| `FRONTEND_BASE_URL`                        | API       | Origine CORS autorisée             |
| `VITE_API_BASE_URL`                        | Front     | URL de l’API selon environnement   |
| `LOG_LEVEL`                                | API       | Ajuster verbosité                  |

### Secrets à protéger

- Identifiants MySQL (utilisateur, mot de passe, chaîne complète).
- Clés JWT (access + refresh).
- Credentials SMTP (si notifications mail) ou API externes (paiement, analytics).
- Clés SAS/Blob storage si les fichiers sont envoyés vers Azure Storage.
- Certificats TLS (gérés côté Front Door mais référencés dans Key Vault).

### Dépendances externes

- MySQL managé.
- Service d’envoi d’e-mails (SendGrid) pour validations/notifications.
- Eventuels webhooks tiers (paiements, outils école) → vérifier SLA avant intégration CI.

## 3. Conception du pipeline

### Vue d’ensemble

Pipeline GitHub Actions déclenché sur PR vers `develop`/`main` + planification nocturne pour scans. Diagramme à produire dans draw.io (`Docs/diagrams/pipeline-cicd.drawio`) suivant les étapes ci-dessous :

1. **Préparation** : checkout repo, configuration Node 20 & 22, cache npm.
2. **Lint & format** : `npm run lint` (front/back), `npm run format --check`, Oxlint.
3. **Tests unitaires** : `npm test` pour l’API (Jest/Vitest), `npm run test:unit` pour le front (Vitest). Rapports JUnit uploadés comme artefacts.
4. **Tests d’intégration** : démarrage MySQL via service container, exécution suites Supertest + tests API contractuels.
5. **Audits sécurité** : `npm audit --production`, `npx snyk test`, `npx osv-scanner` pour dépendances. Rapports en JSON + commentaires automatiques dans PR.
6. **Build** : `npm run build` (front) → artefacts `/dist`; API packagée via `docker build` (multi-stage) + image front (Nginx + dist). Images taggées `mosbam-frontend:${{ github.sha }}` etc.
7. **Tests d’image** : `docker run` + smoke tests (curl endpoints, vérifier 200 / heathcheck).
8. **Publication** : push images vers Azure Container Registry (ACR). Artefacts (dist tarball, docker compose override) stockés.
9. **Déploiements** :
   - Intégration/staging automatiques via `az containerapp update` déclenché après build.
   - Production déclenchée sur tag `v*` + validation manuelle (GitHub Environment `production`).
10. **Notifications** : Slack/Discord webhook résumant succès/échec.

### Feedback attendu

- Lint/test → rapports JUnit + annotations dans PR.
- Audits → rapport HTML/JSON attaché + commentaire.
- Build → temps de compilation + taille des artefacts.
- Déploiement → URL du release, numéro de version, changement appliqué.
- Incident → pipeline signale échec + ouvre GitHub Issue automatiquement si défaut récurrent.

## 4. Suivi et amélioration continue

- **Monitoring applicatif** : Azure Application Insights branché sur l’API (logs, exceptions, alertes temps de réponse > 1s). Front instrumenté via Azure Monitor + script RUM simple.
- **Logs centralisés** : sortie JSON de l’API envoyée vers Azure Log Analytics pour corrélation (reqId, userId, code HTTP).
- **Alerting** : règles sur disponibilité (Heartbeats toutes les 5 min) + erreurs 5xx > seuil. Alertes envoyées sur canal Discord #prod et e-mail enseignant.
- **Observabilité base de données** : metrics MySQL (CPU, connexions, débit) surveillés, alertes sur croissance anormale du stockage.
- **Amélioration continue** : rétrospective mensuelle sur incidents CI/CD, backlog "Tech Debt" alimenté automatiquement par les issues Dependabot/Snyk. KPIs suivies : taux de réussite pipeline, durée moyenne, temps de mise en production.
- **Post-release** : fenêtre d’observation 24h avec niveau de logs `debug`, puis retour à `info`. En cas d’incident, rollback orchestré par workflow dédié + post-mortem documenté dans Notion.

## 5. Procédure de déploiement (résumé)

1. Merge sur `develop` → pipeline complet jusqu’à déploiement auto en intégration.
2. Création d’une branche `release/vX.Y.Z` → mêmes étapes + déploiement en staging, validation fonctionnelle (checklist + tests manuels par enseignant).
3. Tag `vX.Y.Z` + approbation manuelle → déploiement production (front + API), migrations BDD exécutées via job dédié (Sequelize CLI) avec sauvegarde préalable.
4. Notification finale + création automatique d’une release GitHub (notes générées depuis Conventional Commits).
