import { TestBed } from '@angular/core/testing';

import { TopicService } from './topic-service';
import { describe, beforeEach, afterEach, expect, it } from "@jest/globals";
import { HttpTestingController, provideHttpClientTesting, TestRequest } from "@angular/common/http/testing";
import { provideHttpClient } from "@angular/common/http";
import { environment } from "../../../../environments/environment";

describe('TopicService', () => {
  let service: TopicService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(TopicService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe("subscribe$", () => {
    it("should POST to /topics/subscribe with topicId", () => {
      let completed = false;
      service.subscribe$(1).subscribe({ complete: () => (completed = true) });

      const req: TestRequest = httpMock.expectOne(`${environment.apiUrl}/topics/subscribe`);

      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ topicId: 1 });

      req.flush(null, { status: 204, statusText: "No Content" });

      expect(completed).toBeTruthy();
    });

    it("should propagate the error when the subscribe request fails", () => {
      let error: unknown;
      service.subscribe$(1).subscribe({ error: (err) => (error = err) });

      const req: TestRequest = httpMock.expectOne(`${environment.apiUrl}/topics/subscribe`);
      req.flush(null, { status: 500, statusText: 'Internal Server Error' });

      expect(error).toBeTruthy();
    });
  });

  describe("unsubscribe$", () => {
    it("should DELETE to /topics/:id/subscribe", () => {
      let completed = false;
      service.unsubscribe$(1).subscribe({ complete: () => (completed = true) });

      const req: TestRequest = httpMock.expectOne(`${environment.apiUrl}/topics/1/subscribe`);

      expect(req.request.method).toBe('DELETE');

      req.flush(null, { status: 204, statusText: "No Content" });

      expect(completed).toBeTruthy();
    });

    it("should propagate the error when the unsubscribe request fails", () => {
      let error: unknown;
      service.unsubscribe$(1).subscribe({ error: (err) => (error = err) });

      const req: TestRequest = httpMock.expectOne(`${environment.apiUrl}/topics/1/subscribe`);
      req.flush(null, { status: 500, statusText: 'Internal Server Error' });

      expect(error).toBeTruthy();
    });
  });
});
