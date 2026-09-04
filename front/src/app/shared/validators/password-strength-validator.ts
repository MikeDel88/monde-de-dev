import {minLength, pattern, PathKind, SchemaPath, SchemaPathRules} from '@angular/forms/signals';

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_PATTERN = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).+$/;

export function validatePasswordStrength<TPathKind extends PathKind = PathKind.Root>(
  path: SchemaPath<string, SchemaPathRules.Supported, TPathKind>
): void {
  minLength(path, PASSWORD_MIN_LENGTH, {message: 'Doit être supérieur ou égal à 8 caractères'});
  pattern(path, PASSWORD_PATTERN, {message: 'Doit contenir au moins une lettre Majuscule, Minuscule, un chiffre et un caractère spécial'});
}
