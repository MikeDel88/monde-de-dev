# Architecture

Ce document décrit l'architecture technique du front (`monde-de-dev/front`) : structure du code, choix techniques, et une critique argumentée des points à améliorer. Il complète `accessibility.md` (conventions ARIA/a11y).

## 1. Vue d'ensemble

- **Framework** : Angular 22, en composants **standalone** exclusivement (pas de `NgModule`), avec Angular **signals** comme mécanisme de réactivité principal.
- **Formulaires** : `@angular/forms/signals` (API récente, signal-based), pas Reactive Forms classique.
- **Styles** : Tailwind CSS v4, configuration CSS-first (pas de `tailwind.config.js`).
- **Tests unitaires** : Jest (`jest-preset-angular`).
- **Tests e2e** : Cypress.
- **Lint** : angular-eslint (ajouté récemment), avec le jeu de règles `template-accessibility`.
- **Build** : nouveau builder Angular basé sur esbuild (`@angular/build:application`).

## 2. Structure des dossiers

```
src/app/
├── core/       # singletons injectables, rien d'UI
│   ├── guards/         # AuthGuard, GuestGuard
│   ├── interceptors/   # authInterceptor, errorInterceptor
│   ├── models/         # formes d'erreur API partagées
│   └── services/       # SessionService
├── shared/     # présentationnel, réutilisable
│   ├── components/     # button, input, error, toast, post-card, topic-card, title, logo, back, loader, divider
│   ├── directives/      # menu-behavior (host directive)
│   └── layout/          # AuthLayout, MainLayout
└── features/   # domaines métier : auth, feed, home, post, profile, topic
    └── <domaine>/{models,pages,services[,components]}
```

