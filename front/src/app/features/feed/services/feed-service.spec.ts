import { TestBed } from '@angular/core/testing';

import { FeedService } from './feed-service';
import {it, beforeEach, describe, expect} from "@jest/globals";
import {provideHttpClient} from "@angular/common/http";
import {HttpTestingController, provideHttpClientTesting} from "@angular/common/http/testing";
import {environment} from "../../../../environments/environment";
import {PostFeed} from "../models/post-feed";

describe('FeedService', () => {
  let service: FeedService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(FeedService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should sortByAsc is false by default', () => {
    expect(service.sortByAsc()).toBe(false);
  });

  it('should toggleFilterByAsc invert the boolean value', () => {
    service.toggleFilterByAsc();
    expect(service.sortByAsc()).toBe(true);
  })

  it('should return posts on success', async () => {
    const postMock: PostFeed = {
      id: 1,
      title: 'Test Post',
      preview: 'This is a test post.',
      date: '2024-06-01T12:00:00Z',
      author: 'John Doe',
    };

    TestBed.tick();

    const req = httpMock.expectOne(
      (r) => r.url === `${environment.apiUrl}/feed` && r.params.get('sort') === 'desc'
    );
    expect(req.request.method).toBe('GET');
    req.flush([postMock]);

    await new Promise((resolve) => setTimeout(resolve, 0));
    TestBed.tick();

    expect(service.posts.hasValue()).toBe(true);
    expect(service.posts.value()).toEqual([postMock]);
  });
});
