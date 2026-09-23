import { describe, expect, it } from '@jest/globals';
import { ERROR_CODE_MESSAGES, translateErrorCode } from './error-code-messages';

describe('translateErrorCode', () => {
  it('translates a known backend code to a French message', () => {
    expect(translateErrorCode('PASSWORD_TOO_SHORT')).toBe('Le mot de passe doit contenir au moins 8 caractères.');
  });

  it('returns undefined for an unknown code', () => {
    expect(translateErrorCode('SOME_UNKNOWN_CODE')).toBeUndefined();
  });

  it('returns undefined when no code is given', () => {
    expect(translateErrorCode(undefined)).toBeUndefined();
  });

  it('has no empty message in the dictionary', () => {
    Object.values(ERROR_CODE_MESSAGES).forEach((message) => {
      expect(message.trim().length).toBeGreaterThan(0);
    });
  });
});
