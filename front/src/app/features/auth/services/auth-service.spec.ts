import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';

import { AuthService } from './auth-service';
import {RegisterData} from "../models/register-data";
import {environment} from "../../../../environments/environment";
import {errorInterceptor} from "../../../core/interceptors/error-interceptor";
import {SessionService} from "../../../core/services/session-service";

describe('AuthService', () => {
  let service: AuthService;
  let sessionService: SessionService;
  let httpMock: HttpTestingController;

  const registerData: RegisterData = {
    name: 'John',
    email: 'john@example.com',
    password: 'Password1!',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SessionService,
        { provide: Router, useValue: { navigateByUrl: jest.fn() } },
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(AuthService);
    sessionService = TestBed.inject(SessionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return void on success', (done) => {
    service.register$(registerData).subscribe({
      next: (value) => {
        expect(value).toBeNull();
        done();
      },
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
    expect(req.request.method).toBe('POST');
    req.flush(null, { status: 201, statusText: 'Created' });
  });

  it('should build a translated message from field errors on 400 (real backend shape: field + code)', (done) => {
    service.register$(registerData).subscribe({
      error: (error: Error) => {
        expect(error.message).toBe("L'email est invalide., Le mot de passe doit contenir au moins 8 caractères.");
        done();
      },
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
    req.flush(
      {
        status: 400,
        errors: [
          { field: 'email', code: 'EMAIL_INVALID' },
          { field: 'password', code: 'PASSWORD_TOO_SHORT' },
        ],
      },
      { status: 400, statusText: 'Bad Request' }
    );
  });

  it('should return a dedicated message on 409', (done) => {
    service.register$(registerData).subscribe({
      error: (error: Error) => {
        expect(error.message).toBe('Un conflit est survenu.');
        done();
      },
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
    req.flush({ status: 409 }, { status: 409, statusText: 'Conflict' });
  });

  it('should translate the server-provided detail code on 500 when known', (done) => {
    service.register$(registerData).subscribe({
      error: (error: Error) => {
        expect(error.message).toBe('Une erreur est survenue, veuillez réessayer plus tard.');
        done();
      },
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
    req.flush({ status: 500, detail: 'INTERNAL_SERVER_ERROR' }, { status: 500, statusText: 'Internal Server Error' });
  });

  it('should fall back to the generic message on 500 when the detail is not a known code', (done) => {
    service.register$(registerData).subscribe({
      error: (error: Error) => {
        expect(error.message).toBe('Une erreur est survenue, veuillez réessayer plus tard.');
        done();
      },
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
    req.flush({ status: 500, detail: 'some-unexpected-detail' }, { status: 500, statusText: 'Internal Server Error' });
  });

  it('should return the generic fallback message when no detail is available', (done) => {
    service.register$(registerData).subscribe({
      error: (error: Error) => {
        expect(error.message).toBe('Une erreur est survenue, veuillez réessayer plus tard.');
        done();
      },
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
    req.flush(null, { status: 500, statusText: 'Internal Server Error' });
  });

  it('should clear the session even when logout fails', () => {
    sessionService.logIn();
    const onError = jest.fn();

    service.logout$().subscribe({ error: onError });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/logout`);
    req.flush(null, { status: 500, statusText: 'Internal Server Error' });

    expect(onError).toHaveBeenCalled();
    expect(sessionService.isAuthenticated).toBe(false);
  });
});
