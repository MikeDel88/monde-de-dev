## PATH
api/v1/

## AUTH
POST /auth/register
POST /auth/login

## PROFIL USER
# charge le profil de l'utilisateur connecté avec la liste des topics abonnées.
GET /profile
PUT /profile
# Changement du mot de passe (nécessite le mot de passe actuel).
PATCH /profile/password

## TOPICS
# Liste des thèmes (attention il faudra regarder si l'utilisateur est abonné ou non).
GET /topics
# Abonnement d'un utilisateur
POST /topics/subscribe
# Désabonnement d'un utilisateur
DELETE /topics/:id/subscribe

## FEED
# Liste du fil d'actualité (user contient la liste des topic abonné et topic contient la liste des posts)
GET /feeds?sort=ASC
GET /feeds?sort=DESC

## POSTS
# Detail d'un article avec ses commentaires.
GET /posts/:id
# Création d'un articles.
POST /posts

## COMMENTS
POST /posts/:id/comments

## CODES D'ERREUR

# Codes globaux (s'appliquent à presque tous les endpoints)
# 400 Bad Request         : validation échouée (@Valid/@Validated), JSON illisible, type mismatch sur un id de path/query
# 401 Unauthorized        : JWT manquant/invalide/expiré (tous les endpoints sauf /auth/register et /auth/login)
# 403 Forbidden           : câblé mais actuellement inatteignable (pas de règles de rôle définies)
# 409 Conflict            : contrainte unique violée en base (email/username déjà pris)
# 500 Internal Server Error : fallback générique
# Toutes les réponses d'erreur (400/401/403/404/409/500) suivent désormais le format ProblemDetail (RFC 7807).

| Endpoint | Codes | Déclencheur spécifique |
|---|---|---|
| POST /auth/register | 201, 400, 409, 500 | 409 = email/username déjà utilisé |
| POST /auth/login | 200, 400, 401, 500 | 401 = user inconnu **ou** mauvais mot de passe (message générique, ne révèle pas lequel) |
| GET /profile | 200, 401, 404, 500 | |
| PATCH /profile | 200, 400, 401, 404, 409, 500 | 409 = email déjà pris par un autre compte |
| PATCH /profile/password | 200, 400, 401, 404, 500 | 400 = mot de passe actuel invalide |
| GET /topics | 200, 401, 500 | pas de 404 |
| POST /topics/subscribe | 200, 400, 401, 404, 500 | 404 = topic ou user introuvable |
| DELETE /topics/:id/subscribe | 200, 400, 401, 404, 500 | |
| GET /feeds (implémenté en GET /feed) | 200, 400, 401, 404, 500 | 400 = sort invalide |
| GET /posts/:id | 200, 400, 401, 404, 500 | 404 = post introuvable **ou** non abonné au topic (PostNotFoundException dédiée) |
| POST /posts | 201, 400, 401, 404, 500 | 404 = user introuvable ou topic introuvable/non abonné (TopicNotFoundException) |
| POST /posts/:id/comments | 201, 400, 401, 404, 500 | 404 = post introuvable ou non abonné au topic (PostNotFoundException dédiée) |

## CODES D'ERREUR MÉTIER (400)

# Ces codes apparaissent dans errors[].message du corps BodyProblemDetail lors d'une réponse 400.
# Les codes @ValidPassword (5 dernières lignes du tableau) peuvent se cumuler sur un même champ password/newPassword.

| Endpoint | DTO / paramètre | Champ | Codes possibles |
|---|---|---|---|
| POST /auth/register | RegisterRequest | name | NAME_REQUIRED |
| POST /auth/register | RegisterRequest | email | EMAIL_INVALID |
| POST /auth/register | RegisterRequest | password | PASSWORD_REQUIRED |
| POST /auth/login | LoginRequest | emailOrName | EMAIL_OR_NAME_REQUIRED |
| POST /auth/login | LoginRequest | password | PASSWORD_REQUIRED |
| PATCH /profile | UpdateProfilRequest | name | NAME_INVALID |
| PATCH /profile | UpdateProfilRequest | email | EMAIL_INVALID |
| PATCH /profile/password | UpdateProfilPasswordRequest | newPassword | PASSWORD_REQUIRED |
| PATCH /profile/password | UpdateProfilPasswordRequest | currentPassword | CURRENT_PASSWORD_REQUIRED (validation) ; CURRENT_PASSWORD_INVALID (métier, 400 via InvalidCurrentPasswordException) |
| POST /topics/subscribe | SubscribeRequest | topicId | TOPIC_REQUIRED, TOPIC_POSITIVE |
| DELETE /topics/:id/subscribe | @PathVariable topicId | topicId | TOPIC_POSITIVE |
| GET /feed | @RequestParam sort | sort | SORT_REQUIRED, SORT_INVALID |
| POST /posts | PostRequest | topicId | TOPIC_REQUIRED, TOPIC_POSITIVE |
| POST /posts | PostRequest | title | TITLE_REQUIRED |
| POST /posts | PostRequest | content | CONTENT_REQUIRED |
| POST /posts/:id/comments | CommentRequest | content | CONTENT_REQUIRED |
| POST /auth/register, PATCH /profile/password | password / newPassword (@ValidPassword) | password | PASSWORD_TOO_SHORT |
| POST /auth/register, PATCH /profile/password | password / newPassword (@ValidPassword) | password | PASSWORD_MISSING_UPPERCASE |
| POST /auth/register, PATCH /profile/password | password / newPassword (@ValidPassword) | password | PASSWORD_MISSING_LOWERCASE |
| POST /auth/register, PATCH /profile/password | password / newPassword (@ValidPassword) | password | PASSWORD_MISSING_DIGIT |
| POST /auth/register, PATCH /profile/password | password / newPassword (@ValidPassword) | password | PASSWORD_MISSING_SPECIAL_CHAR |
