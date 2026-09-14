# Sécurité

## Fonctionnement actuel (MVP)

L'authentification repose sur un serveur de ressources OAuth2 (`spring-boot-starter-oauth2-resource-server`) validant des JWT signés en RS256.

- **Clés RSA** (`KeyConfig`) : une paire de clés 2048 bits fixe est chargée au démarrage depuis les variables d'environnement `RSA_PRIVATE_KEY`/`RSA_PUBLIC_KEY` (via `.env.properties` en local, secret manager en production). Elle est stable entre redémarrages et partageable entre plusieurs instances, les tokens émis restent donc valides après un restart.
- **Génération du token** (`JwtServiceImpl`) : un seul type de token, l'access token, est généré. Il contient uniquement le `subject` (id de l'utilisateur), une date d'émission et une expiration fixée à **30 jours**. Aucun claim de rôle ou de scope n'est inclus.
- **Transport du token** : le client envoie le token via le header `Authorization: Bearer <token>`. Aucun cookie n'est utilisé.
- **Session** : l'API est stateless (`SessionCreationPolicy.STATELESS`), aucune session serveur n'est conservée.
- **CSRF** : désactivé (`csrf(AbstractHttpConfigurer::disable)`). Cohérent avec une API purement stateless sans cookie, mais devra être revu si les tokens passent un jour par un cookie.
- **CORS** : configuration par défaut de Spring (`Customizer.withDefaults()`), aucune restriction de domaine explicite.
- **Autorisations** : pas de notion de rôle. Toute requête authentifiée est acceptée (`anyRequest().authenticated()`), il n'existe pas de distinction admin/utilisateur au niveau de l'entité `User` ni des endpoints.
- **Routes publiques** : documentation Swagger/OpenAPI (`/v3/api-docs`, `/swagger-ui.html`, non versionnée), ainsi que `/api/v1/auth/register` et `/api/v1/auth/login`.
- **Gestion des erreurs** : `JwtAuthenticationEntryPoint` renvoie un 401 JSON en cas d'authentification manquante/invalide, `JwtAccessDeniedHandler` renvoie un 403 JSON en cas d'accès refusé.
- **Changement de mot de passe** (`PATCH /profile/password`) : en plus d'un JWT valide, le `currentPassword` est désormais requis (`UpdateProfilPasswordRequest.currentPassword`, `@NotBlank`) et vérifié via `passwordEncoder.matches(...)` (`ProfilServiceImpl.updatePassword`) avant d'appliquer le nouveau mot de passe. Cela protège contre un JWT volé par un canal autre que le réseau (XSS, token exfiltré, poste partagé) : l'attaquant ne peut plus changer le mot de passe sans connaître l'ancien. Si `currentPassword` ne correspond pas, une exception dédiée `InvalidCurrentPasswordException` est levée et traduite par `GlobalExceptionHandler` en **400** avec le code `CURRENT_PASSWORD_INVALID` sur le champ `currentPassword`, distinct du 404 "utilisateur introuvable".
- **Login** (`POST /auth/login`) : l'authentification ne compare plus le mot de passe "à la main" après une recherche en base, mais délègue à un `AuthenticationManager` Spring Security (`SecurityConfig.authenticationManager`), adossé à un `DaoAuthenticationProvider` et à un `UserDetailsService` (`SecurityConfig.userDetailsService`, qui charge l'utilisateur par email ou nom et l'adapte au contrat `UserDetails` via `AuthenticatedUser`). `DaoAuthenticationProvider` exécute systématiquement une comparaison BCrypt — contre le hash réel si l'utilisateur existe, contre un hash factice sinon — ce qui rend le temps de traitement indépendant de l'existence du compte (voir ci-dessous). En cas d'échec, l'`AuthenticationException` levée par Spring Security n'est pas interceptée dans `AuthServiceImpl` : elle remonte jusqu'à `GlobalExceptionHandler.handleAuthenticationException`, qui la traduit en **401** générique (même réponse qu'un compte inexistant).

Ce fonctionnement est volontairement simple et suffisant pour un MVP, mais présente des limites : absence de révocation ou de renouvellement du token, durée de vie de l'access token beaucoup trop longue pour un usage sécurisé, absence de granularité des droits.

## À prévoir avant une mise en production

### Cookies + access token / refresh token
Remplacer le token porté par le client (ex. localStorage) par un cookie `httpOnly`, `Secure` et `SameSite` approprié, afin de le protéger des accès via JavaScript (XSS). Mettre en place deux tokens :
- un **access token** de courte durée (ex. 15 minutes),
- un **refresh token** de durée plus longue, permettant de renouveler l'access token via un endpoint dédié, avec possibilité de révocation/rotation et un endpoint de logout invalidant le refresh token.

### Configuration CSRF
Dès lors qu'un cookie transporte le token d'authentification, la protection CSRF doit être réactivée (par exemple via `CookieCsrfTokenRepository`), car le mode "header Bearer" actuel n'y est pas exposé mais un cookie l'est.

### Configuration CORS par domaine
Remplacer la configuration CORS par défaut par une configuration explicite (`CorsConfigurationSource`) listant précisément les domaines autorisés (front de production, environnements de preview/staging si besoin), les méthodes HTTP et headers autorisés, ainsi que `allowCredentials(true)` pour permettre l'envoi des cookies.

### Gestion des rôles
Ajouter une notion de rôle sur l'utilisateur (ex. enum `USER` / `ADMIN` sur l'entité `User`), la propager dans les claims du JWT (ou via les `GrantedAuthority` de Spring Security), puis sécuriser les endpoints sensibles avec `hasRole(...)` ou `@PreAuthorize` selon le rôle requis.

### ~~Timing attack sur le login~~ (corrigé)
Résolu en déléguant l'authentification à `AuthenticationManager`/`DaoAuthenticationProvider` (voir "Login" ci-dessus) : le mot de passe est désormais toujours comparé via BCrypt, contre un hash factice quand l'utilisateur n'existe pas, ce qui rend le temps de traitement indépendant de l'existence du compte.
