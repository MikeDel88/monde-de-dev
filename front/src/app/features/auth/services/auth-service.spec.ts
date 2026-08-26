import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { AuthService } from './auth-service';
import {RegisterData} from "../models/register-data";

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const registerData: RegisterData = {
    name: 'John',
    email: 'john@example.com',
    password: 'Password1!',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return void on success', (done) => {
    service.register(registerData).subscribe({
      next: (value) => {
        expect(value).toBeFalsy();
        done();
      },
    });

    const req = httpMock.expectOne('http://localhost:9000/auth/register');
    expect(req.request.method).toBe('POST');
    req.flush(null, { status: 201, statusText: 'Created' });
  });

  it('should build a message from field errors on 400', (done) => {
    service.register(registerData).subscribe({
      error: (error: Error) => {
        expect(error.message).toBe('Email invalide, Mot de passe trop court');
        done();
      },
    });

    const req = httpMock.expectOne('http://localhost:9000/auth/register');
    req.flush(
      {
        status: 400,
        errors: [
          { field: 'email', message: 'Email invalide' },
          { field: 'password', message: 'Mot de passe trop court' },
        ],
      },
      { status: 400, statusText: 'Bad Request' }
    );
  });

  it('should return a dedicated message on 409', (done) => {
    service.register(registerData).subscribe({
      error: (error: Error) => {
        expect(error.message).toBe('Cet email ou ce nom est déjà utilisé');
        done();
      },
    });

    const req = httpMock.expectOne('http://localhost:9000/auth/register');
    req.flush({ status: 409 }, { status: 409, statusText: 'Conflict' });
  });

  it('should return a generic message on 500', (done) => {
    service.register(registerData).subscribe({
      error: (error: Error) => {
        expect(error.message).toBe('Une erreur est survenue, veuillez réessayer plus tard');
        done();
      },
    });

    const req = httpMock.expectOne('http://localhost:9000/auth/register');
    req.flush({ status: 500, detail: 'Internal server error' }, { status: 500, statusText: 'Internal Server Error' });
  });
});
