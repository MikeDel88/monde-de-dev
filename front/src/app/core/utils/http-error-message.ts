import {HttpErrorResponse} from "@angular/common/http";
import {ApiProblemDetail} from "../models/api-problem-detail";
import {FieldError} from "../models/field-error";

export const GENERIC_FALLBACK_MESSAGE = 'Une erreur est survenue, veuillez réessayer plus tard.';

export function mapHttpErrorToMessage(err: HttpErrorResponse): string {
  const body = err.error as ApiProblemDetail | null;

  switch (err.status) {
    case 400:
      return body?.errors?.map((e: FieldError) => e.message).join(', ') ?? body?.detail ?? 'Formulaire invalide';
    case 401:
      return "Session expirée ou identifiants invalides.";
    case 403:
      return "Vous n'avez pas les droits nécessaires pour effectuer cette action.";
    case 404:
      return "La ressource demandée n'existe pas ou plus.";
    case 409:
      return body?.detail ?? "Un conflit est survenu.";
    case 429:
      return body?.detail ?? "Trop de tentatives, réessayer plus tard.";
    default:
      return body?.detail ?? GENERIC_FALLBACK_MESSAGE;
  }
}
