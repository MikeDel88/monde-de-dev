# Changelog

Toutes les modifications notables de ce projet sont documentées dans ce fichier.

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
