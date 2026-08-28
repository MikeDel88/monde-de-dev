# Changelog

Toutes les modifications notables de ce projet sont documentées dans ce fichier.

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
