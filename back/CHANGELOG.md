# Changelog

Toutes les modifications notables de ce projet sont documentées dans ce fichier.

## [0.0.1] - 2026-08-26

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
