import {minLength, pattern, PathKind, SchemaPath, SchemaPathRules} from '@angular/forms/signals';

/** Longueur minimale exigée pour un mot de passe. */
export const PASSWORD_MIN_LENGTH = 8;
/** Exige au moins une majuscule, une minuscule, un chiffre et un caractère spécial parmi `#?!@$%^&*-`. */
export const PASSWORD_PATTERN = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).+$/;

/**
 * Règle de validation réutilisable pour un champ mot de passe, à composer dans un
 * schéma de formulaire signal-based (`@angular/forms/signals`). Applique à la fois
 * la contrainte de longueur ({@link PASSWORD_MIN_LENGTH}) et de complexité ({@link PASSWORD_PATTERN}).
 * @param path Chemin du champ dans le schéma sur lequel appliquer la validation.
 */
export function validatePasswordStrength<TPathKind extends PathKind = PathKind.Root>(
  path: SchemaPath<string, SchemaPathRules.Supported, TPathKind>
): void {
  minLength(path, PASSWORD_MIN_LENGTH, {message: 'Doit être supérieur ou égal à 8 caractères'});
  pattern(path, PASSWORD_PATTERN, {message: 'Doit contenir au moins une lettre Majuscule, Minuscule, un chiffre et un caractère spécial'});
}
