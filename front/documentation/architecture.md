# Architecture

Ce document décrit l'architecture technique du front (`monde-de-dev/front`) : structure du code, choix techniques, et une critique argumentée des points à améliorer. Il complète `accessibility.md` (conventions ARIA/a11y).

## 1. Vue d'ensemble

- **Framework** : Angular 22, en composants **standalone** exclusivement (pas de `NgModule`), avec Angular **signals** comme mécanisme de réactivité principal.
- **Formulaires** : `@angular/forms/signals` (API récente, signal-based), pas Reactive Forms classique.
- **Styles** : Tailwind CSS v4, configuration CSS-first (pas de `tailwind.config.js`).
- **Tests unitaires** : Jest (`jest-preset-angular`).
- **Tests e2e** : Cypress.
- **Lint** : angular-eslint, avec le jeu de règles `template-accessibility`.
- **Build** : builder Angular basé sur esbuild (`@angular/build:application`).

## 2. Choix techniques

Cette section justifie les décisions structurantes prises sur le projet : le choix retenu, l'alternative usuelle qui aurait pu être prise à sa place, et la raison probable du choix. Certaines justifications relèvent de l'hypothèse raisonnable plutôt que d'une décision documentée formellement — elles sont indiquées comme telles.

| # | Choix | Alternative écartée | Justification |
|---|---|---|---|
| 1 | Angular standalone + signals | `NgModule` + change detection zone-based classique | Réduit le boilerplate (pas de déclarations de modules), réactivité fine-grained, direction actuelle recommandée par le framework. |
| 2 | `@angular/forms/signals` | Reactive Forms classique (`FormGroup`/`FormControl`) | Cohérence avec un état applicatif signals-first plutôt que de faire cohabiter deux modèles de réactivité (signals + `FormControl.valueChanges` en Observable). |
| 3 | Tailwind v4 CSS-first (`@theme`, sans `tailwind.config.js`) | `tailwind.config.js` classique, ou Sass/CSS modules | Configuration plus simple et alignée sur la nouvelle version de Tailwind ; évite une couche de build/preprocessing supplémentaire. |
| 4 | `httpResource` pour les lectures (GET), `HttpClient`+`Observable` pour les écritures (POST/PATCH/DELETE) | Tout en `Observable`/`subscribe`, ou tout en resource | Les GET bénéficient du re-fetch réactif automatique quand leurs paramètres (signals) changent ; les mutations restent déclenchées par une action utilisateur ponctuelle, donc pas de gain à les rendre réactives. |
| 5 | `@Service()` plutôt que `@Injectable({providedIn: 'root'})` | `@Injectable({providedIn: 'root'})` | API équivalente introduite en Angular 22, plus concise (`autoProvided: true` par défaut). Choix de convention d'équipe — à garder cohérent, ne pas mélanger avec `@Injectable()`. |
| 6 | Pas de store centralisé (NgRx) — signals locaux/scoped | NgRx (ou tout autre store global) | Taille et complexité actuelles de l'état applicatif limitées ; un store centralisé ajouterait de la complexité non justifiée à ce stade *(hypothèse raisonnable, non documentée formellement)*. |
| 7 | Jest (`jest-preset-angular`) | Karma/Jasmine (historiquement par défaut sur Angular CLI) | Temps d'exécution plus rapide et écosystème plus large ; tendance générale de l'industrie à s'éloigner de Karma. |
| 8 | Cypress | Playwright | Écosystème mature, bonne intégration Angular via `@cypress/schematic` *(hypothèse raisonnable, non documentée formellement)*. |
| 9 | `angular-eslint` avec `template-accessibility` | Lint template minimal / pas de règles a11y dédiées | L'accessibilité est traitée comme une préoccupation de premier ordre sur ce projet (cohérent avec l'existence de `accessibility.md`). |
| 10 | Builder esbuild (`@angular/build:application`) | Builder Webpack (`@angular-devkit/build-angular` classique) | Builder par défaut recommandé par l'équipe Angular depuis la v17+, temps de build significativement réduits. |
| 11 | Lazy loading de toutes les routes (`loadComponent`/`loadChildren`, y compris les layouts) | Eager loading (import direct des composants dans `app.routes.ts`) | Bundle initial plus léger : chaque page/layout n'est chargée que lorsque sa route est activée. |
| 12 | TypeScript strict renforcé (`noImplicitOverride`, `noPropertyAccessFromIndexSignature`, `noImplicitReturns`, `noFallthroughCasesInSwitch`) + `strictTemplates` côté Angular | Mode `strict` minimal | Niveau de rigueur volontairement élevé, appliqué de façon cohérente sur tout le projet plutôt que le strict minimum du template Angular CLI. |

## 3. Structure des dossiers

