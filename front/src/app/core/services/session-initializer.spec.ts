import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { initSession } from './session-initializer';
import { SessionService } from './session-service';
import { environment } from '../../../environments/environment';

describe('initSession', () => {
  let httpMock: HttpTestingController;
  let sessionService: SessionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SessionService, provideHttpClient(), provideHttpClientTesting()],
    });

    httpMock = TestBed.inject(HttpTestingController);
    sessionService = TestBed.inject(SessionService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should mark the session as authenticated when /profile succeeds', () => {
    TestBed.runInInjectionContext(() => initSession()).subscribe();

    httpMock.expectOne(`${environment.apiUrl}/profile`).flush({ name: 'john', email: 'john@test.com', topics: [] });

    expect(sessionService.isAuthenticated).toBe(true);
  });

  it('should leave the session unauthenticated when /profile fails', () => {
    TestBed.runInInjectionContext(() => initSession()).subscribe();

    httpMock.expectOne(`${environment.apiUrl}/profile`).flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(sessionService.isAuthenticated).toBe(false);
  });
});
