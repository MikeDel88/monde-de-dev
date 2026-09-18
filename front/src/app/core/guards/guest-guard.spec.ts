import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { describe, beforeEach, expect, it } from '@jest/globals';

import { guestGuard } from './guest-guard';
import { SessionService } from '../services/session-service';

describe('guestGuard', () => {
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
    return TestBed.runInInjectionContext(() => guestGuard(null as never, null as never));
  }

  it('should allow activation when the user is not authenticated', () => {
    expect(canActivate()).toBe(true);
  });

  it('should redirect to /feed when the user is authenticated', () => {
    sessionService.logIn();

    expect(canActivate()).toEqual(router.parseUrl('/feed'));
  });
});
