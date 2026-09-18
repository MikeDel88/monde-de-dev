import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

import { createErrorState } from './error-state';
import { AppError } from '../../core/models/app-error';

describe('createErrorState', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should start with no message and not visible', () => {
    const state = createErrorState();

    expect(state.message()).toBeUndefined();
    expect(state.visible()).toBe(false);
  });

  it('should set the message and become visible from an AppError', () => {
    const state = createErrorState();

    state.setFromError(new AppError('Une erreur', 500));

    expect(state.message()).toBe('Une erreur');
    expect(state.visible()).toBe(true);
  });

  it('should hide itself automatically after the auto-close delay', () => {
    const state = createErrorState(5000);
    state.setFromError(new AppError('Une erreur', 500));

    jest.advanceTimersByTime(5000);

    expect(state.visible()).toBe(false);
    expect(state.message()).toBe('Une erreur');
  });

  it('should not hide before the auto-close delay has elapsed', () => {
    const state = createErrorState(5000);
    state.setFromError(new AppError('Une erreur', 500));

    jest.advanceTimersByTime(4999);

    expect(state.visible()).toBe(true);
  });

  it('should hide immediately when cleared manually', () => {
    const state = createErrorState(5000);
    state.setFromError(new AppError('Une erreur', 500));

    state.clear();

    expect(state.visible()).toBe(false);
  });

  it('should not fire a stale auto-close after being cleared manually', () => {
    const state = createErrorState(5000);
    state.setFromError(new AppError('Une erreur', 500));
    state.clear();

    state.setFromError(new AppError('Nouvelle erreur', 500));
    jest.advanceTimersByTime(5000);

    expect(state.visible()).toBe(false);
    expect(state.message()).toBe('Nouvelle erreur');
  });

  it('should restart the auto-close timer when a new error occurs', () => {
    const state = createErrorState(5000);
    state.setFromError(new AppError('Première erreur', 500));

    jest.advanceTimersByTime(4000);
    state.setFromError(new AppError('Deuxième erreur', 500));
    jest.advanceTimersByTime(4000);

    expect(state.visible()).toBe(true);
    expect(state.message()).toBe('Deuxième erreur');
  });
});
