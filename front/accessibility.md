# Accessibilité (ARIA)

Ce document décrit les pratiques d'accessibilité mises en place dans cette application, avec un focus sur l'usage d'ARIA (Accessible Rich Internet Applications). Il sert de référence pour l'équipe lors du développement de nouveaux composants ou de la revue de code.

Niveau visé : conformité **WCAG 2.1 AA**.

## 1. Pourquoi ARIA ?

ARIA permet de communiquer aux technologies d'assistance (lecteurs d'écran, plages braille...) des informations que le HTML seul ne peut pas toujours transmettre : le rôle d'un composant, son état (ouvert/fermé, sélectionné...), ou une description alternative quand aucun texte visible n'est disponible.

> **Règle n°1 : HTML sémantique avant ARIA.**
> Un `<button>` natif est nativement accessible (focusable, activable au clavier, annoncé comme "bouton"). Recréer ce comportement avec un `<div role="button">` demande de gérer manuellement le focus, les touches Entrée/Espace, etc. N'utilisez ARIA que pour compléter le HTML natif, jamais pour le remplacer quand une alternative sémantique existe (`<nav>`, `<main>`, `<header>`, `<footer>`, `<h1>`-`<h6>`, `<button>`, `<a href>`, `<form>`, `<label>`...).

### Les 3 catégories d'attributs ARIA

| Catégorie | Rôle | Exemples |
|---|---|---|
| **Rôles** | Définit ce qu'est un élément | `role="alert"`, `role="dialog"`, `role="status"` |
| **Propriétés** | Caractéristiques statiques | `aria-label`, `aria-labelledby`, `aria-describedby`, `aria-hidden` |
| **États** | Caractéristiques dynamiques, mises à jour en JS | `aria-expanded`, `aria-invalid`, `aria-current`, `aria-disabled` |

## 2. Conventions utilisées dans ce projet

Les exemples ci-dessous sont extraits du code existant du repo.

### `aria-label` sur les champs et boutons sans texte visible suffisant

Utilisé pour donner un nom accessible explicite, notamment sur les champs de formulaire et les boutons icône.

⚠️ Poser un attribut `aria-label` (ou tout autre `aria-*`) directement sur le tag d'un composant custom (`<app-input aria-label="...">`) **n'a aucun effet** : Angular pose l'attribut sur l'élément hôte du composant, qui n'est pas forcément l'élément interactif réel, et rien ne le retransmet automatiquement à l'`<input>` interne. C'est ce qui s'est produit dans une précédente version de `login.html`. Le composant doit exposer explicitement un `input()` dédié et le lier dans son propre template via `[attr.aria-label]`.

```html
<!-- src/app/shared/components/input/input.ts -->
readonly ariaLabel: InputSignal<string | undefined> = input<string | undefined>(undefined);
```

```html
<!-- src/app/shared/components/input/input.html (branche sans label visible) -->
<input [id]="id" [attr.aria-label]="ariaLabel()" ... />
```

Cas normal (label visible) : le `<label>` englobant suffit, pas besoin de `ariaLabel`.

```html
<!-- src/app/features/auth/pages/login/login.html -->
<app-input [label]="labelEmailOrName" type="text" [formField]="loginForm.emailOrName" />
<app-input [label]="labelPassword" type="password" [formField]="loginForm.password" />
```

Cas sans label visible : utiliser `ariaLabel`.

```html
<!-- src/app/features/profile/components/confirm-password-modal/confirm-password-modal.html -->
<app-input type="password" ariaLabel="Mot de passe actuel" [formField]="passwordForm.currentPassword" />
```

```html
<!-- src/app/shared/components/toast/toast.html -->
<button (click)="onClose($event)" type="button" aria-label="Close">
  <span class="sr-only">Close</span>
  <svg aria-hidden="true">...</svg>
</button>
```

### `aria-describedby` / `aria-invalid` sur les champs en erreur

`app-input` génère un id unique par instance et l'utilise pour lier le champ à son message d'erreur, et expose l'état invalide via `aria-invalid`. Le lecteur d'écran annonce alors l'erreur en contexte quand l'utilisateur est sur le champ.

```html
<!-- src/app/shared/components/input/input.html -->
<input
  [id]="id"
  [attr.aria-invalid]="touched() && invalid()"
  [attr.aria-describedby]="touched() && invalid() ? errorId : null"
/>

@if (touched() && invalid()) {
  <div [id]="errorId">
    @for (error of errors(); track error) {
      <app-error [attr.data-test]="errorDataTest()" [message]="error.message" />
    }
  </div>
}
```

