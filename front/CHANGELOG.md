# Changelog

Toutes les modifications notables de ce projet sont documentées dans ce fichier.

## [0.3.0] - 2026-09-07

### Ajouté
- Page Profil : formulaire de mise à jour incluant la liste des topics abonnés
- Création d'un article (post) depuis le feed, avec formulaire dédié
- Page de détail d'un article : affichage du contenu et des commentaires triés du plus ancien au plus récent
- Ajout de commentaires sur un article (formulaire + envoi)
- Documentation ARIA et ajout d'aria-labels sur les composants pour l'accessibilité
- Bibliothèque de composants partagés : button (normal/outlined), input, title, error, divider, loader, logo, bouton retour, topic-card
- Mise en surbrillance / ajustements de style (hover cartes, hauteur uniforme, curseur pointer, boutons login/register)

### Technique
- Renommage des packages internes pour cohérence
- Passage des variables selon les règles ESLint
- Correction du format de date (yyyy) sur les vues post-card/détail
- Renommage `TopicComponent` en `Topic`, suppression de CSS inutilisés
- Ajustement de la cible de build de développement (`mdd-client:build:development`)

## [0.2.0] - 2026-08-28

### Ajouté
- Page Topics : liste des thèmes avec abonnement et désabonnement
- Page Profil : consultation et mise à jour du nom/email, changement du mot de passe avec modal de confirmation (mot de passe actuel requis)
- Bouton de sauvegarde du profil désactivé tant que le formulaire n'est pas modifié (dirty)
- Icône de navigation mise en surbrillance sur le lien actif

### Technique
- Propriété `apiUrl` centralisée pour les appels API, pointant vers l'API versionnée (`/api/v1`)
- Correction du favicon
- Correction du corps de la requête `/subscribe`

## [0.1.0] - 2026-08-26

### Ajouté
- Page d'accueil (non connectée)
- Authentification : pages login et register avec layout dédié (auth-layout), gestion des erreurs de validation
- Connexion : persistance du token JWT dans le localStorage, service de session
- Intercepteurs HTTP : ajout automatique du token, déconnexion automatique sur erreur 401
- Guards de navigation (auth-guard, guest-guard) pour protéger les routes selon l'état de connexion
- Fil d'actualité (feed) : récupération et affichage des posts via le composant post-card
- Layout principal de l'application connectée, avec menu adaptatif en version mobile
- Page topic (structure initiale)
- Composant de notifications toast
- Organisation du code en packages `features` (pages/models/services) et `shared` (composants/directives)

### Technique
- Migration Angular 20 → 22
- Migration du builder vers esbuild/Vite (application builder)
- Migration des tests unitaires Karma/Jasmine → Vitest → Jest
- Ajout de Cypress pour les tests end-to-end
- Intégration de Tailwind CSS
