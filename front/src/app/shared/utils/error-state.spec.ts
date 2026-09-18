import { describe, it, expect } from '@jest/globals';

import { createErrorState } from './error-state';
import { AppError } from '../../core/models/app-error';

describe('createErrorState', () => {
  it('should start with no error', () => {
    const state = createErrorState();

    expect(state.error()).toBeUndefined();
  });

  it('should set the error message from an AppError', () => {
    const state = createErrorState();

    state.setFromError(new AppError('Une erreur', 500));

    expect(state.error()).toBe('Une erreur');
  });

  it('should clear the error message', () => {
    const state = createErrorState();
    state.setFromError(new AppError('Une erreur', 500));

    state.clear();

    expect(state.error()).toBeUndefined();
  });
});
