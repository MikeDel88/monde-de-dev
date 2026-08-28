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
- **Changement de mot de passe** (`PATCH /profile/password`) : le seul prérequis est un JWT valide, le mot de passe actuel n'est **pas** redemandé. La possession du token est considérée comme une preuve d'identité suffisante. Cela signifie qu'un JWT volé (XSS, token exfiltré, etc.) suffit à changer le mot de passe d'un compte, sans connaître l'ancien mot de passe, ce qui empêcherait la victime de reprendre la main sur son compte (le JWT actuel de 30 jours n'étant pas révocable).

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

### Timing attack sur le login
Le login retourne bien la même erreur (`UserNotFoundException` / 404) que l'utilisateur existe ou non, mais le **temps de traitement diffère** : si l'utilisateur n'existe pas, la requête échoue immédiatement après la recherche en base (rapide) ; si l'utilisateur existe mais le mot de passe est incorrect, `passwordEncoder.matches(...)` (BCrypt, volontairement coûteux en CPU) est exécuté avant l'échec (nettement plus lent). Un attaquant peut mesurer ce delta pour déterminer si un email ou un nom d'utilisateur existe en base, malgré une réponse HTTP identique dans les deux cas.

En production, la meilleure solution serait d'exécuter `passwordEncoder.matches(...)` dans tous les cas — y compris quand l'utilisateur n'existe pas, en le comparant à un hash factice précalculé (ex. un hash BCrypt constant) — afin que le coût CPU, et donc le temps de réponse, soit identique que l'utilisateur existe ou non. Ne jamais court-circuiter la comparaison de mot de passe sur la seule absence d'utilisateur.

### Confirmation du mot de passe actuel pour `PATCH /profile/password`
Actuellement, `PATCH /profile/password` accepte un nouveau mot de passe sur la seule base d'un JWT valide, sans redemander le mot de passe actuel. Avec un access token de 30 jours non révocable, un JWT compromis (poste partagé, XSS, token intercepté) permet donc à un attaquant de changer le mot de passe du compte sans jamais avoir connu l'ancien, verrouillant potentiellement la victime hors de son propre compte.

Avant mise en production, ajouter un champ `currentPassword` au DTO `UpdateProfilPasswordRequest` et vérifier `passwordEncoder.matches(currentPassword, user.getPassword())` dans `ProfilServiceImpl.updatePassword` avant d'appliquer le changement, en renvoyant une erreur explicite (ex. 400/401 avec un code du type `CURRENT_PASSWORD_INVALID`) si la vérification échoue. C'est le pattern standard (GitHub, Google, etc.) pour toute action sensible sur un compte, et il reste pertinent même une fois les access tokens de courte durée + refresh tokens révocables mis en place (cf. section cookies/refresh token ci-dessus), car il protège aussi contre le vol d'un access token encore valide sur sa courte fenêtre de vie.
