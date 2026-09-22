# FAQ utilisateur

Ce document répond aux questions les plus fréquentes sur l'utilisation de l'application : que se passe-t-il quand une action réussit, et que signifient les messages affichés quand elle échoue.

Pour chaque action, deux cas sont détaillés :
- **✅ En cas de succès** : ce qui s'affiche et ce qui se passe.
- **❌ En cas d'échec** : la liste des messages d'erreur possibles, leur signification, et comment les résoudre.

## Sommaire

1. [Inscription](#1-inscription)
2. [Connexion](#2-connexion)
3. [Déconnexion et session expirée](#3-déconnexion-et-session-expirée)
4. [Modifier son profil](#4-modifier-son-profil)
5. [S'abonner à un thème](#5-sabonner-à-un-thème)
6. [Se désabonner d'un thème](#6-se-désabonner-dun-thème)
7. [Créer un article](#7-créer-un-article)
8. [Consulter un article et commenter](#8-consulter-un-article-et-commenter)
9. [Erreurs générales](#9-erreurs-générales)

---

## 1. Inscription

Créer un nouveau compte utilisateur (nom, email, mot de passe) depuis la page `/register`.

### ✅ En cas de succès

Un message `"Utilisateur enregistré"` s'affiche, puis vous êtes redirigé vers la page de connexion.

### ❌ En cas d'échec

| Message affiché | Signification | Que faire |
|---|---|---|
| `Le nom est requis.` | Le champ nom est vide. | Renseignez un nom. |
| `L'email est requis.` | Le champ email est vide. | Renseignez un email. |
| `Email invalide` / `L'email est invalide.` | L'adresse email n'a pas un format valide. | Corrigez le format de l'adresse (ex : `nom@domaine.com`). |
| `Le mot de passe est requis.` | Le champ mot de passe est vide. | Renseignez un mot de passe. |
| `Doit être supérieur ou égal à 8 caractères` | Le mot de passe fait moins de 8 caractères. | Choisissez un mot de passe d'au moins 8 caractères. |
| `Doit contenir au moins une lettre Majuscule, Minuscule, un chiffre et un caractère spécial` | Le mot de passe ne respecte pas toutes les règles de complexité. | Ajoutez au moins une majuscule, une minuscule, un chiffre et un caractère spécial (ex : `#?!@$%^&*-`). |
| `Un conflit est survenu.` | L'email ou le nom d'utilisateur choisi est déjà utilisé par un autre compte. | Essayez un autre email ou un autre nom d'utilisateur, ou connectez-vous si le compte est déjà le vôtre. |

---

## 2. Connexion

Se connecter à un compte existant depuis la page `/login`, avec un email/nom et un mot de passe.

### ✅ En cas de succès

Vous êtes redirigé automatiquement vers le fil d'actualité (`/feed`). Aucun message n'est affiché : l'arrivée sur le fil confirme la connexion.

### ❌ En cas d'échec

| Message affiché | Signification | Que faire |
|---|---|---|
| `Identifiants invalides.` | L'email/nom ou le mot de passe saisi est incorrect. | Vérifiez votre saisie, ou utilisez le mot de passe correct associé à ce compte. |
| `Session expirée ou identifiants invalides.` | La tentative de connexion a été refusée par le serveur (statut 401). | Vérifiez vos identifiants et réessayez. |
| `L'email ou le nom d'utilisateur est requis.` | Le champ identifiant est vide. | Renseignez votre email ou votre nom d'utilisateur. |
| `Le mot de passe est requis.` | Le champ mot de passe est vide. | Renseignez votre mot de passe. |

---

## 3. Déconnexion et session expirée

Se déconnecter volontairement via le bouton **Déconnexion** du menu, ou être déconnecté automatiquement si la session n'est plus valide.

### ✅ En cas de succès

Vous êtes redirigé vers la page de connexion (`/login`). Il n'est plus possible d'accéder aux pages protégées (fil d'actualité, thèmes, profil, articles) tant que vous ne vous reconnectez pas.

### ❌ En cas d'échec (session expirée)

| Message affiché | Signification | Que faire |
|---|---|---|
| `Session expirée ou identifiants invalides.` | Votre session a expiré (ou est devenue invalide) pendant que vous utilisiez l'application. Vous êtes automatiquement déconnecté et redirigé vers `/login`. | Reconnectez-vous avec votre email/nom et votre mot de passe. |

---

## 4. Modifier son profil

Depuis la page `/profile`, modifier son nom, son email ou son mot de passe. Toute modification doit être confirmée en saisissant le **mot de passe actuel** dans une fenêtre de confirmation.

### ✅ En cas de succès

Le message `"Le profil a bien été mis à jour!"` s'affiche.

### ❌ En cas d'échec

| Message affiché | Signification | Que faire |
|---|---|---|
| `Le mot de passe actuel est incorrect.` | Le mot de passe saisi dans la fenêtre de confirmation ne correspond pas à votre mot de passe actuel. | Ressaisissez votre mot de passe actuel correctement. |
| `Le mot de passe actuel est requis.` | Le champ de confirmation par mot de passe actuel est vide. | Renseignez votre mot de passe actuel pour confirmer la modification. |
| `Le nom est requis.` / `L'email est requis.` | Un champ obligatoire du formulaire de profil est vide. | Complétez le champ manquant. |
| `L'email est invalide.` | Le nouvel email saisi n'a pas un format valide. | Corrigez le format de l'adresse. |
| `Doit être supérieur ou égal à 8 caractères` / `Doit contenir au moins une lettre Majuscule, Minuscule, un chiffre et un caractère spécial` | Le nouveau mot de passe (si vous en changez) ne respecte pas les règles de complexité. | Choisissez un mot de passe d'au moins 8 caractères avec majuscule, minuscule, chiffre et caractère spécial. |
| `Un conflit est survenu.` | Le nouvel email ou nom choisi est déjà utilisé par un autre compte. | Choisissez un autre email ou nom d'utilisateur. |

---

## 5. S'abonner à un thème

Depuis la page `/topics`, s'abonner à un thème pour voir ses articles apparaître dans le fil d'actualité.

### ✅ En cas de succès

Le thème apparaît comme abonné dans la liste, sans message de confirmation supplémentaire.

### ❌ En cas d'échec

| Message affiché | Signification | Que faire |
|---|---|---|
| `Ce thème n'existe pas ou plus.` | Le thème a été supprimé ou n'est plus disponible entre le chargement de la page et votre action. | Rafraîchissez la page des thèmes et réessayez. |

---

## 6. Se désabonner d'un thème

Depuis la page `/profile`, se désabonner d'un thème pour ne plus voir ses articles dans le fil d'actualité.

### ✅ En cas de succès

Le thème disparaît de votre liste d'abonnements, sans message de confirmation supplémentaire.

### ❌ En cas d'échec

| Message affiché | Signification | Que faire |
|---|---|---|
| `Vous n'êtes pas abonné à ce thème.` | Vous n'étiez déjà plus abonné à ce thème (par exemple désabonné entre-temps depuis un autre onglet). | Rafraîchissez votre page de profil : le thème ne devrait plus apparaître dans vos abonnements. |

---

## 7. Créer un article

Depuis la page `/post`, publier un nouvel article avec un titre, un contenu et un thème.

### ✅ En cas de succès

Vous êtes redirigé vers le fil d'actualité (`/feed`), où votre article apparaît.

### ❌ En cas d'échec

| Message affiché | Signification | Que faire |
|---|---|---|
| `Le titre est requis.` | Le champ titre est vide. | Renseignez un titre. |
| `Le titre est trop long.` | Le titre dépasse la longueur maximale autorisée. | Raccourcissez le titre. |
| `Le contenu est requis.` | Le champ contenu est vide. | Renseignez le contenu de l'article. |
| `Le contenu est trop long.` | Le contenu dépasse la longueur maximale autorisée. | Raccourcissez le contenu. |
| `Le thème est requis.` / `Le thème sélectionné est invalide.` | Aucun thème valide n'a été sélectionné pour l'article. | Sélectionnez un thème dans la liste avant de publier. |

---

## 8. Consulter un article et commenter

Depuis la page `/post/:id`, lire un article et y ajouter un commentaire.

### ✅ En cas de succès

Le commentaire est ajouté sous l'article et le champ de saisie est réinitialisé.

### ❌ En cas d'échec

| Message affiché | Signification | Que faire |
|---|---|---|
| `Le contenu est requis.` | Le champ de commentaire est vide. | Saisissez un commentaire avant de valider. |
| `La ressource demandée n'existe pas ou plus.` | L'article consulté a été supprimé ou n'existe pas (ou plus). | Retournez au fil d'actualité pour consulter un article existant. |

---

## 9. Erreurs générales

Ces messages peuvent apparaître sur n'importe quelle action de l'application, quelle que soit la fonctionnalité utilisée.

| Message affiché | Signification | Que faire |
|---|---|---|
| `Vous n'avez pas les droits nécessaires pour effectuer cette action.` | Vous n'êtes pas autorisé à réaliser cette action (par exemple, modifier une ressource qui ne vous appartient pas). | Vérifiez que vous êtes bien connecté avec le bon compte. |
| `La ressource demandée n'existe pas ou plus.` | L'élément visé (article, thème, utilisateur...) a été supprimé ou n'a jamais existé. | Revenez au fil d'actualité et réessayez depuis une ressource existante. |
| `Un conflit est survenu.` | L'action entre en conflit avec l'état actuel des données (ex : email déjà utilisé). | Vérifiez les données saisies et réessayez avec des valeurs différentes. |
| `Trop de tentatives, réessayer plus tard.` | Vous avez effectué trop de requêtes en peu de temps (protection anti-abus). | Patientez quelques instants avant de réessayer. |
| `Une erreur est survenue, veuillez réessayer plus tard.` | Une erreur technique inattendue s'est produite côté serveur. | Réessayez plus tard. Si le problème persiste, contactez le support. |
| Page « Page introuvable » | L'URL saisie ou le lien suivi ne correspond à aucune page de l'application. | Revenez au fil d'actualité via le menu.
