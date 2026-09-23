# Sécurité

## Authentification

L'authentification repose sur un serveur de ressources OAuth2 (`spring-boot-starter-oauth2-resource-server`) validant des JWT signés en RS256.

- **Clés RSA** (`KeyConfig`) : une paire de clés 2048 bits fixe est chargée au démarrage depuis les variables d'environnement `RSA_PRIVATE_KEY`/`RSA_PUBLIC_KEY` (via `.env.properties` en local, secret manager en production). Elle est stable entre redémarrages et partageable entre plusieurs instances, les tokens émis restent donc valides après un restart.
- **Génération du token** (`JwtServiceImpl`) : un seul type de token, l'access token, est généré. Il contient le `subject` (id de l'utilisateur), une date d'émission, une expiration configurable en jours (`app.token.expiration`/`TOKEN_EXPIRATION`, `AppConfigProperties.tokenExpiration`) et un claim `role` (`JwtClaimsConstants.ROLE_CLAIM`, valeur de `User.getRole()`).
- **Transport du token** : le client ne manipule jamais le token en JavaScript. `POST /auth/login` le pose dans un cookie `access_token` (`HttpOnly`, `SameSite=Lax`, `Secure` en production via `app.cookie.secure`), lu côté serveur par `CookieBearerTokenResolver` (au lieu du header `Authorization`). `POST /auth/logout` invalide ce cookie (`Max-Age=0`).
- **Session** : l'API est stateless (`SessionCreationPolicy.STATELESS`), aucune session serveur n'est conservée.

## Rôle applicatif

`User` porte un `Role` (enum, une seule valeur `USER` pour le moment), propagé :
- en `GrantedAuthority` (`ROLE_USER`, via `AuthenticatedUser.getAuthorities`) ;
- en claim `role` du JWT (voir "Génération du token" ci-dessus).

Ce rôle n'est pas encore exploité au niveau des endpoints : `SecurityConfig` accepte toute requête authentifiée sans distinction (`anyRequest().authenticated()`). C'est un socle posé pour une future distinction de droits (ex. modération), la restriction par rôle sur des endpoints spécifiques reste à ajouter.

## CSRF et CORS

- **CSRF** : protection activée (`CookieCsrfTokenRepository.withHttpOnlyFalse()` + `CsrfCookieFilter`), nécessaire dès lors que le JWT est porté par un cookie (contrairement au header `Authorization`, un cookie est envoyé automatiquement par le navigateur sur les requêtes cross-site). Le front envoie le token CSRF via le header `X-XSRF-TOKEN`, lu depuis le cookie `XSRF-TOKEN`.
- **CORS** : configuration explicite par domaine (`app.domains.allows`), `allowCredentials(true)` pour permettre l'envoi des cookies, headers autorisés incluant `X-XSRF-TOKEN`.

## Routes publiques

Accessibles sans JWT : `/api/v1/auth/register`, `/api/v1/auth/login`, `/api/v1/auth/logout`, ainsi que la documentation Swagger/OpenAPI (`/v3/api-docs/**`, `/swagger-ui.html`, `/swagger-ui/**`, sous le même préfixe `/api/v1` que le reste de l'API puisque `server.servlet.context-path` s'applique globalement — désactivée par défaut, activée uniquement en profil `dev`).

## Gestion des erreurs

`JwtAuthenticationEntryPoint` renvoie un 401 JSON en cas d'authentification manquante/invalide, `JwtAccessDeniedHandler` renvoie un 403 JSON en cas d'accès refusé.

## Login et changement de mot de passe

