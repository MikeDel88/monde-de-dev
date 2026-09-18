import { ComponentFixture, TestBed } from '@angular/core/testing';

import {describe, it, expect, beforeEach, afterEach, jest} from "@jest/globals";
import {throwError} from "rxjs";
import {HttpTestingController, provideHttpClientTesting} from "@angular/common/http/testing";
import {provideHttpClient} from "@angular/common/http";
import {TopicService} from "../services/topic-service";
import {Topic as TopicModel} from "../models/topic";
import {Topic} from "./topic";
import {By} from "@angular/platform-browser";
import {TopicCard} from "../../../shared/components/topic-card/topic-card";
import {environment} from "../../../../environments/environment";
import {ErrorToastService} from "../../../core/services/error-toast-service";

const MOCK_TOPICS: TopicModel[] = [
  { id: 1, title: "Topic 1", description: "Topic 1", subscribed: true },
  { id: 2, title: "Topic 2", description: "Topic 2", subscribed: false },
]

const flushMicrotasks = () => new Promise((resolve) => setTimeout(resolve, 0));

/**
 * Plan de test
 * Vérifie que la liste s'affiche bien
 * Vérifie que le click sur subscribe fonctionne bien.
 */
describe('Topic', () => {
  let component: Topic;
  let fixture: ComponentFixture<Topic>;

  const mockTopicService = {
    path: `${environment.apiUrl}/topics`,
    subscribe$: jest.fn(),
  }

  describe("Unit Test", () => {
    let httpMock: HttpTestingController;

    beforeEach(async () => {
      mockTopicService.subscribe$.mockReset();

      await TestBed.configureTestingModule({
        imports: [Topic],
        providers: [
          { provide: TopicService, useValue: mockTopicService },
          provideHttpClient(),
          provideHttpClientTesting(),
        ]
      })
      .compileComponents();

      fixture = TestBed.createComponent(Topic);
      component = fixture.componentInstance;
      fixture.detectChanges();

      httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
      httpMock.verify();
    });

    it('should create', () => {
      expect(component).toBeTruthy();

      httpMock.expectOne(`${environment.apiUrl}/topics`).flush(MOCK_TOPICS);
    });

    it("should display topic card with size 2", async () => {
      httpMock.expectOne(`${environment.apiUrl}/topics`).flush(MOCK_TOPICS);
      await flushMicrotasks();
      fixture.detectChanges();

      const topicsCard = fixture.nativeElement.querySelectorAll('app-topic-card');
      expect(topicsCard.length).toEqual(2);
    });

    it("should display loader when topics are loading", () => {
      const loader = fixture.nativeElement.querySelector('app-loader');
      expect(loader).toBeTruthy();

      httpMock.expectOne(`${environment.apiUrl}/topics`).flush(MOCK_TOPICS);
    });

    it("should display error when topics are not loaded", async () => {
      httpMock.expectOne(`${environment.apiUrl}/topics`).flush(null, { status: 500, statusText: 'Internal Server Error' });
      await flushMicrotasks();
      fixture.detectChanges();

      const error = fixture.nativeElement.querySelector('app-error');
      expect(error).toBeTruthy();
    });

    it("should not display any topic card when there are none", async () => {
      httpMock.expectOne(`${environment.apiUrl}/topics`).flush([]);
      await flushMicrotasks();
      fixture.detectChanges();

      const topicCard = fixture.debugElement.query(By.directive(TopicCard));
      expect(topicCard).toBeFalsy();
    });

    it("should report the error to ErrorToastService when subscribe$ fails", async () => {
      httpMock.expectOne(`${environment.apiUrl}/topics`).flush(MOCK_TOPICS);
      await flushMicrotasks();
      fixture.detectChanges();

      const errorToastService = TestBed.inject(ErrorToastService);
      mockTopicService.subscribe$.mockReturnValue(throwError(() => new Error('fail')));

      component.onSubscribe(MOCK_TOPICS[1].id);
      fixture.detectChanges();

      expect(errorToastService.message()).toBe('fail');
      expect(errorToastService.visible()).toBe(true);
    });
  });

  describe("Integration Test (Component + TopicService + HttpClientTesting)", () => {
    let httpMock: HttpTestingController;

    beforeEach(async () => {
      TestBed.resetTestingModule();

      await TestBed.configureTestingModule({
        imports: [Topic],
        providers: [
          provideHttpClient(),
          provideHttpClientTesting(),
        ]
      }).compileComponents();

      fixture = TestBed.createComponent(Topic);
      component = fixture.componentInstance;
      fixture.detectChanges();

      httpMock = TestBed.inject(HttpTestingController);
      httpMock.expectOne(`${environment.apiUrl}/topics`).flush(MOCK_TOPICS);
      await flushMicrotasks();
      fixture.detectChanges();
    });

    afterEach(() => {
      httpMock.verify();
    });

    it("should call POST /topics/subscribe and reload the topics on subscribe", async () => {
      const unsubscribedCardButton = fixture.debugElement.queryAll(By.css('app-topic-card button'))[1];
      unsubscribedCardButton.nativeElement.click();

      const req = httpMock.expectOne({ url: `${environment.apiUrl}/topics/subscribe` });
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ topicId: MOCK_TOPICS[1].id });
      req.flush(null, { status: 204, statusText: 'No Content' });
      await flushMicrotasks();
      fixture.detectChanges();

      const reloadReq = httpMock.expectOne(`${environment.apiUrl}/topics`);
      reloadReq.flush([MOCK_TOPICS[0], { ...MOCK_TOPICS[1], subscribed: true }]);
      await flushMicrotasks();
      fixture.detectChanges();

      const topicsCard = fixture.nativeElement.querySelectorAll('app-topic-card');
      expect(topicsCard.length).toEqual(2);
    });
  });
});
