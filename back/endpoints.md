## PATH
api/v1/

## AUTH
POST /auth/register
POST /auth/login

## PROFIL USER
# charge le profil de l'utilisateur connecté avec la liste des topics abonnées.
GET /profil
PUT /profil

## TOPICS
# Liste des thèmes (attention il faudra regarder si l'utilisateur est abonné ou non).
GET /topics
# Abonnement d'un utilisateur
POST /topics/:id/subscription
# Désabonnement d'un utilisateur
DELETE /topics/:id/subscription

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
