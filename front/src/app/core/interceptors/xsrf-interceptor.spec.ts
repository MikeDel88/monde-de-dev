import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { xsrfInterceptor } from './xsrf-interceptor';

describe('xsrfInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([xsrfInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    document.cookie = 'XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  });

  it('should attach the X-XSRF-TOKEN header from the cookie on mutating requests', () => {
    document.cookie = 'XSRF-TOKEN=some-token-value';

    httpClient.post('http://localhost:9000/api/v1/auth/login', {}).subscribe();

    const req = httpMock.expectOne('http://localhost:9000/api/v1/auth/login');
    expect(req.request.headers.get('X-XSRF-TOKEN')).toBe('some-token-value');
  });

  it('should not attach the header on GET requests', () => {
    document.cookie = 'XSRF-TOKEN=some-token-value';

    httpClient.get('http://localhost:9000/api/v1/profile').subscribe();

    const req = httpMock.expectOne('http://localhost:9000/api/v1/profile');
    expect(req.request.headers.has('X-XSRF-TOKEN')).toBe(false);
  });

  it('should not attach the header when no cookie is present', () => {
    httpClient.post('http://localhost:9000/api/v1/auth/login', {}).subscribe();

    const req = httpMock.expectOne('http://localhost:9000/api/v1/auth/login');
    expect(req.request.headers.has('X-XSRF-TOKEN')).toBe(false);
  });
});
