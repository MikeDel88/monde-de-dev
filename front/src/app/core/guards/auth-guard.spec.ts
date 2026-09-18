import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { describe, beforeEach, expect, it } from '@jest/globals';

import { authGuard } from './auth-guard';
import { SessionService } from '../services/session-service';

describe('authGuard', () => {
  let sessionService: SessionService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    });

    sessionService = TestBed.inject(SessionService);
    router = TestBed.inject(Router);
  });

  function canActivate() {
    return TestBed.runInInjectionContext(() => authGuard(null as never, null as never));
  }

  it('should allow activation when the user is authenticated', () => {
    sessionService.logIn();

    expect(canActivate()).toBe(true);
  });

  it('should redirect to /login when the user is not authenticated', () => {
    expect(canActivate()).toEqual(router.parseUrl('/login'));
  });
});
