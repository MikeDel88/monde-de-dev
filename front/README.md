# Monde de Dev — Client

Application Angular du projet **Monde de Dev**, réseau social communautaire pour les développeurs (fil d'actualité par thèmes, articles, commentaires).

## Prérequis

- Node.js et npm
- L'API backend démarrée (voir [`../back/README.md`](../back/README.md)) — par défaut l'app pointe vers `http://localhost:9000/api/v1` en développement

## Installation

```bash
npm install
```

## Serveur de développement

```bash
npm start
```

Navigue vers `http://localhost:4200/`. L'application se recharge automatiquement à chaque modification des sources. La configuration `environment.ts` pointe vers l'API en local (`http://localhost:9000/api/v1`).

## Build

```bash
npm run build
```

Build de production (optimisé, hashing des fichiers de sortie) dans `dist/mdd-client/`, avec `environments/environment.prod.ts` (URL d'API de production) substitué automatiquement via `angular.json`.

## Tests unitaires

Les tests unitaires utilisent **Jest** (pas Karma) :

```bash
npm test              # exécution unique
npm run test:watch    # mode watch
npm run test:coverage # avec rapport de couverture
```

Seuil de couverture Jest : 80% (statements/branches/functions/lines), configuré dans `jest.config.js`.

## Tests end-to-end

Les tests e2e utilisent **Cypress** (pas le `ng e2e` par défaut d'Angular CLI) et nécessitent l'API backend démarrée en profil `test` (voir [README racine](../README.md) pour l'environnement Docker complet) :

```bash
npm run e2e         # build test + lancement de l'API front + Cypress headless
npm run e2e:open    # idem, en mode interactif
npm run e2e:coverage # instrumentation nyc + vérification du seuil de couverture (80%)
```

## Fichiers d'environnement

- `src/environments/environment.ts` — développement (`http://localhost:9000/api/v1`)
- `src/environments/environment.test.ts` — utilisé pour les tests e2e Cypress (`http://localhost:9001/api/v1`)
- `src/environments/environment.prod.ts` — production (`https://api.monde-de-dev.com/api/v1`)

## Aller plus loin

Pour plus d'informations sur l'Angular CLI, `ng help` ou la [documentation officielle](https://angular.io/cli).