Cette séparation est **cohérente et bien respectée** : `core` ne contient que de l'injectable (aucun composant UI n'y traîne), `shared` ne contient que du présentationnel (aucun accès HTTP direct), chaque `features/*` est autonome (pas d'import croisé entre features observé).

✅ *Corrigé* : `topic.component.ts`/`.html`/`.spec.ts` renommés en `topic.ts`/`topic.html`/`topic.spec.ts`, classe `TopicComponent` renommée en `Topic` (alignée sur `Feed`, `Login`, `Post`, `PostDetail`, `Profile`) — le modèle `Topic` déjà existant est importé sous l'alias `TopicModel` dans ce fichier pour éviter la collision de noms.

## 3. Routing et layouts

Toutes les routes sont déclarées en **eager loading** (`app.routes.ts`) — aucun `loadComponent`/`loadChildren`. Deux layouts montés comme composants de route parente :

```ts
{ path: '', canActivate: [GuestGuard], children: [
  { path: '', component: Home },
  { path: '', component: AuthLayout, children: [
    { path: 'register', component: Register },
    { path: 'login', component: Login },
  ]},
]},
{ path: '', canActivate: [AuthGuard], children: [
  { path: '', component: MainLayout, children: [
    { path: 'feed', component: Feed },
    { path: 'topic', component: TopicComponent },
    { path: 'profile', component: Profile },
    { path: 'post', component: Post },
    { path: 'post/:id', component: PostDetail },
  ]},
]},
{ path: '**', component: Home },
```

`GuestGuard` empêche un utilisateur connecté d'accéder à l'accueil/login/register (redirige vers `/feed`) ; `AuthGuard` empêche un utilisateur non connecté d'accéder au reste de l'app (redirige vers `/login`).

**Critique** : l'eager loading est un choix raisonnable vu la taille actuelle de l'app (6 features), mais devient un candidat naturel au lazy loading (`loadComponent` par route) si le nombre de features grossit, pour garder un bundle initial léger.

## 4. Bootstrap et injection de dépendances

Pas de `app.config.ts` : les providers sont déclarés directement dans `src/main.ts` :

```ts
bootstrapApplication(AppComponent, {
  providers: [
    provideZoneChangeDetection(),
    provideRouter(routes),
    AuthGuard,
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor]))
  ]
})
```

**Décorateur `@Service()`** : tous les services/guards du projet (`SessionService`, `AuthGuard`, `GuestGuard`, `*-service.ts`...) utilisent `@Service()` plutôt que `@Injectable()`. Ce n'est pas une erreur : `@Service` est un export réel et récent d'Angular 22 (`ServiceDecorator`), équivalent à `@Injectable({ providedIn: 'root' })` avec `autoProvided: true` par défaut. C'est un choix de convention du projet à documenter — l'équipe doit rester cohérente et ne pas mélanger avec `@Injectable()`.

**Deux points à corriger** :
- `AuthGuard` est fourni explicitement dans `providers` (`main.ts:21`) alors qu'il est déjà auto-provided en root via `@Service()` — entrée redondante, à supprimer.
- `enableProdMode()` appelé manuellement selon `environment.production` (`main.ts:13-15`) — pattern hérité des anciennes versions d'Angular ; les builders CLI récents (celui utilisé ici, `@angular/build:application`) le gèrent automatiquement au build de prod, cet appel manuel est obsolète.

## 5. Couche données

Pattern **cohérent et appliqué uniformément** dans tous les services (`feed-service.ts`, `post-service.ts`, `profile-service.ts`, `topic-service.ts`) : la **lecture** (GET) passe par `httpResource`/`HttpResourceRef` (signal-based, réactif), l'**écriture** (POST/PATCH/DELETE) passe par `HttpClient` classique + `Observable` + `.subscribe()` dans le composant appelant.

```ts
// src/app/features/feed/services/feed-service.ts
@Service()
export class FeedService {
  sortByAsc: WritableSignal<boolean> = signal<boolean>(false);

  posts: HttpResourceRef<PostFeed[] | undefined> = httpResource<PostFeed[]>(() => ({
    url: `${environment.apiUrl}/feed`,
    params: { sort: this.sortByAsc() ? "asc" : "desc" }
  }));
}
```

Ici `posts` se re-fetch automatiquement quand `sortByAsc` change, sans code de souscription manuel — bon usage idiomatique de `httpResource`. Seul `auth-service.ts` (login/register) est entièrement en `HttpClient`/`Observable`, ce qui est cohérent puisqu'il n'y a rien à "lire" en continu à ce niveau.

## 6. Gestion d'état

Pas de store centralisé façon NgRx. L'état applicatif est très majoritairement porté par des **signals locaux** (composant ou service scoped), avec une seule exception : `SessionService` (`src/app/core/services/session-service.ts`) reste en **RxJS** (`BehaviorSubject<boolean>` synchronisé avec `localStorage`), consommé par les guards, les intercepteurs et `main-layout.ts`.

**Critique** : c'est la seule pièce non-signals d'une application par ailleurs signals-first — une incohérence de style plutôt qu'un bug. Migrer vers un `signal<boolean>`/`computed` serait plus cohérent avec le reste du code, mais n'est pas urgent : le service fonctionne correctement et RxJS reste un choix idiomatique pour ce genre d'état.

## 7. Formulaires (`@angular/forms/signals`)

Pattern répété dans `login.ts`, `register.ts`, `profile.ts`, `post.ts`, `confirm-password-modal.ts` : un signal de modèle, une fonction de validation typée sur `SchemaPathTree<T>`, et un appel `form(model, validation)` produisant un `FieldTree<T>`.

```ts
// src/app/features/auth/pages/register/register.ts
const registerModel: WritableSignal<RegisterData> = signal<RegisterData>(initialRegisterData);
const validationRegisterForm = (schemaPath: SchemaPathTree<RegisterData>) => {
  required(schemaPath.name);
  required(schemaPath.email);
  email(schemaPath.email, {message: 'Email invalide'});
  pattern(schemaPath.password, /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).+$/, {...});
}
export class Register {
  registerForm: FieldTree<RegisterData> = form(registerModel, validationRegisterForm);
}
```

**Deux points corrigés** :

1. ✅ *Corrigé* : regex de mot de passe extraite dans `src/app/shared/validators/password-strength-validator.ts` (constante `PASSWORD_PATTERN` + fonction `validatePasswordStrength(path)`), utilisée par `register.ts` et `profile.ts` au lieu d'être dupliquée verbatim.
2. ✅ *Corrigé* : `login.ts`/`register.ts` définissent maintenant `loginModel`/`registerModel` comme champs d'instance (`private readonly ... = signal(...)`) au lieu de `const` de niveau module, alignés sur le pattern déjà utilisé par `profile.ts`/`post.ts`.

## 8. Gestion des erreurs

Deux intercepteurs HTTP fonctionnels (`src/app/core/interceptors/`) :
- `authInterceptor` : ajoute `Authorization: Bearer <token>` si un token existe en session.
- `errorInterceptor` : sur une 401 avec token existant, déconnecte et redirige vers `/login` ; sinon laisse remonter l'erreur.

Au-delà de ce cas global, chaque composant gère ses erreurs HTTP au cas par cas (signal `error` local, message affiché via `app-error`). Point positif : `auth-service.ts` centralise la construction des messages d'erreur login/register par code de statut plutôt que de laisser chaque composant deviner un message. `profile.ts`/`post.ts` en revanche posent des messages génériques en dur.

**Critique légère** : cohérent avec la taille actuelle de l'app ; pas de bus d'erreur/toast unifié, à envisager si le nombre de features augmente.

## 9. Styling

Tailwind v4, config CSS-first : `src/styles.css` fait `@import "tailwindcss"` puis définit les tokens du projet via `@theme` (`--color-primary`, `--color-error`, `--color-card`...). Pas de `tailwind.config.js`. PostCSS configuré via `.postcssrc.json` avec `@tailwindcss/postcss`.

**Critique concrète** : sur 22 fichiers `.css` de composants, **21 sont vides** (0 octet) — générés par défaut à la création de chaque composant standalone, jamais remplis car tout le style passe par les classes Tailwind dans les templates. Seul `loader.css` a un contenu réel (animation CSS custom, légitime car impossible en pur utility-classes). Recommandation : supprimer les 21 fichiers vides et utiliser `ng generate component --style=none` pour les futurs composants qui n'auront pas de CSS dédié.

## 10. Tests

- **Unitaires (Jest)** : `jest-preset-angular`, environnement `jsdom`. 32 fichiers `.spec.ts` pour 39 fichiers source — couverture correcte mais pas totale (quelques composants/directives sans spec, ex. `confirm-password-modal.ts`, `menu-behavior.ts`).
- **E2E (Cypress)** : un seul spec (`cypress/e2e/app.cy.ts`), qui vérifie seulement que l'app démarre et route bien. **Aucun parcours métier testé** (connexion, création de post, abonnement à un thème).

**Recommandation** : étoffer les tests e2e sur les parcours critiques (connexion/inscription, création d'un post, abonnement/désabonnement à un thème) avant d'ajouter de nouvelles fonctionnalités.

## 11. Lint et TypeScript

- `angular-eslint` configuré (`eslint.config.js`), avec `templateRecommended` + `templateAccessibility` sur les fichiers `.html`.
- `tsconfig.json` en mode `strict`, avec des options renforcées au-delà du strict minimum : `noImplicitOverride`, `noPropertyAccessFromIndexSignature`, `noImplicitReturns`, `noFallthroughCasesInSwitch`.
- Côté Angular : `strictTemplates`, `strictInjectionParameters`, `strictInputAccessModifiers` activés.

Bon niveau de rigueur, cohérent sur l'ensemble du projet.

## 12. Build

Nouveau builder esbuild (`@angular/build:application`). Budgets configurés en production (bundle initial : 500kb warning / 1mb error).

✅ *Corrigé* : `serve.configurations.development.buildTarget` pointe désormais vers `mdd-client:build:development` (au lieu de `:production`) — `ng serve` build bien avec le profil de développement.

## 13. Environnements

`src/environments/environment.ts` (dev) et `environment.prod.ts`, échangés via `fileReplacements` dans `angular.json`.

✅ *Corrigé* : `environment.prod.ts` a été mis à jour avec un placeholder explicite (`https://api.monde-de-dev.example.com/api/v1`, commentaire `TODO`) en attendant l'URL réelle de production, à la place de l'ancien `http://localhost:9000/api/v1` resté par erreur.

## 14. Synthèse — pistes d'amélioration prioritaires

| # | Problème | Impact | Fichier(s) | Statut |
|---|---|---|---|---|
| 1 | `ng serve` build avec le profil de production | Dev quotidien dégradé (pas de sourcemaps adaptées) | `angular.json` | ✅ corrigé |
| 2 | `environment.prod.ts` pointe vers `localhost:9000` | Bloquant pour un vrai déploiement | `src/environments/environment.prod.ts` | ✅ placeholder posé (URL réelle à renseigner) |
| 3 | État de formulaire au niveau module (`login.ts`, `register.ts`) | Anti-pattern, risque de state partagé entre instances | `login.ts`, `register.ts` | ✅ corrigé |
| 4 | Regex de mot de passe dupliquée | Maintenance (2 endroits à garder synchronisés) | `register.ts`, `profile.ts` | ✅ corrigé (extraite dans `shared/validators/`) |
| 5 | `topic.component.ts` seul fichier avec suffixe `.component` | Incohérence de nommage | `features/topic/pages/topic.component.ts` | ✅ corrigé (renommé en `topic.ts`/`Topic`) |
| 6 | `AuthGuard` fourni en double dans `main.ts` | Code mort/redondant | `main.ts` | ✅ corrigé |
| 7 | 21 fichiers `.css` vides | Clutter | `src/app/**/*.css` | ✅ corrigé (fichiers + `styleUrl` retirés) |
| 8 | Cypress ne couvre qu'un smoke test | Absence de filet de sécurité sur les parcours critiques | `cypress/e2e/` | à faire |
