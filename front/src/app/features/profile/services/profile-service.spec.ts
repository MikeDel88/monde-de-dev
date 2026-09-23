import { TestBed } from '@angular/core/testing';

import { ProfileService } from './profile-service';
import {describe, beforeEach, expect, it, afterEach} from "@jest/globals";
import {HttpTestingController, provideHttpClientTesting, TestRequest} from "@angular/common/http/testing";
import {provideHttpClient} from "@angular/common/http";
import {environment} from "../../../../environments/environment";
import {ProfileResponse} from "../models/profile-response";

describe('ProfileService', () => {
  let service: ProfileService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(ProfileService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe("updateProfile$", () => {
    it("should PATCH to /profile with email, name, password and currentPassword and return ProfileResponse when update successes", () => {
      const MOCK_DATA = {email: "test@test.com", name: "test", topics: []};
      let result: ProfileResponse | undefined;
      service
        .updateProfile$("test@test.com", "test", "Password2!", "Password1!")
        .subscribe((value => (result = value)));

      const req: TestRequest = httpMock.expectOne(`${environment.apiUrl}/profile`);

      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({email: "test@test.com", name: "test", password: "Password2!", currentPassword: "Password1!"});

      req.flush(MOCK_DATA, { status: 200, statusText: "OK" });

      expect(result).toEqual(MOCK_DATA)
    });

    it("should PATCH with a null field when only one of email/name/password is dirty", () => {
      service.updateProfile$(null, "test", null, "Password1!").subscribe();

      const req: TestRequest = httpMock.expectOne(`${environment.apiUrl}/profile`);

      expect(req.request.body).toEqual({email: null, name: "test", password: null, currentPassword: "Password1!"});

      req.flush({email: "test@test.com", name: "test", topics: []}, { status: 200, statusText: "OK" });
    });

    it("should propagate the error when the update fails", () => {
      let error: unknown;
      service
        .updateProfile$("test@test.com", "test", null, "Password1!")
        .subscribe({error: (err) => (error = err)});

      const req: TestRequest = httpMock.expectOne(`${environment.apiUrl}/profile`);
      req.flush(null, { status: 500, statusText: 'Internal Server Error' });

      expect(error).toBeTruthy();
    });
  });

});