- **Login** (`POST /auth/login`) : l'authentification délègue à un `AuthenticationManager` Spring Security (`SecurityConfig.authenticationManager`), adossé à un `DaoAuthenticationProvider` et à un `UserDetailsService` (`SecurityConfig.userDetailsService`, qui charge l'utilisateur par email ou nom et l'adapte au contrat `UserDetails` via `AuthenticatedUser`). `DaoAuthenticationProvider` exécute systématiquement une comparaison BCrypt — contre le hash réel si l'utilisateur existe, contre un hash factice sinon — ce qui rend le temps de traitement indépendant de l'existence du compte, et protège contre une attaque par mesure de temps. En cas d'échec, l'`AuthenticationException` levée par Spring Security remonte jusqu'à `GlobalExceptionHandler.handleAuthenticationException`, qui la traduit en **401** générique (même réponse qu'un compte inexistant, pour ne pas révéler lequel des deux a échoué).
- **Changement de mot de passe** (`PATCH /profile/password`) : en plus d'un JWT valide, le `currentPassword` est requis (`UpdateProfilPasswordRequest.currentPassword`, `@NotBlank`) et vérifié via `passwordEncoder.matches(...)` (`ProfilServiceImpl.updatePassword`) avant d'appliquer le nouveau mot de passe. Cela protège contre un JWT volé par un canal autre que le réseau (XSS, token exfiltré, poste partagé) : l'attaquant ne peut pas changer le mot de passe sans connaître l'ancien. Si `currentPassword` ne correspond pas, `InvalidCurrentPasswordException` est levée et traduite par `GlobalExceptionHandler` en **400** avec le code `CURRENT_PASSWORD_INVALID` sur le champ `currentPassword`, distinct du 404 "utilisateur introuvable".

## Rate limiting

`RateLimiterService` protège `/auth/login` et `/auth/register` avec deux compteurs cumulés de type token-bucket (bucket4j), stockés en mémoire dans des caches Caffeine à expiration (`expireAfterAccess`, pas de partage entre plusieurs instances de l'application) :
- une limite par **adresse IP** source (`request.getRemoteAddr()`, pas de gestion de `X-Forwarded-For` pour l'instant, l'application n'étant pas déployée derrière un reverse proxy) ;
- une limite par **compte visé**, normalisé (`trim().toLowerCase()`) : `emailOrName` pour le login, `email` pour l'inscription.

Valeurs par défaut (configurables via `app.rate-limit.*`, cf. `RateLimitConfigProperties`) :

| Endpoint | Limite IP | Limite compte |
|---|---|---|
| POST /auth/login | 10 req / min | 5 req / min |
| POST /auth/register | 5 req / min | 3 req / 10 min |

Le dépassement de l'une ou l'autre limite lève `RateLimitExceededException`, traduite par `GlobalExceptionHandler` en **429** générique (ne précise pas laquelle des deux limites a été atteinte).

## Limites connues et pistes de production

Ce fonctionnement est volontairement simple et suffisant pour un MVP. Points à traiter avant une mise en production plus exigeante :

- **Access token / refresh token** : il n'existe qu'un seul type de token (l'access token actuel, durée de vie configurable en jours via `TOKEN_EXPIRATION`), sans révocation possible avant expiration. Une évolution possible : un **access token** de courte durée (ex. 15 minutes) couplé à un **refresh token** de durée plus longue, permettant de le renouveler via un endpoint dédié, avec possibilité de révocation/rotation et un endpoint de logout invalidant le refresh token (persistance nécessaire côté serveur).
- **Gestion des rôles** : le `Role` existe et est propagé (entité, JWT, `GrantedAuthority` — voir "Rôle applicatif" ci-dessus), mais aucun endpoint n'est encore restreint par rôle. Ajouter une valeur `ADMIN` (ou équivalent) et sécuriser les endpoints sensibles avec `hasRole(...)` ou `@PreAuthorize`.
- **Rate limiting partagé entre instances** : le rate limiting est en mémoire locale à chaque instance (Caffeine, pas de Redis). Avec plusieurs instances derrière un load balancer, chaque instance applique sa propre limite indépendamment : un attaquant réparti sur plusieurs instances peut dépasser la limite globale visée. Prévoir un backend partagé (ex. Redis via `bucket4j-redis`) en cas de déploiement multi-instances, et configurer `server.forward-headers-strategy` si un reverse proxy est ajouté, pour que le rate limiting utilise la vraie IP client (`X-Forwarded-For`) plutôt que celle du proxy.
