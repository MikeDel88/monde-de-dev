# Monde de Dev — API

API REST (Spring Boot) du projet **Monde de Dev**, réseau social communautaire pour les développeurs (fil d'actualité par thèmes, articles, commentaires).

## Prérequis

- Java 26
- Maven (le wrapper `mvnw`/`mvnw.cmd` est fourni, aucune installation locale requise)
- MySQL 8 (ou Docker, voir plus bas)
- Docker + Docker Compose (pour l'environnement de test décrit dans le README racine)

## Configuration

Copier `src/main/resources/.env.properties.example` vers `src/main/resources/.env.properties` et renseigner :

- `DB_USER`, `DB_PASSWORD`, `DB_NAME` — accès à la base MySQL
- `DOMAINS` — liste des origines autorisées (CORS)
- `TOKEN_EXPIRATION` — durée de validité du JWT
- `RSA_PRIVATE_KEY`, `RSA_PUBLIC_KEY` — clés utilisées pour signer/vérifier les JWT (voir les instructions de génération dans le fichier d'exemple)

Ce fichier est gitignoré : ne jamais committer de vraies valeurs.

## Lancer l'API en local (profil `dev`)

```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

L'API démarre sur `http://localhost:9000/api/v1` (profil `dev`), Flyway applique les migrations sur la base configurée. La documentation OpenAPI/Swagger UI n'est exposée qu'en profil `dev`.

## Tests

Voir le [README racine](../README.md) pour l'environnement de test Docker complet (base MySQL jetable, seed de données, API en profil `test`) utilisé pour les tests d'intégration backend et les tests e2e Cypress du front.

En résumé :
- `mvnw test` : tests unitaires et `@WebMvcTest` (contrôleurs mockés) — fonctionne hors ligne, sans base de données.
- `mvnw verify` : ajoute la suite d'intégration (`src/test/java/.../integration/*IT.java`, contexte Spring complet) — nécessite une base MySQL accessible sur `localhost:3307` (ou l'environnement Docker du README racine).

Seuil de couverture Jacoco : 80% (instructions/branches/lignes/complexité/méthodes/classes).

## Documentation

- [`documentation/architecture.md`](documentation/architecture.md) — structure des packages, choix techniques
- [`documentation/endpoints.md`](documentation/endpoints.md) — endpoints de l'API
- [`documentation/security.md`](documentation/security.md) — authentification, CSRF, rate limiting
- [`documentation/schema-donnees.md`](documentation/schema-donnees.md) — schéma de base de données (migrations Flyway)
- [`documentation/tests.md`](documentation/tests.md) — stratégie de tests

## Limitations connues

Ce projet est un MVP réalisé en contexte de formation. Point notable avant tout déploiement en environnement réel :

- **Pas de profil de production dédié** : le `Dockerfile` fourni démarre toujours l'API avec `SPRING_PROFILES_ACTIVE=test`, profil sous lequel `FlywayConfig` exécute un `flyway.clean()` suivi d'un `flyway.migrate()` à **chaque démarrage** — ce comportement viderait une base de données réelle. Cette image ne doit donc être utilisée que pour l'environnement de test décrit ci-dessus, jamais déployée telle quelle en production.

D'autres points (absence de refresh token/révocation, rôle applicatif non exploité pour restreindre l'accès aux endpoints, rate limiting non distribué) sont détaillés dans `revue-technique.md` à la racine du dépôt.
