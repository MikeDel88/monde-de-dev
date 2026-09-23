import {HttpErrorResponse} from "@angular/common/http";
import {ApiProblemDetail} from "../models/api-problem-detail";
import {FieldError} from "../models/field-error";
import {translateErrorCode} from "./error-code-messages";

export const GENERIC_FALLBACK_MESSAGE = 'Une erreur est survenue, veuillez réessayer plus tard.';
const GENERIC_FIELD_ERROR_MESSAGE = 'Champ invalide.';

/**
 * Traduit une erreur HTTP brute en message utilisateur affichable, en français.
 * Le corps de la réponse est supposé suivre le format `ApiProblemDetail` du backend
 * (`detail` pour un code d'erreur métier, `errors` pour une liste d'erreurs de champs).
 * Chaque code d'erreur métier est traduit via `translateErrorCode` ; si le code est
 * inconnu ou absent, un message générique par statut HTTP (ou {@link GENERIC_FALLBACK_MESSAGE}
 * en dernier recours) est renvoyé pour ne jamais exposer une erreur technique brute.
 * @param err Erreur HTTP interceptée (typiquement dans `error-interceptor`).
 * @returns Message d'erreur prêt à être affiché à l'utilisateur.
 */
export function mapHttpErrorToMessage(err: HttpErrorResponse): string {
  const body = err.error as ApiProblemDetail | null;

  switch (err.status) {
    case 400:
      if (body?.errors?.length) {
        return body.errors.map((e: FieldError) => translateErrorCode(e.code) ?? GENERIC_FIELD_ERROR_MESSAGE).join(', ');
      }
      return translateErrorCode(body?.detail) ?? 'Formulaire invalide';
    case 401:
      return "Session expirée ou identifiants invalides.";
    case 403:
      return "Vous n'avez pas les droits nécessaires pour effectuer cette action.";
    case 404:
      return "La ressource demandée n'existe pas ou plus.";
    case 409:
      return translateErrorCode(body?.detail) ?? "Un conflit est survenu.";
    case 429:
      return translateErrorCode(body?.detail) ?? "Trop de tentatives, réessayer plus tard.";
    default:
      return translateErrorCode(body?.detail) ?? GENERIC_FALLBACK_MESSAGE;
  }
}
