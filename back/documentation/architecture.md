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
| `spring-boot-starter-security` + `spring-boot-starter-security-oauth2-resource-server` | Authentification par JWT (RS256), détaillée dans [security.md](security.md) |
| `spring-boot-starter-validation` | Bean Validation sur les DTO d'entrée |
| `mapstruct` | Mapping DTO ↔ entités généré à la compilation |
| `lombok` | Réduction du boilerplate (getters/constructeurs, setters hors entités du domaine) |
| `springdoc-openapi-starter-webmvc-ui` | Génération OpenAPI + Swagger UI |

## Architecture en couches

**Légende** : le schéma ci-dessous se lit du haut vers le bas, dans le sens d'appel d'une requête HTTP (`Controller` appelle `Service`, qui appelle `Repository`, qui manipule `Model`) — les « couches transverses » listées juste après (dto, mapper, exception, validation, documentation, config) ne font pas partie de ce flux vertical : elles sont utilisées ponctuellement par plusieurs couches. Chaque package sous `com.openclassrooms.mddapi.*` correspond à une seule couche, jamais mélangée avec une autre (détail dans « Rôle de chaque package » ci-dessous). Les classes suivent des conventions de suffixage systématiques : `*Impl` pour l'implémentation d'une interface de service (ex. `AuthServiceImpl` implémente `AuthService`), `*Repository` pour une interface Spring Data JPA, `*Controller` pour un point d'entrée HTTP, `*Mapper` pour un convertisseur MapStruct, `*Request`/`*Response` pour un DTO d'entrée/sortie, et `*IT.java` pour un test d'intégration niveau 3 (contexte Spring complet, contre une vraie base — voir `../README.md`).

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
- **config** : configuration applicative (sécurité, propriétés typées, Flyway), appliquée en amont ou en support de tous les contrôleurs.

## Arborescence des packages

**Légende** : l'indentation indique l'imbrication des packages sous `com.openclassrooms.mddapi`, le commentaire en fin de ligne (`#`) liste les classes principales de chaque package. Cette arborescence reflète la même séparation que le schéma de la section précédente : les quatre premiers packages (`controller`, `service`, `repository`, `model`) correspondent au flux vertical d'appel d'une requête HTTP, les suivants sont les couches transverses (détail package par package dans « Rôle de chaque package » ci-dessous).

```
com/openclassrooms/mddapi/
├── controller/         # AuthController, PostController, ProfileController, TopicController
├── service/            # AuthService(+Impl), JwtService(+Impl), PostService(+Impl), ProfileService(+Impl), TopicService(+Impl), RateLimiterService
├── repository/         # CommentRepository, PostRepository, TopicRepository, UserRepository
├── model/              # BaseEntity, User, Topic, Post, Comment, Role (enum)
├── mapper/             # UserMapper, TopicMapper, PostMapper, CommentMapper
├── dto/
│   ├── request/        # RegisterRequest, LoginRequest, PostRequest, CommentRequest, SubscribeRequest, UpdateProfileRequest
│   └── response/       # PostFeedResponse, PostResponse, CommentResponse, ProfileResponse, TopicResponse, CursorPageResponse
├── exception/          # GlobalExceptionHandler, BodyProblemDetail, FieldError, ErrorCodes, *NotFoundException, InvalidCredentialsException, RateLimitExceededException
├── validation/         # ValidPassword
├── documentation/      # annotations OpenAPI par fonctionnalité : login, register, post, comment, topic, profile, user, database, ratelimit
├── config/
│   ├── properties/     # RsaConfigProperties, AppConfigProperties, RateLimitConfigProperties
│   ├── security/       # SecurityConfig, KeyConfig, AuthenticatedUser, CookieBearerTokenResolver, CsrfCookieFilter, JwtAuthenticationEntryPoint/AccessDeniedHandler, JwtClaimsConstants, PrincipalUtils
│   └── FlywayConfig     # actif uniquement sous le profil test
└── MddApiApplication.java   # point d'entrée Spring Boot
```

## Rôle de chaque package

`com.openclassrooms.mddapi.*` :

