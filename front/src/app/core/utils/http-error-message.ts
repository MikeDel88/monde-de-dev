import {HttpErrorResponse} from "@angular/common/http";
import {ApiProblemDetail} from "../models/api-problem-detail";
import {FieldError} from "../models/field-error";
import {translateErrorCode} from "./error-code-messages";

export const GENERIC_FALLBACK_MESSAGE = 'Une erreur est survenue, veuillez réessayer plus tard.';
const GENERIC_FIELD_ERROR_MESSAGE = 'Champ invalide.';

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
