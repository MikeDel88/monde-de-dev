# Changelog

Toutes les modifications notables de ce projet sont documentées dans ce fichier.

## [1.0.2] - 2026-09-24

### Corrigé
- Bouton "Créer un article" (fil d'actualité) : `aria-label` désormais lié au même texte que le libellé visible, au lieu d'une chaîne statique en anglais incohérente
- Sélecteur de thème (création d'article) : suppression d'un second `aria-label` en conflit avec celui déjà porté par le composant
- Hiérarchie des titres de la page profil : le titre "Abonnements" passe de `h6` (niveau par défaut) à `h2`, pour ne plus sauter de niveaux après le `h1` de la page

## [1.0.1] - 2026-09-24

Aucun changement fonctionnel. Version alignée avec la release de fix 1.0.1 du back.

## [1.0.0] - 2026-09-23

Version finale du MVP.

### Ajouté
- Authentification par cookie JWT avec intercepteur XSRF, guards `AuthGuard`/`GuestGuard` en approche fonctionnelle
- Déconnexion propre avec `takeUntilDestroyed`
- Gestion d'erreurs unifiée : `AppError`, `ErrorCodes`, `mapHttpErrorToMessage`, `ToastService` (remplace `ErrorToastService`)
- Page d'erreur 404 dédiée (`NotFoundPage`)
- Pagination du fil d'actualité avec scroll infini, tri et filtre via signals
- Mise à jour consolidée du profil (nom, email, mot de passe) avec toasts de succès et réinitialisation du formulaire

### Technique
- Lazy loading de toutes les routes, y compris les layouts (`loadComponent`/`loadChildren`)
- Renommage des routes pour cohérence (`/feed` → `/posts`, `/topic` → `/topics`)
- Passage en revue de l'accessibilité et de l'i18n : aria-labels sur l'ensemble des composants, textes en français, menu mobile
- Suite de tests étendue (composants, services, guards, intercepteurs) et relèvement du seuil de couverture Jest et Cypress/`nyc` de 70% à 80%

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
