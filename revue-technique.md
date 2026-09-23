# Revue technique — Monde de Dev

Revue transversale du projet full-stack **Monde de Dev** : API Spring Boot (`back/`) et client Angular (`front/`).

## 1. Résumé exécutif

**Points forts majeurs :**
- Séparation des responsabilités propre et respectée sur toute la stack (couches back, `core`/`shared`/`features` front).
- Chaîne d'authentification (cookie `HttpOnly`, CSRF, pas de token manipulé en JS).
- Discipline de test (tests unitaires + `@WebMvcTest` + intégration côté back, Jest + Cypress côté front).

**Risques principaux (une mise en production) :**
- Pas de refresh token ni de révocation d'access token avant expiration.
- Rôle applicatif (`Role`) présent mais non exploité pour restreindre l'accès aux endpoints.
- Rate limiting en mémoire locale (Caffeine), non partagé entre instances.
- Versions de socle très récentes côté back (Java 26, Spring Boot 4.1.0) : peu de recul communautaire, risque de compatibilité avec l'écosystème.

## 2. Architecture backend

Monolithe Spring Boot 4.1.0 / Java 26, architecture en couches : `controller → service → repository → model`, avec des couches transverses `dto`, `mapper`, `exception`, `validation`, `documentation`, `config`. Base MySQL unique, schéma piloté exclusivement par des migrations Flyway versionnées (V1 à V13), `spring.jpa.hibernate.ddl-auto=validate` — Hibernate ne modifie jamais le schéma, il le vérifie seulement.

**Points forts :**
- Interfaces de service (`AuthService`, `PostService`...) séparées de leur implémentation (`*Impl`) — testabilité et découplage propres.
- Entités sans setters génériques, mutées via des méthodes de domaine explicites (`User.changeEmail`, `subscribeTo`, `Post.addComment`) : les invariants métier sont centralisés dans le modèle plutôt que dispersés dans les services.
- DTO en `record` Java, strictement séparés des entités JPA ; mapping via MapStruct généré à la compilation (erreurs de mapping détectées au build, pas à l'exécution).
- Gestion d'erreurs centralisée et standardisée (RFC 7807 `ProblemDetail` via `GlobalExceptionHandler`), API versionnée simplement par préfixe d'URL (`/api/v1`).

**Points d'attention :**
- **Java 26 + Spring Boot 4.1.0** sont des versions très récentes (au-delà des dernières LTS largement adoptées).
- `RateLimiterService` n'a pas d'interface dédiée, contrairement aux autres services — incohérence mineure avec la convention `Service`/`*Impl` du reste du package.

## 3. Architecture frontend

Angular 22 en composants **standalone** exclusivement (aucun `NgModule`), signals comme mécanisme de réactivité principal, formulaires via l'API récente `@angular/forms/signals` plutôt que Reactive Forms classique. Pas de store centralisé (NgRx) : l'état applicatif est porté par des signals locaux/scoped par composant ou service.

Structure `src/app/` en trois conventions strictement respectées :
- `core/` : uniquement de l'injectable (guards, interceptors, services transverses, models d'erreur) — aucun composant UI.
- `shared/` : uniquement du présentationnel réutilisable — aucun accès HTTP direct.
- `features/` : domaines métier autonomes (`auth`, `feed`, `post`, `profile`, `topic`...), chacun suivant le même sous-motif `{models,pages,services[,components]}`, sans import croisé entre domaines.

**Points forts :**
- Toutes les routes en lazy loading, y compris les layouts (`loadComponent`/`loadChildren`) — bundle initial allégé.
- Pattern de couche données cohérent et appliqué uniformément : lectures (GET) via `httpResource` (re-fetch réactif automatique quand les paramètres signal changent), écritures (POST/PATCH/DELETE) via `HttpClient`/`Observable`.
- Zéro usage de `any` dans le code source (`unknown` utilisé uniquement pour typer les corps de requête génériques dans les intercepteurs).
- TypeScript strict renforcé (`noImplicitOverride`, `noPropertyAccessFromIndexSignature`, `noImplicitReturns`, `noFallthroughCasesInSwitch`) + `strictTemplates`/`strictInjectionParameters`/`strictInputAccessModifiers` côté Angular.

**Points d'attention :**
- `SessionService` reste en RxJS (`BehaviorSubject<boolean>`) dans une application par ailleurs signals-first — à corriger si l'app grossit.
- Pas de bus d'erreur/toast unifié : chaque composant gère l'affichage de son propre `AppError` — cohérent avec la taille actuelle, à revoir si le nombre de features augmente.

## 4. Sécurité — vue transversale du flux d'authentification