### `aria-hidden="true"` sur les éléments décoratifs

Les icônes SVG purement décoratives (qui dupliquent un texte déjà présent, ou n'apportent pas d'information supplémentaire) sont masquées aux lecteurs d'écran avec `aria-hidden="true"`, combinées si besoin avec un texte alternatif via `sr-only`.

```html
<!-- src/app/shared/components/dividers/dividers.html -->
<hr aria-hidden="true" class="grow border-t border-black">
```

```html
<!-- src/app/shared/components/toast/toast.html -->
<svg aria-hidden="true">...</svg>
<span class="sr-only">Check icon</span>
```

⚠️ `aria-hidden="true"` ne doit **jamais** être posé sur un élément focusable (bouton, lien, champ) : il resterait atteignable au clavier tout en étant invisible pour le lecteur d'écran, ce qui crée une incohérence.

### `role="alert"` pour le contenu dynamique important

Les notifications qui apparaissent dynamiquement à l'écran (toasts) utilisent `role="alert"`, qui fait annoncer automatiquement leur contenu par le lecteur d'écran dès leur insertion dans le DOM, sans que l'utilisateur ait besoin d'y naviguer.

```html
<!-- src/app/shared/components/toast/toast.html -->
<div role="alert">
  <h4>{{ message() }}</h4>
</div>
```

### `aria-label` sur les indicateurs de chargement

```html
<!-- src/app/shared/components/loader/loader.html -->
<span class="loader" aria-label="loading"></span>
```

