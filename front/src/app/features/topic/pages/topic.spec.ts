import { ComponentFixture, TestBed } from '@angular/core/testing';

import {describe, it, expect, beforeEach, afterEach, jest} from "@jest/globals";
import {HttpTestingController, provideHttpClientTesting} from "@angular/common/http/testing";
import {provideHttpClient} from "@angular/common/http";
import {TopicService} from "../services/topic-service";
import {signal, WritableSignal} from "@angular/core";
import {Topic as TopicModel} from "../models/topic";
import {Topic} from "./topic";
import {By} from "@angular/platform-browser";
import {TopicCard} from "../../../shared/components/topic-card/topic-card";
import {environment} from "../../../../environments/environment";

const MOCK_TOPICS: TopicModel[] = [
  { id: 1, title: "Topic 1", description: "Topic 1", subscribed: true },
  { id: 2, title: "Topic 2", description: "Topic 2", subscribed: false },
]
/**
 * Plan de test
 * Vérifie que la liste s'affiche bien
 * Vérifie que le click sur subscribe fonctionne bien.
 */
describe('Topic', () => {
  let component: Topic;
  let fixture: ComponentFixture<Topic>;

  let mockTopicValue: WritableSignal<TopicModel[]>;
  let mockTopicHasValue: WritableSignal<boolean>;
  let mockTopicIsLoading: WritableSignal<boolean>;
  let mockTopicError: WritableSignal<Error | undefined>;

  const mockTopicService = {
    topics: {
      hasValue: () => mockTopicHasValue(),
      value: () => mockTopicValue(),
      isLoading: () => mockTopicIsLoading(),
      error: () => mockTopicError(),
      reload: jest.fn(),
    },
    subscribe$: jest.fn(),
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Topic],
      providers: [
        { provide: TopicService, useValue: mockTopicService },
      ]
    })
    .compileComponents();

    mockTopicValue = signal(MOCK_TOPICS);
    mockTopicHasValue = signal(true);
    mockTopicIsLoading = signal(false);
    mockTopicError = signal<Error | undefined>(undefined);

    mockTopicService.topics.reload.mockReset();
    mockTopicService.subscribe$.mockReset();

    fixture = TestBed.createComponent(Topic);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe("Unit Test", () => {
    it("should display topic card with size 2", () => {
        TestBed.tick();
        const topicsCard = fixture.nativeElement.querySelectorAll('app-topic-card');
        expect(topicsCard.length).toEqual(2);
    });
    it("should display loader when topics are loading", () => {
        mockTopicHasValue.set(false);
        mockTopicIsLoading.set(true);
        TestBed.tick();
        const loader = fixture.nativeElement.querySelector('app-loader');
        expect(loader).toBeTruthy();
    });
    it("should display error when topics are not loaded", () => {
        mockTopicIsLoading.set(false);
        mockTopicHasValue.set(false);
        mockTopicError.set(new Error('Une erreur est survenue'));
        TestBed.tick();
        const error = fixture.nativeElement.querySelector('app-error');
        expect(error).toBeTruthy();
    });
    it("should not topics card when topics none", () => {
      mockTopicHasValue.set(true);
      mockTopicValue.set([]);
      TestBed.tick();
      const topicCard = fixture.debugElement.query(By.directive(TopicCard));
      expect(topicCard).toBeFalsy();
    });
  });

  const flushMicrotasks = () => new Promise((resolve) => setTimeout(resolve, 0));

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

      const reloadReq = httpMock.expectOne(`${environment.apiUrl}/topics`);
      reloadReq.flush([MOCK_TOPICS[0], { ...MOCK_TOPICS[1], subscribed: true }]);
      await flushMicrotasks();
      fixture.detectChanges();

      const topicsCard = fixture.nativeElement.querySelectorAll('app-topic-card');
      expect(topicsCard.length).toEqual(2);
    });
  });
});