1. **Login** (`POST /auth/login`) : `DaoAuthenticationProvider` exécute systématiquement une comparaison BCrypt (réelle ou factice) pour rendre le temps de réponse indépendant de l'existence du compte — protection anti-timing-attack et anti-énumération, réponse 401 générique en cas d'échec (identique pour "compte inexistant" et "mot de passe invalide").
2. **Transport du token** : le JWT (RS256, clé 2048 bits) est posé dans un cookie `access_token` (`HttpOnly`, `SameSite=Lax`, `Secure` en production) — jamais lu ni manipulé en JavaScript côté front, ce qui élimine le vecteur de vol de token par XSS classique (contrairement au `localStorage` de la v0.1.0).
3. **CSRF** : puisque l'auth repose sur un cookie envoyé automatiquement par le navigateur (contrairement à un header `Authorization`), une protection CSRF double-submit-cookie est en place des deux côtés — `CsrfCookieFilter` côté back pose le cookie `XSRF-TOKEN`, `xsrfInterceptor` côté front le recopie dans le header `X-XSRF-TOKEN` sur toute requête mutante. Cohérent et correctement câblé.
4. **CORS** : allow-list explicite par domaine (`app.domains.allows`/`DOMAINS`), pas de wildcard, `allowCredentials(true)` nécessaire pour l'envoi des cookies cross-origin — configuration saine.
5. **Détection de session côté client** : le cookie `HttpOnly` n'étant pas lisible en JS, le front sonde `GET /profile` au démarrage (`initSession()`) pour déterminer l'état de connexion, sans déclencher de redirection intempestive grâce au contexte `SKIP_AUTH_REDIRECT`.
6. **Changement de mot de passe** : re-vérification du mot de passe actuel côté serveur avant toute modification — protège contre un JWT compromis par un autre canal (poste partagé, token exfiltré).
7. **Rate limiting** : `/auth/login` et `/auth/register` protégés par un double compteur (IP + compte visé), token-bucket bucket4j/Caffeine.
8. **Secrets** : aucun secret committé — `.env.properties`/`.env.test.properties` gitignorés, seul un `.env.properties.example` avec placeholders et instructions de génération de clés RSA est versionné ; `docker-compose.yml` lit tout depuis des variables d'environnement.

## 5. Qualité de code & conventions

- **Conventions de nommage systématiques et respectées** des deux côtés : back (`*Impl`, `*Repository`, `*Controller`, `*Mapper`, `*Request`/`*Response`, `*IT.java`), front (kebab-case suffixé par rôle : `*-guard.ts`, `*-interceptor.ts`, `*-service.ts`, sélecteurs préfixés `app-`).
- **Contrôleurs backend délibérément minces** : validation d'entrée + délégation au service, aucune règle métier constatée dans la couche HTTP (ex. `PostController`).
- **Gestion d'erreurs centralisée des deux côtés** : `GlobalExceptionHandler` (RFC 7807) côté back, `mapHttpErrorToMessage()` + `errorInterceptor` côté front — pas de duplication de logique d'erreur dispersée dans chaque contrôleur/composant.
- **Typage strict** : records immuables + validation Bean Validation côté back, TypeScript strict renforcé + zéro `any` côté front.

## 6. Tests & couverture

| | Backend | Frontend |
|---|---|---|
| Outils | Surefire (unitaire/`@WebMvcTest`) + Failsafe (`*IT`, intégration) | Jest (unitaire) + Cypress (e2e) |
| Seuil de build | Jacoco 80% (instruction/branch/line/complexity/method/class) | Jest 80% (branches/fonctions/lignes/statements) + `nyc` 80% côté e2e |
| Couverture réelle mesurée | 99% instructions / 91% branches (service à 100%) | 98,5% statements / 91,7% branches (Jest) ; 93,4% statements / 93,7% branches (Cypress) |
| Volume | 33 fichiers de test pour 92 fichiers source | 39 `.spec.ts` pour 52 fichiers source (322 tests/43 suites) + 9 specs Cypress (47 tests) |
| Nature | 3 niveaux : unitaire (Mockito, sans base) / `@WebMvcTest` (contrôleur mocké) / intégration (`*IT`, contexte Spring complet, vraie base MySQL) | 2 niveaux : unitaire (composants/services/guards/interceptors isolés) / e2e (parcours utilisateur complets contre l'API réelle) |

## 7. Risques & recommandations priorisées

| Criticité | Sujet | Recommandation |
|---|---|---|
| Élevée | Pas de refresh token / révocation | Introduire un access token court (~15 min) + refresh token révocable, endpoint de renouvellement dédié, persistance serveur du refresh token — nécessaire avant toute mise en production avec de vrais utilisateurs. |
| Élevée | Rôles non appliqués | Ajouter un rôle `ADMIN` (ou équivalent) et sécuriser les endpoints sensibles via `hasRole(...)`/`@PreAuthorize` avant d'exposer des fonctionnalités de modération ou d'administration. |
| Moyenne | Image Docker en profil `test` par défaut | Créer un profil/image de production sans le clean+migrate automatique de `FlywayConfig`, pour ne pas risquer une perte de données en environnement réel. |
| Moyenne | Rate limiting non distribué | Prévoir un backend partagé (ex. `bucket4j-redis`) avant tout déploiement multi-instances ; configurer `server.forward-headers-strategy` si un reverse proxy est ajouté. |
| Faible | Versions bleeding-edge (Java 26, Spring Boot 4.1.0) | Surveiller la maturité de l'écosystème (drivers, librairies tierces) avant un usage en production ; pas d'action immédiate nécessaire pour un contexte formation. |
| Faible | `SessionService` en RxJS dans une app signals-first | Migrer vers `signal<boolean>`/`computed` par cohérence de style, sans urgence fonctionnelle. |
| Faible | Pas de linter backend (Checkstyle/Spotless/PMD) | Envisager un outil de style automatisé pour formaliser la cohérence déjà observée dans le code, à l'image d'ESLint côté front. |

