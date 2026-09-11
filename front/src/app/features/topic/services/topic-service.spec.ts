import { TestBed } from '@angular/core/testing';

import { TopicService } from './topic-service';
import { describe, beforeEach, afterEach, expect, it } from "@jest/globals";
import { HttpTestingController, provideHttpClientTesting, TestRequest } from "@angular/common/http/testing";
import { provideHttpClient } from "@angular/common/http";
import { environment } from "../../../../environments/environment";
import { Topic } from "../models/topic";

describe('TopicService', () => {
  let service: TopicService;
  let httpMock: HttpTestingController;

  const flushMicrotasks = () => new Promise((resolve) => setTimeout(resolve, 0));

  const MOCK_TOPICS: Topic[] = [
    { id: 1, title: "Topic 1", description: "Topic 1", subscribed: true },
    { id: 2, title: "Topic 2", description: "Topic 2", subscribed: false },
  ];

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

  describe('topics (httpResource)', () => {
    it("should get once topics and return Topic[]", async () => {
      TestBed.tick();
      const req: TestRequest = httpMock.expectOne(`${environment.apiUrl}/topics`);

      expect(req.request.method).toBe('GET');
      req.flush(MOCK_TOPICS, { status: 200, statusText: "OK" });

      await flushMicrotasks();
      TestBed.tick();

      expect(service.topics.hasValue()).toBeTruthy();
      expect(service.topics.value()).toEqual(MOCK_TOPICS);
    });

    it('should expose the error when the topics request fails', async () => {
      TestBed.tick();
      const req = httpMock.expectOne(`${environment.apiUrl}/topics`);
      req.flush(null, { status: 500, statusText: 'Internal Server Error' });

      await flushMicrotasks();
      TestBed.tick();

      expect(service.topics.hasValue()).toBeFalsy();
      expect(service.topics.error()).toBeTruthy();
    });

    it('should re-fetch the topics when reload is called', async () => {
      TestBed.tick();
      httpMock
        .expectOne(`${environment.apiUrl}/topics`)
        .flush(MOCK_TOPICS, { status: 200, statusText: "OK" });
      await flushMicrotasks();
      TestBed.tick();

      service.topics.reload();
      TestBed.tick();

      const reloadReq = httpMock.expectOne(`${environment.apiUrl}/topics`);
      expect(reloadReq.request.method).toBe('GET');
      reloadReq.flush(MOCK_TOPICS, { status: 200, statusText: "OK" });

      await flushMicrotasks();
      TestBed.tick();

      expect(service.topics.hasValue()).toBeTruthy();
    });
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
