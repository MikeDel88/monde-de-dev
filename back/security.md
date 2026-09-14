# Sécurité

## Fonctionnement actuel (MVP)

L'authentification repose sur un serveur de ressources OAuth2 (`spring-boot-starter-oauth2-resource-server`) validant des JWT signés en RS256.

- **Clés RSA** (`KeyConfig`) : une paire de clés 2048 bits fixe est chargée au démarrage depuis les variables d'environnement `RSA_PRIVATE_KEY`/`RSA_PUBLIC_KEY` (via `.env.properties` en local, secret manager en production). Elle est stable entre redémarrages et partageable entre plusieurs instances, les tokens émis restent donc valides après un restart.
- **Génération du token** (`JwtServiceImpl`) : un seul type de token, l'access token, est généré. Il contient uniquement le `subject` (id de l'utilisateur), une date d'émission et une expiration fixée à **30 jours**. Aucun claim de rôle ou de scope n'est inclus.
- **Transport du token** : le client ne manipule plus le token en JavaScript. `POST /auth/login` le pose dans un cookie `access_token` (`HttpOnly`, `SameSite=Lax`, `Secure` en production via `app.cookie.secure`), lu côté serveur par `CookieBearerTokenResolver` (au lieu du header `Authorization`). `POST /auth/logout` invalide ce cookie (`Max-Age=0`).
- **Session** : l'API est stateless (`SessionCreationPolicy.STATELESS`), aucune session serveur n'est conservée.
- **CSRF** : réactivé (`CookieCsrfTokenRepository.withHttpOnlyFalse()` + `CsrfCookieFilter`), nécessaire dès lors que le JWT est porté par un cookie (contrairement au header `Authorization`, un cookie est envoyé automatiquement par le navigateur sur les requêtes cross-site). Le front envoie le token CSRF via le header `X-XSRF-TOKEN`, lu depuis le cookie `XSRF-TOKEN`.
- **CORS** : configuration explicite par domaine (`app.domains.allows`), `allowCredentials(true)` pour permettre l'envoi des cookies, headers autorisés incluant `X-XSRF-TOKEN`.
- **Autorisations** : pas de notion de rôle. Toute requête authentifiée est acceptée (`anyRequest().authenticated()`), il n'existe pas de distinction admin/utilisateur au niveau de l'entité `User` ni des endpoints.
- **Routes publiques** : documentation Swagger/OpenAPI (`/v3/api-docs`, `/swagger-ui.html`, non versionnée), ainsi que `/api/v1/auth/register` et `/api/v1/auth/login`.
- **Gestion des erreurs** : `JwtAuthenticationEntryPoint` renvoie un 401 JSON en cas d'authentification manquante/invalide, `JwtAccessDeniedHandler` renvoie un 403 JSON en cas d'accès refusé.
- **Changement de mot de passe** (`PATCH /profile/password`) : en plus d'un JWT valide, le `currentPassword` est désormais requis (`UpdateProfilPasswordRequest.currentPassword`, `@NotBlank`) et vérifié via `passwordEncoder.matches(...)` (`ProfilServiceImpl.updatePassword`) avant d'appliquer le nouveau mot de passe. Cela protège contre un JWT volé par un canal autre que le réseau (XSS, token exfiltré, poste partagé) : l'attaquant ne peut plus changer le mot de passe sans connaître l'ancien. Si `currentPassword` ne correspond pas, une exception dédiée `InvalidCurrentPasswordException` est levée et traduite par `GlobalExceptionHandler` en **400** avec le code `CURRENT_PASSWORD_INVALID` sur le champ `currentPassword`, distinct du 404 "utilisateur introuvable".
- **Login** (`POST /auth/login`) : l'authentification ne compare plus le mot de passe "à la main" après une recherche en base, mais délègue à un `AuthenticationManager` Spring Security (`SecurityConfig.authenticationManager`), adossé à un `DaoAuthenticationProvider` et à un `UserDetailsService` (`SecurityConfig.userDetailsService`, qui charge l'utilisateur par email ou nom et l'adapte au contrat `UserDetails` via `AuthenticatedUser`). `DaoAuthenticationProvider` exécute systématiquement une comparaison BCrypt — contre le hash réel si l'utilisateur existe, contre un hash factice sinon — ce qui rend le temps de traitement indépendant de l'existence du compte (voir ci-dessous). En cas d'échec, l'`AuthenticationException` levée par Spring Security n'est pas interceptée dans `AuthServiceImpl` : elle remonte jusqu'à `GlobalExceptionHandler.handleAuthenticationException`, qui la traduit en **401** générique (même réponse qu'un compte inexistant).

