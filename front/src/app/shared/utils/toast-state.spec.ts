import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

import { createToastState } from './toast-state';

describe('createToastState', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should start with no message, not visible, and the "success" type', () => {
    const state = createToastState();

    expect(state.message()).toBeUndefined();
    expect(state.visible()).toBe(false);
    expect(state.type()).toBe('success');
  });

  it('should show the message with the given type', () => {
    const state = createToastState();

    state.show('Une erreur', 'error', 5000);

    expect(state.message()).toBe('Une erreur');
    expect(state.type()).toBe('error');
    expect(state.visible()).toBe(true);
  });

  it('should hide itself automatically after the given auto-close delay', () => {
    const state = createToastState();
    state.show('Sauvegardé', 'success', 2000);

    jest.advanceTimersByTime(2000);

    expect(state.visible()).toBe(false);
  });

  it('should not hide before the auto-close delay has elapsed', () => {
    const state = createToastState();
    state.show('Sauvegardé', 'success', 2000);

    jest.advanceTimersByTime(1999);

    expect(state.visible()).toBe(true);
  });

  it('should hide immediately when cleared manually', () => {
    const state = createToastState();
    state.show('Une erreur', 'error', 5000);

    state.clear();

    expect(state.visible()).toBe(false);
  });

  it('should restart the auto-close timer and switch type when a new toast is shown', () => {
    const state = createToastState();
    state.show('Une erreur', 'error', 5000);

    jest.advanceTimersByTime(4000);
    state.show('Sauvegardé', 'success', 2000);
    jest.advanceTimersByTime(1999);

    expect(state.visible()).toBe(true);
    expect(state.type()).toBe('success');
    expect(state.message()).toBe('Sauvegardé');

    jest.advanceTimersByTime(1);
    expect(state.visible()).toBe(false);
  });
});
