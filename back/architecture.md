# Architecture

## Vue d'ensemble

L'API est un **monolithe Spring Boot** organisé en couches classiques (Controller → Service → Repository → Model), avec un seul déployable et une base de données MySQL unique. Pas de microservices, pas de message broker, pas de cache distribué : l'ensemble tient dans une seule application Spring Boot exposant une API REST/JSON consommée par le front Angular.

## Stack technique

| Brique | Rôle |
|---|---|
| Spring Boot 4.1.0 (parent Maven), Java 26 | Socle applicatif |
| `spring-boot-starter-web`/`webmvc` | Serveur HTTP embarqué, contrôleurs REST |
| `spring-boot-starter-data-jpa` + `mysql-connector-j` | Persistance ORM sur MySQL |
| `spring-boot-starter-flyway` + `flyway-mysql` | Migrations de schéma versionnées |
| `spring-boot-starter-security` + `spring-boot-starter-security-oauth2-resource-server` | Authentification par JWT (RS256), détaillée dans [security.md](./security.md) |
| `spring-boot-starter-validation` | Bean Validation sur les DTO d'entrée |
| `mapstruct` | Mapping DTO ↔ entités généré à la compilation |
| `lombok` | Réduction du boilerplate (getters/setters/constructeurs) |
| `springdoc-openapi-starter-webmvc-ui` | Génération OpenAPI + Swagger UI |

## Architecture en couches

```
HTTP request
     │
     ▼
 Controller   (validation d'entrée, sécurité par endpoint, délègue au service)
     │
     ▼
  Service     (interface + impl, logique métier, @Transactional)
     │
     ▼
 Repository   (Spring Data JPA)
     │
     ▼
   Model      (entités JPA ↔ tables MySQL)
```

Couches transverses, utilisées à plusieurs niveaux :
- **dto** : contrats d'entrée/sortie HTTP (records), indépendants des entités JPA.
- **mapper** : conversion DTO ↔ entités (MapStruct), appelée depuis les services.
- **exception** : gestion centralisée des erreurs (`@RestControllerAdvice`), appelée automatiquement par Spring quand un contrôleur/service lève une exception.
- **validation** : contraintes Bean Validation custom, appliquées sur les DTO reçus par les contrôleurs.
- **documentation** : annotations OpenAPI composées, posées sur les méthodes de contrôleur.
- **config.security** : configuration de la sécurité applicative (filtre HTTP, clés JWT), appliquée en amont de tous les contrôleurs.

## Rôle de chaque package

`com.openclassrooms.mddapi.*` :