**Légende** : l'indentation indique l'imbrication des dossiers, le commentaire en fin de ligne (`#`) précise le rôle de chacun. Les trois dossiers racine de `src/app/` — `core`, `shared`, `features` — sont une convention structurante du projet, pas un simple regroupement thématique : `core` ne doit contenir que de l'injectable (aucun composant UI), `shared` que du présentationnel réutilisable (aucun accès HTTP direct), et chaque sous-dossier de `features` doit rester autonome (pas d'import croisé entre domaines métier). À l'intérieur de chaque `features/<domaine>`, le sous-motif `{models,pages,services[,components]}` est répété à l'identique sur tous les domaines (auth, feed, post, profile, topic...), pour qu'un nouveau domaine métier s'intègre sans inventer une organisation ad hoc. Les fichiers eux-mêmes suivent une convention de nommage systématique : kebab-case, suffixé par rôle (`*-guard.ts`, `*-interceptor.ts`, `*-service.ts`, `*-validator.ts`...), ce qui permet d'identifier la nature d'un fichier sans l'ouvrir ; chaque fichier a son `*.spec.ts` co-localisé juste à côté (pas de dossier `__tests__` séparé) ; et tous les composants/directives portent un sélecteur préfixé `app-`/`app` (`app-button`, `app-error`, `appMenuBehavior`...).

```
src/app/
├── core/       # singletons injectables, rien d'UI
│   ├── guards/         # AuthGuard, GuestGuard
│   ├── interceptors/   # authInterceptor (http-interceptor.ts), xsrfInterceptor, errorInterceptor
│   ├── models/         # AppError, ApiProblemDetail, FieldError
│   ├── services/       # SessionService, session-initializer (initSession)
│   └── utils/          # mapHttpErrorToMessage
├── shared/     # présentationnel, réutilisable
│   ├── components/     # button, input, error, toast, post-card, topic-card, title, logo, back, loader, divider
│   ├── directives/      # menu-behavior (host directive)
│   └── layout/          # AuthLayout, MainLayout
└── features/   # domaines métier : auth, error, feed, home, post, profile, topic
    └── <domaine>/{models,pages,services[,components]}
```

