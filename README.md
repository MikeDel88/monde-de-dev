# Monde de Dev

Monde de Dev est un réseau social destiné aux développeurs pour partager des articles techniques et échanger autour de thèmes (topics) qui les intéressent. Le projet est un monorepo composé de deux applications :

- **`back/`** — API REST en Spring Boot 4.1 (Java) : authentification par cookie JWT (RS256), gestion des thèmes, articles, commentaires et profils, persistée sur MySQL via Flyway. Documentation détaillée dans [`back/documentation/`](back/documentation/) (architecture, endpoints, sécurité, schéma de données).
- **`front/`** — Application Angular 22 (standalone components, signals) consommant cette API : inscription/connexion, fil d'actualité paginé, abonnement aux thèmes, rédaction d'articles et de commentaires, gestion du profil. Documentation détaillée dans [`front/documentation/`](front/documentation/) (analyse des besoins, accessibilité, architecture).

## User stories

- **Inscription** — En tant que visiteur, je peux créer un compte (nom, email, mot de passe) afin d'accéder au réseau.
- **Connexion / déconnexion** — En tant qu'utilisateur inscrit, je peux me connecter avec mon email ou mon nom et me déconnecter, avec une session gérée par cookie JWT (et une redirection automatique si elle expire).
- **Fil d'actualité** — En tant qu'utilisateur connecté, je peux consulter les articles des thèmes auxquels je suis abonné, triés par date et paginés avec défilement infini.
- **Consultation des thèmes et abonnement** — En tant qu'utilisateur connecté, je peux consulter la liste des thèmes disponibles et m'y abonner pour voir leurs articles dans mon fil.
- **Désabonnement** — En tant qu'utilisateur connecté, je peux me désabonner d'un thème depuis mon profil.
- **Rédaction d'un article** — En tant qu'utilisateur abonné à un thème, je peux y publier un article (titre + contenu).
- **Consultation et commentaire d'un article** — En tant qu'utilisateur connecté, je peux consulter le détail d'un article avec ses commentaires (triés du plus ancien au plus récent) et y ajouter un commentaire.
- **Gestion du profil** — En tant qu'utilisateur connecté, je peux consulter et modifier mon nom, mon email et mon mot de passe (confirmé par mon mot de passe actuel), ainsi que voir et gérer la liste de mes thèmes suivis.

## Environnement de test (`back/`)

Le dossier `back/` contient un `docker-compose.yml` qui fournit un environnement de test complet et rejouable : une base MySQL vidée/reseedée à chaque redémarrage, l'API packagée en `.jar` avec le profil `test`, et un runner pour les tests back — le tout branché sur les mêmes identifiants que `back/src/main/resources/.env.test.properties` (`DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DOMAINS`, `TOKEN_EXPIRATION`, `RSA_PRIVATE_KEY`, `RSA_PUBLIC_KEY`).

Prérequis : Docker + Docker Compose, et le fichier `back/src/main/resources/.env.test.properties` renseigné (voir `.env.properties.example` dans le même dossier pour le modèle).

Toutes les commandes ci-dessous sont à lancer depuis `back/`.

### Démarrer la base + l'API (profil `test`)

```bash
docker compose --env-file src/main/resources/.env.test.properties up -d --build db api
docker compose --env-file src/main/resources/.env.test.properties up seed
```

- `db` (MySQL) démarre, `api` attend qu'elle soit prête puis lance le `.jar` (`SPRING_PROFILES_ACTIVE=test`, Flyway migre le schéma) sur `http://localhost:9001/api/v1`.
- `seed` est un job ponctuel (il se termine avec `exited with code 0`, c'est normal) : il crée un utilisateur de test (`seed@monde-de-dev.local` / `Password123!`) puis insère 200 posts de démo sur le topic Java.

L'API est alors prête pour les tests **Cypress e2e** du front (`front/`, qui attend l'API sur `http://localhost:9001/api/v1`, cf. `front/src/environments/environment.test.ts`) :

```bash
cd ../front && npx cypress run
```

### Lancer les tests backend (`mvn verify`) contre cette base

```bash
docker compose --env-file src/main/resources/.env.test.properties --profile test run --rm backend-test
```

Ce runner exécute `mvn verify`, qui lance à la fois :
- les tests unitaires et `@WebMvcTest` (couche contrôleur, mockée), via Surefire (phase `test`) — ne nécessitent pas de base ;
- la suite d'intégration bout-en-bout `src/test/java/.../integration/*IT.java` (niveau 3 : contexte Spring complet, parcours complets contre la vraie base, sans mock des services — dont le smoke test `MddApiApplicationIT`), via Failsafe (phases `integration-test`/`verify`) — nécessite la base `db` démarrée.

`mvn test` seul (sans `verify`) n'exécute que les tests unitaires/`@WebMvcTest` : aucun test ne nécessite de base, il fonctionne donc hors ligne, sans Docker.

### Réinitialiser l'environnement (base vidée + reseedée)

```bash
docker compose --env-file src/main/resources/.env.test.properties down
```

Aucun volume n'est monté pour les données MySQL : `down` (ou la recréation du container `db`) repart d'une base vide à chaque fois. Relancer la séquence "Démarrer la base + l'API" ci-dessus pour retrouver un environnement propre et reseedé.

### Alternative : MySQL seul, tests lancés sur l'hôte

Sans passer par le container `api`, `mvn test` / `mvn clean test` fonctionnent directement sur l'hôte sans aucune base. `mvn verify` nécessite en plus un MySQL accessible sur `localhost:3307` (mêmes identifiants que `.env.test.properties`) : sans cette base, la suite `*IT` de `src/test/java/.../integration/` échoue (`Unable to obtain connection from database`) — ce sont les seuls tests à charger le contexte Spring complet (datasource/JPA/Flyway réels) ; les autres (unitaires services/config/mappers, `@WebMvcTest` des contrôleurs) n'en dépendent pas.

```bash
docker run --rm -d --name mdd-mysql-test -p 3307:3306 \
  -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=monde_de_dev mysql:8
```