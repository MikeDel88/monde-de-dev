# P6-Full-Stack-reseau-dev

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