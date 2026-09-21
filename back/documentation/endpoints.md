# Endpoints

Liste des routes de l'API, toutes relatives au préfixe suivant.

## PATH
api/v1/

## AUTH

Le JWT n'est jamais renvoyé en JSON : il voyage dans un cookie `access_token` (HttpOnly, SameSite=Lax, durée configurable), posé via l'en-tête `Set-Cookie`.

### POST /auth/register
Requête (`RegisterRequest`) :
```json
{
  "name": "Camille Dubois",
  "email": "camille.dubois@example.com",
  "password": "Passw0rd!"
}
```
Réponse : `201 Created`, corps vide. En-tête `Set-Cookie: access_token=…; HttpOnly; SameSite=Lax`.

### POST /auth/login
Requête (`LoginRequest`) :
```json
{
  "emailOrName": "camille.dubois@example.com",
  "password": "Passw0rd!"
}
```
Réponse : `200 OK`, corps vide. En-tête `Set-Cookie: access_token=…; HttpOnly; SameSite=Lax`.

### POST /auth/logout
Requête : aucun corps.
Réponse : `200 OK`, corps vide. `Set-Cookie` renvoie `access_token` expiré (`Max-Age=0`), invalidant le cookie côté client.

## PROFIL USER
# charge le profil de l'utilisateur connecté avec la liste des topics abonnées.
GET /profile
# Changement du mot de passe ou de l'email ou du nom (nécessite le mot de passe actuel).
PATCH /profile

Les deux routes renvoient la même forme `ProfileResponse`, incluant la liste des topics avec le drapeau d'abonnement de l'utilisateur courant.

### GET /profile
Requête : aucun corps (authentification requise).
Réponse (`ProfileResponse`) :
```json
{
  "name": "Camille Dubois",
  "email": "camille.dubois@example.com",
  "topics": [
    { "id": 3, "title": "Spring Boot", "description": "Actualités et bonnes pratiques Spring Boot", "subscribed": true },
    { "id": 5, "title": "Angular", "description": "Composants, signaux et écosystème Angular", "subscribed": true }
  ]
}
```

### PATCH /profile
Requête (`UpdateProfileRequest`) — `name`/`email`/`newPassword` optionnels (absent ou `null` = inchangé), `currentPassword` toujours requis :
```json
{
  "name": "Camille D.",
  "email": null,
  "newPassword": null,
  "currentPassword": "Passw0rd!"
}
```
Réponse (`ProfileResponse`) :
```json
{
  "name": "Camille D.",
  "email": "camille.dubois@example.com",
  "topics": [
    { "id": 3, "title": "Spring Boot", "description": "Actualités et bonnes pratiques Spring Boot", "subscribed": true }
  ]
}
```
409 si l'email est déjà pris par un autre compte ; 400 (`CURRENT_PASSWORD_INVALID`) si `currentPassword` est erroné.


## TOPICS
# Liste des thèmes (attention il faudra regarder si l'utilisateur est abonné ou non).
GET /topics
# Abonnement d'un utilisateur
POST /topics/subscribe
# Désabonnement d'un utilisateur
DELETE /topics/:id/subscribe

### GET /topics
Réponse (`TopicResponse[]`) :
```json
[
  { "id": 1, "title": "Java", "description": "Langage, JVM, écosystème", "subscribed": false },
  { "id": 3, "title": "Spring Boot", "description": "Actualités et bonnes pratiques Spring Boot", "subscribed": true }
]
```

### POST /topics/subscribe
Requête (`SubscribeRequest`) :
```json
{ "topicId": 3 }
```
Réponse : `200 OK`, corps vide.

### DELETE /topics/:id/subscribe
Requête : aucun corps. `:id` (topicId) doit être un entier positif.
Réponse : `200 OK`, corps vide.

## FEED
# Liste du fil d'actualité (posts des topics auxquels l'utilisateur est abonné), triée par id (ordre de création).
# Pagination par curseur : cursor (id du dernier post reçu, absent pour la 1ère page), direction=asc|desc (défaut : desc).
GET /posts?cursor=123&direction=desc