- **Rate limiting sur `/auth/login` et `/auth/register`** (`RateLimiterService`) : chaque appel est soumis à deux compteurs cumulés de type token-bucket (bucket4j), stockés en mémoire dans des caches Caffeine à expiration (`expireAfterAccess`, pas de partage entre plusieurs instances de l'application) :
  - une limite par **adresse IP** source (`request.getRemoteAddr()`, pas de gestion de `X-Forwarded-For` pour l'instant, l'application n'étant pas déployée derrière un reverse proxy),
  - une limite par **compte visé**, normalisé (`trim().toLowerCase()`) : `emailOrName` pour le login, `email` pour l'inscription.

  Valeurs par défaut (configurables via `app.rate-limit.*`, cf. `RateLimitConfigProperties`) :

  | Endpoint | Limite IP | Limite compte |
  |---|---|---|
  | POST /auth/login | 10 req / min | 5 req / min |
  | POST /auth/register | 5 req / min | 3 req / 10 min |

  Le dépassement de l'une ou l'autre limite lève `RateLimitExceededException`, traduite par `GlobalExceptionHandler` en **429** générique (ne précise pas laquelle des deux limites a été atteinte).

Ce fonctionnement est volontairement simple et suffisant pour un MVP, mais présente des limites : absence de révocation ou de renouvellement du token, durée de vie de l'access token beaucoup trop longue pour un usage sécurisé, absence de granularité des droits.

## À prévoir avant une mise en production

### ~~Cookie HttpOnly/Secure/SameSite~~ (corrigé)
Résolu : le token n'est plus porté par le client (`localStorage`) mais par un cookie `HttpOnly`, `Secure` (en production) et `SameSite=Lax`, voir "Transport du token" ci-dessus.

### Access token / refresh token
Il reste un seul type de token (l'access token actuel, durée de vie 30 jours), toujours sans révocation possible avant expiration. À prévoir :
- un **access token** de courte durée (ex. 15 minutes),
- un **refresh token** de durée plus longue, permettant de renouveler l'access token via un endpoint dédié, avec possibilité de révocation/rotation et un endpoint de logout invalidant le refresh token (persistance nécessaire côté serveur).

### ~~Configuration CSRF~~ (corrigé)
Résolu : la protection CSRF est réactivée via `CookieCsrfTokenRepository`, voir "CSRF" ci-dessus.

### ~~Configuration CORS par domaine~~ (corrigé)
Résolu : configuration CORS explicite par domaine (`app.domains.allows`), voir "CORS" ci-dessus.

### Gestion des rôles
Ajouter une notion de rôle sur l'utilisateur (ex. enum `USER` / `ADMIN` sur l'entité `User`), la propager dans les claims du JWT (ou via les `GrantedAuthority` de Spring Security), puis sécuriser les endpoints sensibles avec `hasRole(...)` ou `@PreAuthorize` selon le rôle requis.

### Rate limiting partagé entre instances
Le rate limiting actuel est en mémoire locale à chaque instance (Caffeine, pas de Redis). Si l'application est un jour déployée avec plusieurs instances derrière un load balancer, chaque instance applique sa propre limite indépendamment : un attaquant réparti sur plusieurs instances peut dépasser la limite globale visée. À prévoir : un backend partagé (ex. Redis via `bucket4j-redis`) si un déploiement multi-instances est envisagé. Si un reverse proxy est ajouté devant l'application, `server.forward-headers-strategy` devra aussi être configuré pour que l'IP utilisée par le rate limiting soit la vraie IP client (`X-Forwarded-For`) et non celle du proxy.

### ~~Timing attack sur le login~~ (corrigé)
Résolu en déléguant l'authentification à `AuthenticationManager`/`DaoAuthenticationProvider` (voir "Login" ci-dessus) : le mot de passe est désormais toujours comparé via BCrypt, contre un hash factice quand l'utilisateur n'existe pas, ce qui rend le temps de traitement indépendant de l'existence du compte.
