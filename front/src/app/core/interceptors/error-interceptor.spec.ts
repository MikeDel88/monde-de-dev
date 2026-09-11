import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';

import { errorInterceptor } from './error-interceptor';
import { SessionService } from '../services/session-service';

describe('errorInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let sessionService: SessionService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SessionService,
        { provide: Router, useValue: { navigateByUrl: jest.fn() } },
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    sessionService = TestBed.inject(SessionService);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should log out and redirect to /login on a 401 while a token exists', () => {
    sessionService.logIn('abc');
    const logOutSpy = jest.spyOn(sessionService, 'logOut');
    const onError = jest.fn();

    httpClient.get('/api/test').subscribe({ error: onError });

    httpMock.expectOne('/api/test').flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(logOutSpy).toHaveBeenCalled();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/login');
    expect(onError).toHaveBeenCalled();
  });

  it('should not log out nor redirect on a 401 when there is no token', () => {
    const logOutSpy = jest.spyOn(sessionService, 'logOut');
    const onError = jest.fn();

    httpClient.get('/api/test').subscribe({ error: onError });

    httpMock.expectOne('/api/test').flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(logOutSpy).not.toHaveBeenCalled();
    expect(router.navigateByUrl).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalled();
  });

  it('should not log out nor redirect on a non-401 error', () => {
    sessionService.logIn('abc');
    const logOutSpy = jest.spyOn(sessionService, 'logOut');
    const onError = jest.fn();

    httpClient.get('/api/test').subscribe({ error: onError });

    httpMock.expectOne('/api/test').flush(null, { status: 500, statusText: 'Internal Server Error' });

    expect(logOutSpy).not.toHaveBeenCalled();
    expect(router.navigateByUrl).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalled();
  });
});
