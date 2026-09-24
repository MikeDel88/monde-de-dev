# Changelog

Toutes les modifications notables de ce projet sont documentées dans ce fichier.

## [1.0.1] - 2026-09-24

### Technique
- Assouplissement du rate limiting login/register en environnement de test (`application-test.properties`) pour ne plus bloquer la suite Cypress/e2e qui enregistre et connecte de nombreux utilisateurs en rafale
- Simplification d'un test (`PostServiceImplTest`) : suppression d'un matcher Mockito `eq()` superflu

## [1.0.0] - 2026-09-23

Version finale du MVP.

### Ajouté
- Pagination par keyset (curseur) de la liste des posts, avec tri et ordre configurables
- Rate limiting (bucket4j/Caffeine) sur les endpoints `/auth/login` et `/auth/register`
- Rôles applicatifs portés par les claims JWT (issuer, audience, rôle)
- Authentification par cookie `HttpOnly` (JWT) avec protection CSRF (`CsrfCookieFilter`)
- Restriction d'accès à un post dont le topic n'est pas suivi par l'utilisateur (exception 403 dédiée)
- Indexes sur les colonnes de clé étrangère (posts, comments, subscriptions)

### Sécurité
- Comparaison BCrypt systématique au login pour neutraliser les attaques par mesure de temps (timing attack)
- Suppression d'un log exposant le token JWT

### Technique
- Tri des commentaires par date directement porté par l'entité `Post`
- Immutabilité des entités : suppression des setters génériques, mutation via méthodes de domaine, `equals`/`hashCode` propres, suppression du cascade de persistance accidentel
- Validation renforcée des champs (tailles alignées sur le schéma BDD), normalisation (trim/lowercase) des entrées utilisateur
- Suite de tests d'intégration (`*IT`, contexte Spring complet contre une vraie base) et relèvement du seuil de couverture Jacoco de 70% à 80%
- Documentation technique : `endpoints.md`, `architecture.md`, `accessibility.md`, schéma de données, FAQ utilisateur

## [0.3.0] - 2026-09-07

### Ajouté
- Création d'un article (post) côté API, avec documentation OpenAPI
- Récupération du détail d'un article avec ses commentaires (tri du plus ancien au plus récent)
- Création d'un commentaire sur un article
- Exceptions personnalisées et réponses dédiées pour identifiants invalides et post introuvable (au lieu de topic introuvable)
- Codes d'erreurs métier documentés pour l'authentification et la mise à jour du profil

### Technique
- Tri de la liste des topics par ordre alphabétique
- Validation personnalisée du `topicId` (positif) sur le désabonnement
- Mise à jour de l'import `ObjectMapper` vers `tools.jackson.databind`
- Ajout des codes d'erreur possibles pour `LoginRequest`
- Nettoyage d'un import inutilisé

## [0.2.0] - 2026-08-28

### Ajouté
- Récupération de la liste des topics
- Abonnement et désabonnement à un topic
- Consultation et mise à jour du profil utilisateur (nom, email, liste des topics)
- Mise à jour séparée du mot de passe avec vérification du mot de passe actuel (`currentPassword`)
- Versioning de l'API (`/api/v1`) avec documentation et configuration dédiées

### Technique
- Persistance des clés RSA (publique/privée) entre les démarrages du serveur
- Migration Flyway v8 : suppression en cascade liée à un topic ou un utilisateur supprimé
- Validation des `@RequestParam`/`@PathVariable` (ex: `topicId` `@NotNull`) et gestion des exceptions associées
- Renommage de `ProfilResponse` en `ProfileResponse`
- Ajout de documentation Javadoc et OpenAPI sur les contrôleurs
- Nettoyage d'imports inutilisés

## [0.1.0] - 2026-08-26

### Ajouté
- Inscription (register) avec validation des DTO et gestion centralisée des erreurs (GlobalExceptionHandler, ProblemDetail)
- Connexion (login) avec authentification par JWT
- Génération et vérification des tokens JWT (clés publique/privée, JwtService, JwtEncoder/Decoder)
- Gestion des accès non autorisés (JwtAuthenticationEntryPoint, JwtAccessDeniedHandler)
- Modèle de données : entités User, Topic, Post, Comment, avec relations (abonnements aux topics, mappedBy)
- Contrainte d'unicité sur l'email et le nom d'utilisateur, sur le titre des topics
- Endpoint de récupération des posts du fil d'actualité
- Jeu de données initial de topics de programmation

### Technique
- Configuration de la sécurité de base de l'API (SecurityConfig)
- Migrations de base de données via Flyway (tables users, topics, posts, comments, subscriptions)
- Choix de Flyway à la place de Liquibase pour la gestion des migrations
- Ajout de MapStruct pour le mapping entités/DTO
- Ajout de la validation des DTO (starter validation)
- Documentation OpenAPI/Swagger UI
- Documentation `security.md` et `endpoints.md`
