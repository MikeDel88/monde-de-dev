import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { describe, beforeEach, afterEach, expect, it } from '@jest/globals';

import { AuthGuard } from './auth-guard';
import { SessionService } from '../services/session-service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let sessionService: SessionService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    });

    guard = TestBed.inject(AuthGuard);
    sessionService = TestBed.inject(SessionService);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should allow activation when the user is authenticated', () => {
    sessionService.logIn('token');

    expect(guard.canActivate()).toBe(true);
  });

  it('should redirect to /login when the user is not authenticated', () => {
    expect(guard.canActivate()).toEqual(router.parseUrl('/login'));
  });
});
