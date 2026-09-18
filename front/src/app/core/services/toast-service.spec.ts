import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

import { ToastService } from './toast-service';
import { AppError } from '../models/app-error';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    jest.useFakeTimers();
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should start with no message and not visible', () => {
    expect(service.message()).toBeUndefined();
    expect(service.visible()).toBe(false);
  });

  it('should show a success toast that auto-closes after 2s', () => {
    service.showSuccess('Sauvegardé');

    expect(service.message()).toBe('Sauvegardé');
    expect(service.type()).toBe('success');
    expect(service.visible()).toBe(true);

    jest.advanceTimersByTime(2000);
    expect(service.visible()).toBe(false);
  });

  it('should show an error toast from an AppError that auto-closes after 5s', () => {
    service.showError(new AppError('Une erreur', 500));

    expect(service.message()).toBe('Une erreur');
    expect(service.type()).toBe('error');
    expect(service.visible()).toBe(true);

    jest.advanceTimersByTime(4999);
    expect(service.visible()).toBe(true);
    jest.advanceTimersByTime(1);
    expect(service.visible()).toBe(false);
  });

  it('should show a warning toast that auto-closes after 4s', () => {
    service.showWarning('Attention');

    expect(service.message()).toBe('Attention');
    expect(service.type()).toBe('warning');
    expect(service.visible()).toBe(true);

    jest.advanceTimersByTime(4000);
    expect(service.visible()).toBe(false);
  });

  it('should hide immediately when cleared manually', () => {
    service.showError(new AppError('Une erreur', 500));

    service.clear();

    expect(service.visible()).toBe(false);
  });
});