- **`controller`** — `AuthController`, `PostController`, `TopicController`. Points d'entrée HTTP : reçoivent la requête, déclenchent la validation des DTO (`@Valid`/`@Validated`), délèguent toute la logique au service correspondant, ne contiennent aucune règle métier.
- **`service`** — interfaces (`AuthService`, `JwtService`, `PostService`, `TopicService`) + implémentations `*Impl`. Contient la logique métier (inscription, connexion, génération de JWT, construction du fil d'actualité, abonnement à un topic) et la gestion des transactions (`@Transactional`, `readOnly = true` sur les lectures).
- **`repository`** — `CommentRepository`, `PostRepository`, `TopicRepository`, `UserRepository`. Interfaces Spring Data JPA : CRUD standard plus quelques requêtes dérivées (ex. `UserRepository.findUsersByEmailOrName`).
- **`model`** — `BaseEntity`, `User`, `Topic`, `Post`, `Comment`. Entités JPA mappées sur les tables MySQL (migrations Flyway), avec leurs relations et stratégies de cascade documentées en Javadoc.
- **`mapper`** — `UserMapper`, `TopicMapper`, `PostMapper`. Convertisseurs MapStruct (`componentModel = "spring"`, injectables comme des beans) entre entités et DTO, utilisés par les services.
- **`dto.request` / `dto.response`** — records représentant les payloads HTTP : `RegisterRequest`, `LoginRequest`, `SubscribeRequest` en entrée ; `AuthResponse`, `PostFeedResponse`, `TopicResponse` en sortie. Découplent le contrat HTTP du modèle de données interne.
- **`exception`** — `GlobalExceptionHandler` (`@RestControllerAdvice`) centralise la traduction des exceptions en réponses HTTP ; `UserNotFoundException`/`TopicNotFoundException` (404) ; `BodyProblemDetail`/`FieldError` étendent `ProblemDetail` (RFC 7807) pour porter une liste d'erreurs de validation par champ.
- **`validation`** — `ValidPassword`, contrainte Bean Validation composée qui impose la robustesse du mot de passe (longueur, majuscule, minuscule, chiffre, caractère spécial).
- **`documentation`** — annotations OpenAPI composées, organisées par fonctionnalité (`login`, `register`, `topic`, `post`, `user`, `database`), posées sur les méthodes de contrôleur pour documenter les réponses de succès et d'erreur dans Swagger.
- **`config.properties`** — `ApiConfigProperties`, `RsaConfigProperties` et `AppConfigProperties` : records `@ConfigurationProperties` (enregistrés via `@EnableConfigurationProperties` sur `MddApiApplication`) qui centralisent la lecture typée des propriétés custom d'`application.properties` (`spring.mvc.apiversion.default`, `rsa.private-key`/`rsa.public-key`, `app.domains.allows`), injectés respectivement dans `WebMvcConfig`, `KeyConfig` et `SecurityConfig`.
- **`config.security`** — `SecurityConfig` (chaîne de filtres HTTP, CORS, encodeur de mot de passe), `KeyConfig` (chargement des clés RSA via `RsaConfigProperties`, `JwtDecoder`/`JwtEncoder`), `JwtAuthenticationEntryPoint`/`JwtAccessDeniedHandler` (réponses 401/403). Détail complet dans [security.md](./security.md).
- **`config.web`** — `WebMvcConfig` : préfixe toutes les routes des contrôleurs applicatifs (`com.openclassrooms.mddapi.controller`) avec `/api/v{version}` (version lue depuis `ApiConfigProperties`). La résolution de version d'API elle-même est entièrement pilotée par les propriétés `spring.mvc.apiversion.*` (auto-configuration Spring Boot), sans code Java dédié.
- **racine** — `MddApiApplication`, point d'entrée Spring Boot (`@SpringBootApplication`).

## Choix techniques et justifications

- **Monolithe plutôt que microservices** : projet à portée MVP/formation, un seul domaine métier et une petite équipe — pas de sous-domaines avec cycles de vie ou besoins de scalabilité indépendants qui justifieraient la complexité opérationnelle (déploiements séparés, communication réseau, cohérence distribuée) de microservices.
- **Couches Controller/Service/Repository avec interfaces de service** : sépare le contrat métier (`AuthService`) de son implémentation (`AuthServiceImpl`), isole les contrôleurs de la persistance, et permet de mocker l'interface en test sans dépendre de l'implémentation.
- **Spring Data JPA + MySQL** : ORM standard de l'écosystème Spring, réduit le code d'accès aux données au strict nécessaire — la plupart des repositories n'ont aucune méthode custom, seules les requêtes non couvertes par le CRUD standard (ex. recherche par email OU nom) sont ajoutées.
- **Flyway plutôt que Liquibase**, combiné à `spring.jpa.hibernate.ddl-auto=validate` : choix déjà tranché et documenté dans `CHANGELOG.md`. Le schéma est piloté uniquement par des migrations SQL versionnées et lisibles (`db/migrations/V1...V8`) ; Hibernate ne fait que valider la cohérence du schéma au démarrage, il ne le modifie jamais — ce qui rend le schéma reproductible et prévisible en production.
- **MapStruct plutôt qu'un mapping manuel ou par réflexion (type ModelMapper)** : le code de mapping est généré à la compilation, donc performant et vérifié par le compilateur (une erreur de mapping devient une erreur de build, pas un bug découvert à l'exécution). Choix déjà documenté dans `CHANGELOG.md`.
- **Lombok** : élimine le code répétitif (getters/setters/constructeurs) sur les entités, laissant les classes centrées sur les champs et annotations métier.
- **OAuth2 Resource Server + JWT signé RS256**, plutôt que des sessions serveur ou un JWT signé en HMAC : l'API reste stateless (`SessionCreationPolicy.STATELESS`), donc scalable horizontalement sans partage de session entre instances ; la signature asymétrique permet de ne distribuer que la clé publique aux services qui doivent seulement vérifier les tokens, sans exposer la clé privée de signature (détail dans `security.md`).
- **`ProblemDetail`/`BodyProblemDetail` (RFC 7807) + `GlobalExceptionHandler` centralisé** : un format d'erreur HTTP standardisé et cohérent sur toute l'API, avec un seul point de traduction des exceptions métier en réponses HTTP — évite de dupliquer des blocs try/catch dans chaque contrôleur.
- **`ValidPassword` en contrainte Bean Validation composée** : centralise la règle de robustesse du mot de passe (`@Size`/`@Pattern` empilés) en un seul endroit réutilisable, plutôt que de la coder à la main dans le service ou de la dupliquer.
- **Annotations OpenAPI composées custom** plutôt que des `@ApiResponse` répétés inline sur chaque contrôleur : springdoc déduit déjà automatiquement le schéma des DTO depuis les signatures Java, ces annotations documentent en plus les réponses d'erreur métier (404, 400, 409) qu'il ne peut pas déduire seul, de façon réutilisable entre endpoints (ex. `ApiUserNotFoundResponse` partagée entre `/auth/login`, `/feed` et `/topics/subscribe`).
- **DTO en `record` Java** : immuables par défaut, moins de code que des classes avec getters/constructeurs explicites — adapté à des objets de transfert qui ne changent jamais après construction.
- **Versioning d'API par préfixe d'URL (`/api/v1/...`)** plutôt que par header : la version est visible directement dans l'URL, cohérent avec ce qu'anticipait déjà [endpoints.md](./endpoints.md) (`PATH: api/v1/`). Le préfixe est appliqué uniquement aux contrôleurs applicatifs (`HandlerTypePredicate.forBasePackage("com.openclassrooms.mddapi.controller")`) et non à tous les `@RestController` : la documentation Swagger/OpenAPI de springdoc utilise aussi cette annotation en interne, mais une documentation d'API n'a pas vocation à être versionnée de la même façon que l'API elle-même.
- **`@ConfigurationProperties` (records) plutôt que des `@Value` épars** : `ApiConfigProperties`/`RsaConfigProperties` centralisent en un seul endroit typé la lecture des propriétés custom, au lieu de dupliquer des `@Value("${...}")` dans plusieurs classes (c'était le cas de `spring.mvc.apiversion.default`, lu à la fois dans `WebMvcConfig` et `SecurityConfig`). Le composant `apiVersionDefault` utilise `@Name("default")` pour se binder sur la propriété `spring.mvc.apiversion.default` : `default` étant un mot réservé Java, il ne peut pas être utilisé tel quel comme nom de composant de record — c'est la même technique que Spring Boot utilise en interne pour son propre champ équivalent (`WebMvcProperties.Apiversion.defaultVersion`).

## Persistance & migrations

Base MySQL unique, schéma géré exclusivement par des migrations Flyway versionnées dans `back/src/main/resources/db/migrations/` (`V1` à `V8` au moment de la rédaction). `spring.jpa.hibernate.ddl-auto=validate` garantit qu'Hibernate ne modifie jamais le schéma en dehors des migrations — il vérifie seulement au démarrage que les entités JPA correspondent au schéma réellement présent en base.

## Sécurité

L'authentification repose sur un serveur de ressources OAuth2 validant des JWT signés en RS256, API stateless, sans notion de rôle pour le moment. Détail complet (clés, durée de vie du token, routes publiques, limites connues et pistes de production) dans [security.md](./security.md).

## Documentation de l'API

- Liste des routes (cibles et implémentées), toutes relatives au préfixe `/api/v1/` sauf mention contraire : [endpoints.md](./endpoints.md).
- Documentation OpenAPI générée automatiquement, consultable via Swagger UI (`/swagger-ui.html`) une fois l'application démarrée.
