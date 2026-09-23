import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { SessionService } from './session-service';

describe('SessionService', () => {
  let service: SessionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SessionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should not be authenticated by default', () => {
    expect(service.isAuthenticated).toBe(false);
  });

  it('should become authenticated on logIn', () => {
    service.logIn();

    expect(service.isAuthenticated).toBe(true);
  });

  it('should become unauthenticated on logOut', () => {
    service.logIn();

    service.logOut();

    expect(service.isAuthenticated).toBe(false);
  });
});
