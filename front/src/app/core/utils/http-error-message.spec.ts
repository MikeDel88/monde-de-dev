import { describe, expect, it } from '@jest/globals';
import { HttpErrorResponse } from '@angular/common/http';
import { GENERIC_FALLBACK_MESSAGE, mapHttpErrorToMessage } from './http-error-message';

function errorOf(status: number, error: unknown = null): HttpErrorResponse {
  return new HttpErrorResponse({ status, error });
}

describe('mapHttpErrorToMessage', () => {
  it('joins field errors on 400', () => {
    const err = errorOf(400, { errors: [{ field: 'email', message: 'Email invalide' }, { field: 'password', message: 'Mot de passe trop court' }] });
    expect(mapHttpErrorToMessage(err)).toBe('Email invalide, Mot de passe trop court');
  });

  it('falls back to detail on 400 with no field errors', () => {
    const err = errorOf(400, { detail: 'Requête invalide' });
    expect(mapHttpErrorToMessage(err)).toBe('Requête invalide');
  });

  it('falls back to a default message on 400 with no field errors nor detail', () => {
    const err = errorOf(400, {});
    expect(mapHttpErrorToMessage(err)).toBe('Formulaire invalide');
  });

  it('maps 401', () => {
    expect(mapHttpErrorToMessage(errorOf(401))).toBe('Session expirée ou identifiants invalides.');
  });

  it('maps 403', () => {
    expect(mapHttpErrorToMessage(errorOf(403))).toBe("Vous n'avez pas les droits nécessaires pour effectuer cette action.");
  });

  it('maps 404', () => {
    expect(mapHttpErrorToMessage(errorOf(404))).toBe('La ressource demandée n\'existe pas ou plus.');
  });

  it('uses detail on 409 when present', () => {
    const err = errorOf(409, { detail: "L'utilisateur existe déjà" });
    expect(mapHttpErrorToMessage(err)).toBe("L'utilisateur existe déjà");
  });

  it('falls back to a default message on 409 with no detail', () => {
    expect(mapHttpErrorToMessage(errorOf(409))).toBe('Un conflit est survenu.');
  });

  it('falls back to the generic message on 500', () => {
    expect(mapHttpErrorToMessage(errorOf(500))).toBe(GENERIC_FALLBACK_MESSAGE);
  });

  it('falls back to the generic message on a network error (status 0)', () => {
    expect(mapHttpErrorToMessage(errorOf(0))).toBe(GENERIC_FALLBACK_MESSAGE);
  });

  it('falls back to the generic message on an unmapped status', () => {
    expect(mapHttpErrorToMessage(errorOf(418))).toBe(GENERIC_FALLBACK_MESSAGE);
  });
});
