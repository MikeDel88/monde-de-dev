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

  const flushMicrotasks = () => new Promise((resolve) => setTimeout(resolve, 0));

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

  describe('profile (httpResource)', () => {
    it("should get once profile and return ProfileResponse", async () => {
      const MOCK_DATA = {email: "test@test.com", name: "test", topics: []};

      TestBed.tick();
      const req: TestRequest = httpMock.expectOne(`${environment.apiUrl}/profile`);

      expect(req.request.method).toBe('GET');
      req.flush(MOCK_DATA, { status: 200, statusText: "OK" });

      await flushMicrotasks();
      TestBed.tick();

      expect(service.profile.hasValue()).toBeTruthy();
      expect(service.profile.value()).toEqual(MOCK_DATA);
    });

    it('should expose the error when the profile request fails', async () => {
      TestBed.tick();
      const req = httpMock.expectOne(`${environment.apiUrl}/profile`);
      req.flush(null, { status: 500, statusText: 'Internal Server Error' });

      await flushMicrotasks();
      TestBed.tick();

      expect(service.profile.hasValue()).toBeFalsy();
      expect(service.profile.error()).toBeTruthy();
    });

    it('should re-fetch the profile when reload is called', async () => {
      const MOCK_DATA = {email: "test@test.com", name: "test", topics: []};

      TestBed.tick();
      httpMock.expectOne(`${environment.apiUrl}/profile`).flush(MOCK_DATA, { status: 200, statusText: "OK" });
      await flushMicrotasks();
      TestBed.tick();

      service.profile.reload();
      TestBed.tick();

      const reloadReq = httpMock.expectOne(`${environment.apiUrl}/profile`);
      expect(reloadReq.request.method).toBe('GET');
      reloadReq.flush(MOCK_DATA, { status: 200, statusText: "OK" });

      await flushMicrotasks();
      TestBed.tick();

      expect(service.profile.hasValue()).toBeTruthy();
    });

  });

  describe("updateProfile$", () => {
    it("should PATCH to /profile with email and name and return ProfileResponse when update successes", () => {
      const MOCK_DATA = {email: "test@test.com", name: "test", topics: []};
      let result: ProfileResponse | undefined;
      service
        .updateProfile$("test@test.com", "test")
        .subscribe((value => (result = value)));

      const req: TestRequest = httpMock.expectOne(`${environment.apiUrl}/profile`);

      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({email: "test@test.com", name: "test"});

      req.flush(MOCK_DATA, { status: 200, statusText: "OK" });

      expect(result).toEqual(MOCK_DATA)
    });

    it("should PATCH with a null field when only one of email/name is dirty", () => {
      service.updateProfile$(null, "test").subscribe();

      const req: TestRequest = httpMock.expectOne(`${environment.apiUrl}/profile`);

      expect(req.request.body).toEqual({email: null, name: "test"});

      req.flush({email: "test@test.com", name: "test", topics: []}, { status: 200, statusText: "OK" });
    });

    it("should propagate the error when the update fails", () => {
      let error: unknown;
      service
        .updateProfile$("test@test.com", "test")
        .subscribe({error: (err) => (error = err)});

      const req: TestRequest = httpMock.expectOne(`${environment.apiUrl}/profile`);
      req.flush(null, { status: 500, statusText: 'Internal Server Error' });

      expect(error).toBeTruthy();
    });
  });

  describe("updatePassword$", () => {
    it("should PATCH to profile/password with newPassword and currentPassword", () => {
      service
        .updatePassword$("Password2!", "Password1!")
        .subscribe();

      const req: TestRequest = httpMock.expectOne(`${environment.apiUrl}/profile/password`);

      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({newPassword: "Password2!", currentPassword: "Password1!"});

      req.flush(null, { status: 200, statusText: "OK" });
    });

    it("should propagate the error when the password update fails", () => {
      let error: unknown;
      service
        .updatePassword$("Password2!", "Password1!")
        .subscribe({error: (err) => (error = err)});

      const req: TestRequest = httpMock.expectOne(`${environment.apiUrl}/profile/password`);
      req.flush(null, { status: 500, statusText: 'Internal Server Error' });

      expect(error).toBeTruthy();
    });
  });

});

