import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

import { ErrorToastService } from './error-toast-service';
import { AppError } from '../models/app-error';

describe('ErrorToastService', () => {
  let service: ErrorToastService;

  beforeEach(() => {
    jest.useFakeTimers();
    TestBed.configureTestingModule({});
    service = TestBed.inject(ErrorToastService);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should start with no message and not visible', () => {
    expect(service.message()).toBeUndefined();
    expect(service.visible()).toBe(false);
  });

  it('should show the error message from an AppError', () => {
    service.showError(new AppError('Une erreur', 500));

    expect(service.message()).toBe('Une erreur');
    expect(service.visible()).toBe(true);
  });

  it('should hide itself automatically after the auto-close delay', () => {
    service.showError(new AppError('Une erreur', 500));

    jest.advanceTimersByTime(5000);

    expect(service.visible()).toBe(false);
  });

  it('should hide immediately when cleared manually', () => {
    service.showError(new AppError('Une erreur', 500));

    service.clear();

    expect(service.visible()).toBe(false);
  });
});