- **`controller`** — `AuthController`, `PostController`, `ProfilController`, `TopicController`. Points d'entrée HTTP : reçoivent la requête, déclenchent la validation des DTO (`@Valid`/`@Validated`), délèguent toute la logique au service correspondant, ne contiennent aucune règle métier.
- **`service`** — interfaces (`AuthService`, `JwtService`, `PostService`, `ProfilService`, `TopicService`) + implémentations `*Impl`, portant la logique métier (inscription, connexion, génération de JWT, construction du fil d'actualité, construction du profil utilisateur, abonnement à un topic) et la gestion des transactions (`@Transactional`, `readOnly = true` sur les lectures). `RateLimiterService` (sans interface dédiée) applique les limites de tentatives sur `/auth/login` et `/auth/register` — détail dans [security.md](security.md).
- **`repository`** — `CommentRepository`, `PostRepository`, `TopicRepository`, `UserRepository`. Interfaces Spring Data JPA : CRUD standard plus quelques requêtes dérivées (ex. `UserRepository.findUsersByEmailOrName`, pagination par curseur sur les posts).
- **`model`** — `BaseEntity`, `User`, `Topic`, `Post`, `Comment`. Entités JPA mappées sur les tables MySQL (migrations Flyway), avec leurs relations et stratégies de cascade documentées en Javadoc. `Role` (enum, une seule valeur `USER` pour le moment) porte le rôle applicatif d'un utilisateur, propagé dans les claims du JWT (détail dans [security.md](security.md)).
- **`mapper`** — `UserMapper`, `TopicMapper`, `PostMapper`, `CommentMapper`. Convertisseurs MapStruct (`componentModel = "spring"`, injectables comme des beans) entre entités et DTO, utilisés par les services. Les méthodes qui construisent une entité (`toUser`, `toPost`, `toComment`) sont des `default` methods écrites à la main plutôt que générées par MapStruct, car les entités n'exposent pas de setters : elles passent par le constructeur dédié de l'entité.
- **`dto.request` / `dto.response`** — records représentant les payloads HTTP : `RegisterRequest`, `LoginRequest`, `SubscribeRequest` en entrée ; `AuthResponse`, `PostFeedResponse`, `ProfileResponse`, `TopicResponse` en sortie. Découplent le contrat HTTP du modèle de données interne.
- **`exception`** — `GlobalExceptionHandler` (`@RestControllerAdvice`) centralise la traduction des exceptions en réponses HTTP ; `UserNotFoundException`/`TopicNotFoundException` (404) ; `BodyProblemDetail`/`FieldError` étendent `ProblemDetail` (RFC 7807) pour porter une liste d'erreurs de validation par champ.
- **`validation`** — `ValidPassword`, contrainte Bean Validation composée qui impose la robustesse du mot de passe (longueur, majuscule, minuscule, chiffre, caractère spécial).
- **`documentation`** — annotations OpenAPI composées, organisées par fonctionnalité (`login`, `register`, `topic`, `post`, `profil`, `user`, `database`), posées sur les méthodes de contrôleur pour documenter les réponses de succès et d'erreur dans Swagger.
- **`config.properties`** — `RsaConfigProperties`, `AppConfigProperties` et `RateLimitConfigProperties` : records `@ConfigurationProperties` (enregistrés via `@EnableConfigurationProperties` sur `MddApiApplication`) qui centralisent la lecture typée des propriétés custom d'`application.properties`. `AppConfigProperties` (préfixe `app`) porte `domains.allows` (CORS), `token.expiration` (durée de vie du JWT en jours) et `cookie.secure` ; `RateLimitConfigProperties` (préfixe `app.rate-limit`) porte les limites de tentatives par IP/compte pour `/auth/login` et `/auth/register`, consommées par `RateLimiterService`.
- **`config.security`** — `SecurityConfig` (chaîne de filtres HTTP, CORS, encodeur de mot de passe, `UserDetailsService`/`DaoAuthenticationProvider`/`AuthenticationManager` utilisés au login), `AuthenticatedUser` (adapte l'entité `User` au contrat `UserDetails`), `KeyConfig` (chargement des clés RSA via `RsaConfigProperties`, `JwtDecoder`/`JwtEncoder`), `JwtAuthenticationEntryPoint`/`JwtAccessDeniedHandler` (réponses 401/403). Détail complet dans [security.md](security.md).
- **`config`** (racine) — `FlywayConfig`, actif uniquement sous le profil `test` : autorise `flyway.clean()` et force un clean+migrate à chaque démarrage, pour repartir d'un schéma et de données propres. Utilisé par l'image Docker (voir [Déploiement](#déploiement)).
- **racine** — `MddApiApplication`, point d'entrée Spring Boot (`@SpringBootApplication`).

## Choix techniques et justifications

- **Monolithe plutôt que microservices** : projet à portée MVP/formation, un seul domaine métier et une petite équipe — pas de sous-domaines avec cycles de vie ou besoins de scalabilité indépendants qui justifieraient la complexité opérationnelle (déploiements séparés, communication réseau, cohérence distribuée) de microservices.
- **Couches Controller/Service/Repository avec interfaces de service** : sépare le contrat métier (`AuthService`) de son implémentation (`AuthServiceImpl`), isole les contrôleurs de la persistance, et permet de mocker l'interface en test sans dépendre de l'implémentation.
- **Spring Data JPA + MySQL** : ORM standard de l'écosystème Spring, réduit le code d'accès aux données au strict nécessaire — la plupart des repositories n'ont aucune méthode custom, seules les requêtes non couvertes par le CRUD standard (ex. recherche par email OU nom, pagination par curseur) sont ajoutées.
- **Flyway plutôt que Liquibase**, combiné à `spring.jpa.hibernate.ddl-auto=validate` : le schéma est piloté uniquement par des migrations SQL versionnées et lisibles (`db/migrations/V1...V13`) ; Hibernate ne fait que valider la cohérence du schéma au démarrage, il ne le modifie jamais — ce qui rend le schéma reproductible et prévisible en production. Choix documenté dans `../CHANGELOG.md`.
- **MapStruct plutôt qu'un mapping manuel ou par réflexion (type ModelMapper)** : le code de mapping est généré à la compilation, donc performant et vérifié par le compilateur (une erreur de mapping devient une erreur de build, pas un bug découvert à l'exécution). Choix documenté dans `../CHANGELOG.md`.
- **Lombok** : élimine le code répétitif (getters/constructeurs) sur les entités, laissant les classes centrées sur les champs et annotations métier. Les entités n'exposent volontairement pas de setters génériques (`@Setter` retiré) : elles sont construites via un constructeur dédié puis modifiées uniquement via des méthodes métier ciblées (`User.changeEmail`, `subscribeTo`, `Post.addComment`, ...) qui gardent les invariants du domaine (validations, synchronisation des deux faces d'une relation bidirectionnelle) au lieu de les disperser dans les services.
- **OAuth2 Resource Server + JWT signé RS256**, plutôt que des sessions serveur ou un JWT signé en HMAC : l'API reste stateless (`SessionCreationPolicy.STATELESS`), donc scalable horizontalement sans partage de session entre instances ; la signature asymétrique permet de ne distribuer que la clé publique aux services qui doivent seulement vérifier les tokens, sans exposer la clé privée de signature (détail dans `security.md`).
- **`ProblemDetail`/`BodyProblemDetail` (RFC 7807) + `GlobalExceptionHandler` centralisé** : un format d'erreur HTTP standardisé et cohérent sur toute l'API, avec un seul point de traduction des exceptions métier en réponses HTTP — évite de dupliquer des blocs try/catch dans chaque contrôleur.
- **`ValidPassword` en contrainte Bean Validation composée** : centralise la règle de robustesse du mot de passe (`@Size`/`@Pattern` empilés) en un seul endroit réutilisable, plutôt que de la coder à la main dans le service ou de la dupliquer.
- **Annotations OpenAPI composées custom** plutôt que des `@ApiResponse` répétés inline sur chaque contrôleur : springdoc déduit déjà automatiquement le schéma des DTO depuis les signatures Java, ces annotations documentent en plus les réponses d'erreur métier (404, 400, 409) qu'il ne peut pas déduire seul, de façon réutilisable entre endpoints (ex. `ApiUserNotFoundResponse` partagée entre `/auth/login`, `/posts` et `/topics/subscribe`).
- **DTO en `record` Java** : immuables par défaut, moins de code que des classes avec getters/constructeurs explicites — adapté à des objets de transfert qui ne changent jamais après construction.
- **Versioning d'API par préfixe d'URL (`/api/v1/...`)**, plutôt que par header : la version est visible directement dans l'URL. Le préfixe est appliqué globalement via `server.servlet.context-path=/api/v1` (`application.properties`), une propriété Spring standard suffisante pour un projet qui n'expose qu'une seule version de son API.
- **`@ConfigurationProperties` (records) plutôt que des `@Value` épars** : `RsaConfigProperties`, `AppConfigProperties` et `RateLimitConfigProperties` centralisent chacun en un seul endroit typé la lecture d'un groupe de propriétés custom, au lieu de dupliquer des `@Value("${...}")` dans plusieurs classes. `AppConfigProperties` utilise `@Name(...)` (ex. `@Name("token.expiration")`) pour binder un composant de record sur une propriété à chemin plus profond que le nom du composant lui-même.

## Persistance & migrations

Base MySQL unique, schéma géré exclusivement par des migrations Flyway versionnées dans `back/src/main/resources/db/migrations/` (`V1` à `V13`, notamment `V11` qui supprime une colonne `date` devenue obsolète sur `comments`, `V12` qui ajoute la colonne `role` sur `users`, et `V13` qui ajoute des index sur les clés étrangères de `posts`/`comments`/`subscriptions`). `spring.jpa.hibernate.ddl-auto=validate` garantit qu'Hibernate ne modifie jamais le schéma en dehors des migrations — il vérifie seulement au démarrage que les entités JPA correspondent au schéma réellement présent en base.

Des scripts de seed séparés (`back/src/main/resources/db/seed/seed_user.sql`, `seed_java_posts.sql`) permettent de peupler une base de démonstration avec un utilisateur et des posts d'exemple. Ils ne sont pas gérés par Flyway : ils sont exécutés uniquement par le service `seed` de `docker-compose.yml` (voir [Déploiement](#déploiement)).

## Sécurité

L'authentification repose sur un serveur de ressources OAuth2 validant des JWT signés en RS256, API stateless. Un rôle applicatif (`Role`, une seule valeur `USER` pour le moment) est propagé dans les claims du JWT mais n'est pas encore exploité pour restreindre l'accès aux endpoints. Détail complet (clés, durée de vie du token, routes publiques, limites connues et pistes de production) dans [security.md](security.md).

## Documentation de l'API

- Liste des routes (cibles et implémentées), toutes relatives au préfixe `/api/v1/` sauf mention contraire : [endpoints.md](endpoints.md).
- Documentation OpenAPI générée automatiquement, consultable via Swagger UI une fois l'application démarrée (désactivée par défaut, activée en profil `dev` via `springdoc.swagger-ui.enabled=true`).

## Déploiement

- **`Dockerfile`** : build multi-stage — une image `maven:3.9-eclipse-temurin-26` compile le jar (`mvn package`), une image finale `eclipse-temurin:26-jre` l'exécute. L'image tourne avec `SPRING_PROFILES_ACTIVE=test`, donc avec le comportement de `FlywayConfig` décrit plus haut (clean+migrate à chaque démarrage) : elle est pensée pour un environnement de démonstration/évaluation reproductible, pas pour un déploiement de production avec conservation des données.
- **`docker-compose.yml`** : orchestre un service `db` (MySQL 8.4), `api` (l'image ci-dessus, attend que `db` soit prête via `healthcheck`), `seed` (image `mysql:8.4` utilisée uniquement comme client, exécute `db/seed/seed_user.sql` puis `seed_java_posts.sql` une fois l'API démarrée) et `backend-test` (profil compose `test`, même build ciblant l'étape `build` du Dockerfile, lance `mvn test`).
- **`.dockerignore`** : exclut `target/`, `.git/`, `.idea/` et les fichiers Markdown du contexte de build.