Réponse (`CursorPageResponse<PostFeedResponse>`) :
```json
{
  "content": [
    { "id": 42, "title": "Découverte de Spring Boot", "date": "2026-09-18T09:32:00", "author": "Camille Dubois", "preview": "Dans cet article nous allons voir comment structurer un projet…" },
    { "id": 41, "title": "Les signaux Angular en pratique", "date": "2026-09-17T14:05:00", "author": "Farid Bennani", "preview": "Retour d'expérience sur la migration vers les signaux…" }
  ],
  "hasNext": true,
  "nextCursor": 37
}
```
Renommages JSON côté DTO : `postDate`→`date`, `name`→`author`, `content`→`preview`.

## POSTS
# Détail d'un article avec ses commentaires.
GET /posts/:id
# Création d'un article.
POST /posts

### GET /posts/:id
Réponse (`PostResponse`) :
```json
{
  "id": 42,
  "title": "Découverte de Spring Boot",
  "date": "2026-09-18T09:32:00",
  "author": "Camille Dubois",
  "topicName": "Spring Boot",
  "content": "Dans cet article nous allons voir comment structurer un projet Spring Boot pas à pas…",
  "comments": [
    { "author": "Farid Bennani", "content": "Merci pour cet article, très clair !" }
  ]
}
```
403 si le post est introuvable **ou** si l'utilisateur n'est pas abonné au topic (symptômes volontairement identiques).

### POST /posts
Requête (`PostRequest`) :
```json
{
  "topicId": 3,
  "title": "Découverte de Spring Boot",
  "content": "Dans cet article nous allons voir…"
}
```
Réponse : `201 Created`, corps vide. 403 si non abonné au topic ; 404 si l'utilisateur est introuvable.

## COMMENTS
POST /posts/:id/comments

Requête (`CommentRequest`) :
```json
{ "content": "Merci pour cet article, très clair !" }
```
Réponse : `201 Created`, corps vide. 403 si post introuvable ou non abonné ; 404 si l'utilisateur est introuvable.

## CODES D'ERREUR

# Codes globaux (s'appliquent à presque tous les endpoints)
# 400 Bad Request         : validation échouée (@Valid/@Validated), JSON illisible, type mismatch sur un id de path/query
# 401 Unauthorized        : JWT manquant/invalide/expiré (tous les endpoints sauf /auth/register et /auth/login)
# 403 Forbidden           : utilisateur non abonné au topic d'un post (TopicNotSubscribedException, sur GET/POST /posts et POST /posts/:id/comments)
# 409 Conflict            : contrainte unique violée en base (email/username déjà pris)
# 429 Too Many Requests   : trop de tentatives (limite par IP ou par compte visé), uniquement sur POST /auth/register et POST /auth/login
# 500 Internal Server Error : fallback générique
# Toutes les réponses d'erreur (400/401/403/404/409/429/500) suivent le format ProblemDetail (RFC 7807).

Exemple `ProblemDetail` (401/403/404/409/429/500, sans détail de champ) :
```json
{
  "type": "about:blank",
  "title": "Unauthorized",
  "status": 401,
  "detail": "INVALID_CREDENTIALS",
  "instance": "/api/v1/auth/login"
}
```

Exemple `BodyProblemDetail` (400, échec de validation `@Valid`, avec `errors[]`) :
```json
{
  "type": "about:blank",
  "title": "Bad Request",
  "status": 400,
  "detail": "Validation failed",
  "instance": "/api/v1/auth/register",
  "errors": [
    { "field": "password", "code": "PASSWORD_TOO_SHORT" },
    { "field": "password", "code": "PASSWORD_MISSING_DIGIT" }
  ]
}
```