Pour un loader qui reste affiché plus de quelques secondes ou qui met à jour son texte, préférer `role="status"` (zone live "polie", annoncée sans interrompre l'utilisateur) plutôt que `role="alert"`.

### Hiérarchie de titres avec `app-title`

`app-title` expose un input `level` (1 à 6) pour choisir le niveau de titre réellement rendu (`<h1>`-`<h6>`), plutôt que d'imposer un niveau fixe. Règle : **un seul `<h1>` par page**, posé sur le titre principal.

```html
<!-- src/app/shared/components/title/title.ts -->
level: InputSignal<1 | 2 | 3 | 4 | 5 | 6> = input<1 | 2 | 3 | 4 | 5 | 6>(2);
```

```html
<!-- src/app/features/profile/pages/profile.html -->
<app-title class="font-bold" [content]="titleProfilUser" [level]="1" />
```

Quand une page n'a pas de titre visible naturel (ex. `feed`, `topic`, `home`), ajouter un `<h1>` masqué visuellement mais présent pour les lecteurs d'écran :

```html
<!-- src/app/features/feed/pages/feed.html -->
<h1 class="sr-only">Articles</h1>
```

### Navigation clavier et structure de page

- **Skip-link** : premier élément focusable de la page, permet de sauter directement au contenu principal sans traverser toute la navigation.
  ```html
  <!-- src/app/shared/layout/main/main-layout.html -->
  <a href="#main-content" class="sr-only focus:not-sr-only ...">Aller au contenu principal</a>
  ...
  <main id="main-content"><router-outlet/></main>
  ```
- **Fermeture au clavier** : un menu/panneau ouvert doit pouvoir se fermer avec `Échap`, pas seulement en cliquant hors de la zone.
  ```ts
  // src/app/shared/directives/menu-behavior.ts
  host: { `'(document:keydown.escape)': 'close()'` }
  ```
- **Élément cliquable répétable → élément sémantique focusable**, jamais un `<div (click)>` seul.
  ```html
  <!-- src/app/shared/components/post-card/post-card.html -->
  <article>
    <button type="button" (click)="onClick(post.id)" [attr.aria-label]="ariaLabel()">...</button>
  </article>
  ```

## 3. Checklist par type de composant

### Boutons et liens
- Le nom accessible (texte visible, ou `aria-label` si icône seule) décrit **l'action**, pas juste l'apparence ("Fermer" plutôt que "Croix").
- Un lien qui déclenche une action JS doit être un `<button>`, pas un `<a>` sans `href`.
- Le focus clavier doit rester visible (ne jamais faire `outline: none` sans remplacement visuel).
- Pas de `tabindex` positif (`tabindex="1"`, `2`...) : cela casse l'ordre de tabulation naturel. Seuls `0` et `-1` sont acceptables.

### Formulaires
- Chaque champ a un `<label>` associé (via `for`/`id`, ou `aria-label`/`aria-labelledby` si le label n'est pas visible). Sur `app-input`, utiliser `[label]` (label visible) ou `ariaLabel` (nom accessible sans label visible) — jamais un attribut `aria-label` brut sur le tag `<app-input>`, qui n'a aucun effet.
- `app-input` lie automatiquement le message d'erreur au champ via `aria-describedby`, et passe le champ en `aria-invalid="true"` quand il est en erreur (`touched() && invalid()`) — rien à faire côté appelant.
- Le composant `app-error` du projet (`src/app/shared/components/error`) est rendu dans le conteneur référencé par `aria-describedby` pour que l'erreur soit annoncée en contexte.

### Images et icônes
- Icône **porteuse de sens** (aucun texte équivalent à proximité) → `aria-label` sur l'élément interactif, ou texte `sr-only`.
- Icône **purement décorative** (redondante avec un texte déjà présent) → `aria-hidden="true"`.
- Image `<img>` informative → attribut `alt` descriptif ; image décorative → `alt=""`.

### Contenu dynamique
- Message ponctuel important (erreur, confirmation) → `role="alert"` (comme `toast.html`).
- Contenu qui se met à jour sans être critique (statut, compteur) → `role="status"` avec `aria-live="polite"`.
- Éviter `aria-live="assertive"` sauf urgence réelle : ça interrompt la lecture en cours du lecteur d'écran.

### Modales / dialogues
- Préférer l'élément natif `<dialog>` ouvert via `showModal()` : il fournit gratuitement la sémantique modale, le focus trap, la restitution du focus et la fermeture au clavier (`Échap` déclenche l'événement `cancel`).
- Titre de la modale référencé via `aria-labelledby` :
  ```html
  <!-- src/app/features/profile/components/confirm-password-modal/confirm-password-modal.html -->
  <dialog #dialog aria-labelledby="confirm-password-title" (cancel)="onCancel()">
    <app-title id="confirm-password-title" [content]="title" />
  ```
- Si un `<div>` doit être utilisé à la place de `<dialog>` (cas rare), ajouter manuellement `role="dialog"` (ou `alertdialog`) + `aria-modal="true"` et gérer soi-même focus trap, restitution du focus et `Échap`.

## 4. Erreurs courantes à éviter

- **ARIA redondant** : ajouter `role="button"` sur un `<button>`, ou `aria-label` identique au texte déjà visible — inutile, source de confusion en cas de désynchronisation future.
- **`aria-label` sur un élément non interactif et non exposé** (`<div>` sans `role`) : ignoré par la plupart des lecteurs d'écran, ne remplace pas un vrai composant sémantique.
- **`aria-label` (ou autre `aria-*`) posé sur le tag d'un composant Angular custom** (`<app-input aria-label="...">`) en pensant qu'il atteindra l'élément interactif interne : l'attribut reste sur l'élément hôte et n'est jamais retransmis à l'`<input>` réel sauf si le composant expose explicitement un `input()` dédié et le lie lui-même via `[attr.aria-label]` dans son propre template (voir `ariaLabel` sur `app-input`).
- **`aria-hidden="true"` sur un élément focusable** (voir section 2) : rend l'élément accessible au clavier mais invisible au lecteur d'écran.
- **Changer l'état visuel sans changer l'état ARIA** : par exemple un menu qui s'ouvre visuellement sans mettre à jour `aria-expanded`.
- **Contraste de couleur insuffisant** : indépendant d'ARIA, mais indispensable pour WCAG AA (ratio minimum 4.5:1 pour le texte standard).

## 5. Outils de vérification

- **axe DevTools** (extension navigateur) : audit automatique de la page en cours, détecte la majorité des erreurs ARIA/contraste.
- **Lighthouse** (onglet Accessibility, intégré à Chrome DevTools) : score global et liste des problèmes.
- **Navigation clavier manuelle** : parcourir chaque page uniquement au clavier (`Tab`, `Shift+Tab`, `Entrée`, `Échap`) et vérifier que tout élément interactif est atteignable et que l'ordre est logique.
- **Lecteur d'écran** : test manuel avec NVDA (Windows, gratuit) ou VoiceOver (macOS) sur les parcours critiques (connexion, formulaires, notifications).

## 6. Ressources

- [WAI-ARIA Authoring Practices Guide (APG)](https://www.w3.org/WAI/ARIA/apg/) — patterns de référence par type de composant (dialog, menu, tabs...).
- [MDN — ARIA](https://developer.mozilla.org/fr/docs/Web/Accessibility/ARIA)
- [WCAG 2.1 — Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
