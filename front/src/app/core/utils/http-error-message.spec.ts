import { describe, expect, it } from '@jest/globals';
import { HttpErrorResponse } from '@angular/common/http';
import { GENERIC_FALLBACK_MESSAGE, mapHttpErrorToMessage } from './http-error-message';

function errorOf(status: number, error: unknown = null): HttpErrorResponse {
  return new HttpErrorResponse({ status, error });
}

describe('mapHttpErrorToMessage', () => {
  it('joins translated field errors on 400 (real backend shape: field + code)', () => {
    const err = errorOf(400, { errors: [{ field: 'email', code: 'EMAIL_INVALID' }, { field: 'password', code: 'PASSWORD_TOO_SHORT' }] });
    expect(mapHttpErrorToMessage(err)).toBe("L'email est invalide., Le mot de passe doit contenir au moins 8 caractères.");
  });

  it('falls back to a generic field message on 400 for an unknown field error code', () => {
    const err = errorOf(400, { errors: [{ field: 'email', code: 'SOME_UNKNOWN_CODE' }] });
    expect(mapHttpErrorToMessage(err)).toBe('Champ invalide.');
  });

  it('translates detail on 400 with no field errors', () => {
    const err = errorOf(400, { detail: 'MALFORMED_JSON' });
    expect(mapHttpErrorToMessage(err)).toBe('La requête envoyée est invalide.');
  });

  it('falls back to a default message on 400 with no field errors nor a translatable detail', () => {
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

  it('translates detail on 409 when it is a known backend code', () => {
    const err = errorOf(409, { detail: 'DATA_CONFLICT' });
    expect(mapHttpErrorToMessage(err)).toBe('Un conflit est survenu.');
  });

  it('falls back to a default message on 409 with no detail', () => {
    expect(mapHttpErrorToMessage(errorOf(409))).toBe('Un conflit est survenu.');
  });

  it('falls back to the generic message on 500 with an untranslatable detail', () => {
    const err = errorOf(500, { detail: 'some-unexpected-detail' });
    expect(mapHttpErrorToMessage(err)).toBe(GENERIC_FALLBACK_MESSAGE);
  });

  it('translates the generic INTERNAL_SERVER_ERROR detail on 500', () => {
    const err = errorOf(500, { detail: 'INTERNAL_SERVER_ERROR' });
    expect(mapHttpErrorToMessage(err)).toBe(GENERIC_FALLBACK_MESSAGE);
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
