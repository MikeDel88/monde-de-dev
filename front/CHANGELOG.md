# Changelog

Toutes les modifications notables de ce projet sont documentées dans ce fichier.

## [0.0.1] - 2026-08-26

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