Cette séparation est **cohérente et bien respectée** : `core` ne contient que de l'injectable (aucun composant UI n'y traîne), `shared` ne contient que du présentationnel (aucun accès HTTP direct), chaque `features/*` est autonome (pas d'import croisé entre features observé).

## 4. Routing et layouts

Toutes les routes sont déclarées en **lazy loading** (`app.routes.ts`), y compris les layouts : chaque route utilise `loadComponent:() => Component`, et les groupes de routes protégées par guard utilisent `loadChildren:() => [...]` (routes inline, pas de module séparé). Deux layouts montés comme composants de route parente :

```ts
{
  path: '', canActivate: [GuestGuard],
  loadChildren: () => [
    { path: '', loadComponent: () => Home, title: "Page d'accueil" },
    {
      path: '', loadComponent: () => AuthLayout,
      loadChildren: () => [
        { path: 'register', loadComponent: () => Register, title: "Inscription" },
        { path: 'login', loadComponent: () => Login, title: "Se connecter" },
      ],
    },
  ],
},
{
  path: '', canActivate: [AuthGuard],
  loadChildren: () => [
    {
      path: '', loadComponent: () => MainLayout,
      loadChildren: () => [
        { path: 'feed', loadComponent: () => Feed, title: "Fil d'actualité" },
        { path: 'topics', loadComponent: () => Topic, title: "Thèmes" },
        { path: 'profile', loadComponent: () => Profile, title: "Profil utilisateur" },
        { path: 'post', loadComponent: () => Post, title: "Créer un nouvel article" },
        { path: 'post/:id', loadComponent: () => PostDetail, title: "Voir un article" },
      ],
    },
  ],
},
{ path: '**', loadComponent: () => ErrorPage, title: "Page introuvable" },
```

`GuestGuard` empêche un utilisateur connecté d'accéder à l'accueil/login/register (redirige vers `/feed`) ; `AuthGuard` empêche un utilisateur non connecté d'accéder au reste de l'app (redirige vers `/login`). La route catch-all (`**`) affiche une page 404 dédiée (`features/error`). Chaque route porte un `title`, utilisé par Angular pour le titre d'onglet.

## 5. Bootstrap et injection de dépendances

Pas de `app.config.ts` : les providers sont déclarés directement dans `main.ts` :

```ts
bootstrapApplication(AppComponent, {
  providers: [
    provideZoneChangeDetection(),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor, xsrfInterceptor, errorInterceptor]),
    ),
    provideAppInitializer(() => initSession()),
  ]
})
```

**Décorateur `@Service()`** : tous les services/guards du projet (`SessionService`, `AuthGuard`, `GuestGuard`, `*-service.ts`...) utilisent `@Service()` plutôt que `@Injectable()`. Ce n'est pas une erreur : `@Service` est un export réel et récent d'Angular 22 (`ServiceDecorator`), équivalent à `@Injectable({ providedIn: 'root' })` avec `autoProvided: true` par défaut. C'est un choix de convention du projet à documenter — l'équipe doit rester cohérente et ne pas mélanger avec `@Injectable()`. `AuthGuard` n'a pas besoin d'être listé explicitement dans `providers` : il est déjà auto-provided en root via `@Service()`.

**Point à corriger** : `enableProdMode()` appelé manuellement selon `environment.production` (`main.ts:14-16`) — pattern hérité des anciennes versions d'Angular ; les builders CLI récents (celui utilisé ici, `@angular/build:application`) le gèrent automatiquement au build de prod, cet appel manuel est superflu.

`provideAppInitializer(() => initSession())` retarde le démarrage de l'app jusqu'à la résolution de `initSession()` (voir section 7) : l'authentification étant basée sur un cookie httpOnly invisible en JS, il faut interroger l'API pour savoir si une session est active avant de rendre l'app.

## 6. Couche données

Pattern **cohérent et appliqué uniformément** dans tous les services (`feed-service.ts`, `post-service.ts`, `profile-service.ts`, `topic-service.ts`) : la **lecture** (GET) passe par `httpResource`/`HttpResourceRef` (signal-based, réactif), l'**écriture** (POST/PATCH/DELETE) passe par `HttpClient` classique + `Observable` + `.subscribe()` dans le composant appelant.

```ts
// src/app/features/feed/services/feed-service.ts
@Service()
export class FeedService {
  sortByAsc: WritableSignal<boolean> = signal<boolean>(false);
  private page: WritableSignal<number> = signal<number>(0);

  posts: HttpResourceRef<Page<PostFeed> | undefined> = httpResource<Page<PostFeed>>(() => ({
    url: `${environment.apiUrl}/posts`,
    params: {
      sort: `date,${this.sortByAsc() ? "asc" : "desc"}`,
      page: this.page(),
      size: PAGE_SIZE
    }
  }));
}
```

Ici `posts` se re-fetch automatiquement quand `sortByAsc` ou `page` change, sans code de souscription manuel — bon usage idiomatique de `httpResource`. La réponse est un `Page<PostFeed>` (pagination Spring standard : `content`, `totalPages`, `number`...), pas un tableau brut ; le tri est encodé au format `Pageable` de Spring Data (`sort=date,asc|desc`) plutôt qu'en paramètre custom. `FeedService` accumule les pages chargées dans un signal `loadedPosts` séparé pour le scroll infini (voir `feed-service.ts` pour le détail — `loadMore()`/`hasMore`). Seul `auth-service.ts` (login/register) est entièrement en `HttpClient`/`Observable`, ce qui est cohérent puisqu'il n'y a rien à "lire" en continu à ce niveau.

## 7. Authentification

L'authentification est **cookie-based** : le JWT est porté par un cookie `httpOnly` posé par le backend, jamais manipulé directement en JS côté client. Trois pièces travaillent ensemble :

- **`authInterceptor`** (`core/interceptors/http-interceptor.ts`) : ajoute `withCredentials: true` à chaque requête, pour que le navigateur transmette le cookie de session. Aucun header `Authorization` n'est nécessaire, le token n'étant jamais manipulé côté client.
- **`xsrfInterceptor`** (`core/interceptors/xsrf-interceptor.ts`) : lit le cookie `XSRF-TOKEN` posé par le backend et le recopie dans le header `X-XSRF-TOKEN` sur toute requête autre que `GET`/`HEAD` (protection CSRF classique côté double-submit cookie, nécessaire puisque l'auth ne repose plus sur un header `Authorization` explicite).
- **`session-initializer.ts`** (`initSession()`) : au démarrage de l'app (via `provideAppInitializer`, voir section 5), appelle `GET /profile` — si la requête réussit, `SessionService.logIn()` est appelé ; sinon l'état reste "non connecté". C'est le seul moyen de savoir si une session est active au chargement, le cookie httpOnly n'étant pas lisible en JS. Cet appel passe par le contexte `SKIP_AUTH_REDIRECT` (voir section 10) pour ne pas déclencher de redirection vers `/login` en cas d'échec.

```ts
// src/app/core/services/session-initializer.ts
export function initSession(): Observable<void> {
  const httpClient = inject(HttpClient);
  const sessionService = inject(SessionService);

  return httpClient.get(`${environment.apiUrl}/profile`, {
    context: new HttpContext().set(SKIP_AUTH_REDIRECT, true),
  }).pipe(
    map(() => sessionService.logIn()),
    catchError(() => of(undefined)),
  );
}
```

## 8. Gestion d'état

Pas de store centralisé façon NgRx. L'état applicatif est très majoritairement porté par des **signals locaux** (composant ou service scoped), avec une seule exception : `SessionService` (`app/core/services/session-service.ts`) reste en **RxJS** (`BehaviorSubject<boolean>`), consommé par les guards, les intercepteurs et `main-layout.ts`. C'est un simple booléen en mémoire, sans persistance en `localStorage` : il est mis à `true`/`false` par `logIn()`/`logOut()`, et reconstruit à chaque chargement de page par `initSession()` (section 7), la source de vérité réelle étant le cookie httpOnly côté serveur.

**Critique** : c'est la seule pièce non-signals d'une application par ailleurs signals-first — une incohérence de style plutôt qu'un bug. Migrer vers un `signal<boolean>`/`computed` serait plus cohérent avec le reste du code, mais n'est pas urgent : le service fonctionne correctement et RxJS reste un choix idiomatique pour ce genre d'état.

## 9. Formulaires (`@angular/forms/signals`)

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

## 10. Gestion des erreurs

Trois intercepteurs HTTP fonctionnels (`app/core/interceptors`, voir aussi section 7) :
- `authInterceptor` : ajoute `withCredentials: true` pour transmettre le cookie de session.
- `xsrfInterceptor` : recopie le cookie `XSRF-TOKEN` dans le header `X-XSRF-TOKEN` sur les requêtes mutantes.
- `errorInterceptor` : sur une 401, déconnecte et redirige vers `/login`, **sauf** si la requête porte le contexte `SKIP_AUTH_REDIRECT` (`req.context.get(SKIP_AUTH_REDIRECT)`) — utilisé par `initSession()` pour sonder l'état de session sans provoquer de redirection intempestive au chargement. Dans tous les cas, l'erreur est reconvertie en `AppError` (`message`, `status`) via `mapHttpErrorToMessage()` avant d'être relancée.

`mapHttpErrorToMessage()` (`core/utils/http-error-message.ts`) centralise la traduction code HTTP → message utilisateur en français (400 avec détail des erreurs de champ via `ApiProblemDetail`/`FieldError`, 401, 403, 404, 409, 429, et un message générique par défaut), plutôt que de laisser chaque appelant deviner un message. Chaque composant consomme ensuite l'`AppError` au cas par cas (signal `error` local, message affiché via `app-error`).

**Critique légère** : cohérent avec la taille actuelle de l'app ; pas de bus d'erreur/toast unifié pour l'affichage, chaque composant reste responsable du sien — à envisager si le nombre de features augmente.

## 11. Styling

Tailwind v4, config CSS-first : `styles.css` fait `@import "tailwindcss"` puis définit les tokens du projet via `@theme` (`--color-primary`, `--color-error`, `--color-card`...). Pas de `tailwind.config.js`. PostCSS configuré via `.postcssrc.json` avec `@tailwindcss/postcss`.

Un seul fichier CSS de composant a un contenu réel : `loader.css` (animation CSS custom, légitime car impossible en pur utility-classes) — tout le reste du style passe par les classes Tailwind dans les templates ; les composants sont générés avec `ng generate component --style=none` quand ils n'ont pas de CSS dédié.

## 12. Tests

- **Unitaires (Jest)** : `jest-preset-angular`, environnement `jsdom`. 39 fichiers `.spec.ts` pour 52 fichiers source — bonne couverture.
- **E2E (Cypress)** : 9 specs (`create-post`, `detail-post`, `feed`, `home`, `login`, `profile`, `register`, `session`, `topics`) couvrant les principaux parcours métier (connexion/inscription, création et consultation d'un post, fil d'actualité, profil, thèmes, persistance de session).

Bonne couverture globale, unitaire comme e2e.

## 13. Lint et TypeScript

- `angular-eslint` configuré (`../eslint.config.js`), avec `templateRecommended` + `templateAccessibility` sur les fichiers `.html`.
- `../tsconfig.json` en mode `strict`, avec des options renforcées au-delà du strict minimum : `noImplicitOverride`, `noPropertyAccessFromIndexSignature`, `noImplicitReturns`, `noFallthroughCasesInSwitch`.
- Côté Angular : `strictTemplates`, `strictInjectionParameters`, `strictInputAccessModifiers` activés.

Bon niveau de rigueur, cohérent sur l'ensemble du projet.

## 14. Build

Builder esbuild (`@angular/build:application`). Budgets configurés en production.

## 15. Environnements

`environments/environment.ts` (dev) et `environment.prod.ts`, échangés via `fileReplacements` dans `angular.json`.
