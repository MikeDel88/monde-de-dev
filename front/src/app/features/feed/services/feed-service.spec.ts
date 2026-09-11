import { TestBed } from '@angular/core/testing';

import { FeedService } from './feed-service';
import {it, beforeEach, describe, expect} from "@jest/globals";
import {provideHttpClient} from "@angular/common/http";
import {HttpTestingController, provideHttpClientTesting, TestRequest} from "@angular/common/http/testing";
import {environment} from "../../../../environments/environment";
import {PostFeed} from "../models/post-feed";
import {Page} from "../../../shared/models/page";

const buildPost = (id: number): PostFeed => ({
  id,
  title: `Test Post ${id}`,
  preview: 'This is a test post.',
  date: '2024-06-01T12:00:00Z',
  author: 'John Doe',
});

const buildPage = (posts: PostFeed[], number: number, totalPages: number): Page<PostFeed> => ({
  content: posts,
  totalElements: totalPages * posts.length,
  totalPages,
  number,
  size: 20,
});

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

  const expectRequest = (page: number, sort: 'asc' | 'desc'): TestRequest =>
    httpMock.expectOne(
      (r) => r.url === `${environment.apiUrl}/posts`
        && r.params.get('sort') === sort
        && r.params.get('page') === String(page)
    );

  const flushMicrotasks = () => new Promise((resolve) => setTimeout(resolve, 0));

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have sortByAsc set to false by default', () => {
    expect(service.sortByAsc()).toBe(false);
  });

  it('should invert the boolean value when toggleFilterByAsc is called', () => {
    service.toggleFilterByAsc();
    expect(service.sortByAsc()).toBe(true);
  })

  it('should return posts on success', async () => {
    const pageMock = buildPage([buildPost(1)], 0, 1);

    TestBed.tick();

    const req = expectRequest(0, 'desc');
    expect(req.request.method).toBe('GET');
    req.flush(pageMock);

    await flushMicrotasks();
    TestBed.tick();

    expect(service.posts.hasValue()).toBe(true);
    expect(service.posts.value()).toEqual(pageMock);
    expect(service.loadedPosts()).toEqual([buildPost(1)]);
  });

  it('should append the next page content to loadedPosts when loadMore is called', async () => {
    TestBed.tick();
    expectRequest(0, 'desc').flush(buildPage([buildPost(1)], 0, 2));
    await flushMicrotasks();
    TestBed.tick();

    expect(service.hasMore()).toBe(true);

    service.loadMore();
    TestBed.tick();

    expectRequest(1, 'desc').flush(buildPage([buildPost(2)], 1, 2));
    await flushMicrotasks();
    TestBed.tick();

    expect(service.loadedPosts()).toEqual([buildPost(1), buildPost(2)]);
    expect(service.hasMore()).toBe(false);
  });

  it('should not fetch another page when loadMore is called and hasMore is false', async () => {
    TestBed.tick();
    expectRequest(0, 'desc').flush(buildPage([buildPost(1)], 0, 1));
    await flushMicrotasks();
    TestBed.tick();

    expect(service.hasMore()).toBe(false);

    service.loadMore();
    TestBed.tick();

    httpMock.expectNone((r) => r.url === `${environment.apiUrl}/posts` && r.params.get('page') === '1');
  });

  it('should reset the accumulated posts to the new first page when toggling the sort order', async () => {
    TestBed.tick();
    expectRequest(0, 'desc').flush(buildPage([buildPost(1)], 0, 2));
    await flushMicrotasks();
    TestBed.tick();

    service.loadMore();
    TestBed.tick();
    expectRequest(1, 'desc').flush(buildPage([buildPost(2)], 1, 2));
    await flushMicrotasks();
    TestBed.tick();

    expect(service.loadedPosts().length).toBe(2);

    service.toggleFilterByAsc();
    TestBed.tick();
    expectRequest(0, 'asc').flush(buildPage([buildPost(3)], 0, 1));
    await flushMicrotasks();
    TestBed.tick();

    expect(service.loadedPosts()).toEqual([buildPost(3)]);
  });
});
