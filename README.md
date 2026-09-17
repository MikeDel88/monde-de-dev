# P6-Full-Stack-reseau-dev

## Tests backend (`back/`)

`mvn test` / `mvn clean test` / `mvn verify` nécessitent un MySQL accessible sur `localhost:3307` (voir `back/src/main/resources/.env.test.properties` pour les identifiants : `DB_USER=root`, `DB_PASSWORD=root`, `DB_NAME=monde_de_dev`).

Sans cette base, seul `MddApiApplicationTests` échoue (`Unable to obtain connection from database`) : c'est le seul test à charger le contexte Spring complet (datasource/JPA/Flyway réels). Les autres tests (unitaires services/config/mappers, `@WebMvcTest` des contrôleurs) n'en dépendent pas et passent normalement.

Pour démarrer rapidement un MySQL local le temps des tests :

```
docker run --rm -d --name mdd-mysql-test -p 3307:3306 \
  -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=monde_de_dev mysql:8
```