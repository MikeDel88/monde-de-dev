import {FieldError} from "./field-error";

/**
 * Corps d'erreur renvoyé par le backend (format "problem detail"), consommé par
 * `mapHttpErrorToMessage` pour produire un message utilisateur.
 */
export interface ApiProblemDetail {
  status: number;
  /** Code d'erreur métier (voir `error-code-messages.ts`), présent hors erreurs de validation de champs. */
  detail?: string;
  /** Liste des erreurs de validation par champ, présente pour les erreurs 400 de formulaire. */
  errors?: FieldError[];
}
