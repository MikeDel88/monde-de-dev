import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';

import { SessionService } from './session-service';

describe('SessionService', () => {
  let service: SessionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    service = TestBed.inject(SessionService);

    expect(service).toBeTruthy();
  });

  it('should not be authenticated and have no token by default', () => {
    service = TestBed.inject(SessionService);

    expect(service.isAuthenticated).toBe(false);
    expect(service.getToken()).toBeNull();
  });

  it('should start as authenticated when a token already exists in localStorage', () => {
    localStorage.setItem('token', 'existing-token');

    service = TestBed.inject(SessionService);

    expect(service.isAuthenticated).toBe(true);
    expect(service.getToken()).toBe('existing-token');
  });

  it('should persist the token and become authenticated on logIn', () => {
    service = TestBed.inject(SessionService);

    service.logIn('abc');

    expect(service.getToken()).toBe('abc');
    expect(localStorage.getItem('token')).toBe('abc');
    expect(service.isAuthenticated).toBe(true);
  });

  it('should remove the token and become unauthenticated on logOut', () => {
    service = TestBed.inject(SessionService);
    service.logIn('abc');

    service.logOut();

    expect(service.getToken()).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
    expect(service.isAuthenticated).toBe(false);
  });
});