| Endpoint | Codes | Déclencheur spécifique |
|---|---|---|
| POST /auth/register | 201, 400, 409, 429, 500 | 409 = email/username déjà utilisé ; 429 = limite de tentatives IP ou email dépassée |
| POST /auth/login | 200, 400, 401, 429, 500 | 401 = user inconnu **ou** mauvais mot de passe (message générique, ne révèle pas lequel) ; 429 = limite de tentatives IP ou compte dépassée |
| POST /auth/logout | 200, 500 | endpoint public, pas de rate limit, invalide le cookie `access_token` |
| GET /profile | 200, 401, 404, 500 | |
| PATCH /profile | 200, 400, 401, 404, 409, 500 | 409 = email déjà pris par un autre compte |
| PATCH /profile/password | 200, 400, 401, 404, 500 | 400 = mot de passe actuel invalide |
| GET /topics | 200, 401, 500 | pas de 404 |
| POST /topics/subscribe | 200, 400, 401, 404, 500 | 404 = topic ou user introuvable |
| DELETE /topics/:id/subscribe | 200, 400, 401, 404, 500 | |
| GET /posts | 200, 400, 401, 500 | pagination par curseur (cursor, direction) ; 400 = direction invalide (DIRECTION_INVALID) |
| GET /posts/:id | 200, 400, 401, 403, 500 | 403 = post introuvable **ou** non abonné au topic (TopicNotSubscribedException, mêmes symptômes volontairement) |
| POST /posts | 201, 400, 401, 403, 404, 500 | 404 = user introuvable ; 403 = topic non abonné (TopicNotSubscribedException) |
| POST /posts/:id/comments | 201, 400, 401, 403, 404, 500 | 404 = user introuvable ; 403 = post introuvable ou non abonné au topic (TopicNotSubscribedException) |

## CODES D'ERREUR MÉTIER (400)

# Ces codes apparaissent dans errors[].message du corps BodyProblemDetail lors d'une réponse 400.
# Les codes @ValidPassword (5 dernières lignes du tableau) peuvent se cumuler sur un même champ password/newPassword.

| Endpoint | DTO / paramètre | Champ | Codes possibles |
|---|---|---|---|
| POST /auth/register | RegisterRequest | name | NAME_REQUIRED, NAME_TOO_LONG (max 255, cf. users.name) |
| POST /auth/register | RegisterRequest | email | EMAIL_INVALID, EMAIL_TOO_LONG (max 255, cf. users.email) |
| POST /auth/register | RegisterRequest | password | PASSWORD_REQUIRED |
| POST /auth/login | LoginRequest | emailOrName | EMAIL_OR_NAME_REQUIRED |
| POST /auth/login | LoginRequest | password | PASSWORD_REQUIRED |
| PATCH /profile | UpdateProfilRequest | name | NAME_INVALID (vide ou > 255, cf. users.name) |
| PATCH /profile | UpdateProfilRequest | email | EMAIL_INVALID, EMAIL_TOO_LONG (max 255, cf. users.email) |
| PATCH /profile | UpdateProfilRequest | newPassword | PASSWORD_REQUIRED |
| PATCH /profile | UpdateProfilRequest | currentPassword | CURRENT_PASSWORD_REQUIRED (validation) ; CURRENT_PASSWORD_INVALID (métier, 400 via InvalidCurrentPasswordException) |
| GET /posts | @RequestParam direction | direction | DIRECTION_INVALID |
| POST /topics/subscribe | SubscribeRequest | topicId | TOPIC_REQUIRED, TOPIC_POSITIVE |
| DELETE /topics/:id/subscribe | @PathVariable topicId | topicId | TOPIC_POSITIVE |
| POST /posts | PostRequest | topicId | TOPIC_REQUIRED, TOPIC_POSITIVE |
| POST /posts | PostRequest | title | TITLE_REQUIRED, TITLE_TOO_LONG (max 255, cf. posts.title) |
| POST /posts | PostRequest | content | CONTENT_REQUIRED, CONTENT_TOO_LONG (max 65535, cf. posts.content TEXT) |
| POST /posts/:id/comments | CommentRequest | content | CONTENT_REQUIRED, CONTENT_TOO_LONG (max 65535, cf. comments.content TEXT) |
| POST /auth/register, PATCH /profile/password | password / newPassword (@ValidPassword) | password | PASSWORD_TOO_SHORT |
| POST /auth/register, PATCH /profile/password | password / newPassword (@ValidPassword) | password | PASSWORD_MISSING_UPPERCASE |
| POST /auth/register, PATCH /profile/password | password / newPassword (@ValidPassword) | password | PASSWORD_MISSING_LOWERCASE |
| POST /auth/register, PATCH /profile/password | password / newPassword (@ValidPassword) | password | PASSWORD_MISSING_DIGIT |
| POST /auth/register, PATCH /profile/password | password / newPassword (@ValidPassword) | password | PASSWORD_MISSING_SPECIAL_CHAR |
