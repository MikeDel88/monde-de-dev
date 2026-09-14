import { TestBed } from '@angular/core/testing';

import { FeedService } from './feed-service';
import {it, beforeEach, describe, expect} from "@jest/globals";
import {provideHttpClient} from "@angular/common/http";
import {HttpTestingController, provideHttpClientTesting, TestRequest} from "@angular/common/http/testing";
import {environment} from "../../../../environments/environment";
import {PostFeed} from "../models/post-feed";
import {CursorPage} from "../../../shared/models/cursor-page";

const buildPost = (id: number): PostFeed => ({
  id,
  title: `Test Post ${id}`,
  preview: 'This is a test post.',
  date: '2024-06-01T12:00:00Z',
  author: 'John Doe',
});

const buildCursorPage = (posts: PostFeed[], hasNext: boolean, nextCursor: number | null): CursorPage<PostFeed> => ({
  content: posts,
  hasNext,
  nextCursor,
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

  const expectRequest = (sort: 'asc' | 'desc', cursor?: number): TestRequest =>
    httpMock.expectOne(
      (r) => r.url === `${environment.apiUrl}/posts`
        && r.params.get('direction') === sort
        && r.params.get('cursor') === (cursor === undefined ? null : String(cursor))
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
    const pageMock = buildCursorPage([buildPost(1)], false, null);

    TestBed.tick();

    const req = expectRequest('desc');
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
    expectRequest('desc').flush(buildCursorPage([buildPost(1)], true, 1));
    await flushMicrotasks();
    TestBed.tick();

    expect(service.hasMore()).toBe(true);

    service.loadMore();
    TestBed.tick();

    expectRequest('desc', 1).flush(buildCursorPage([buildPost(2)], false, null));
    await flushMicrotasks();
    TestBed.tick();

    expect(service.loadedPosts()).toEqual([buildPost(1), buildPost(2)]);
    expect(service.hasMore()).toBe(false);
  });

  it('should not fetch another page when loadMore is called and hasMore is false', async () => {
    TestBed.tick();
    expectRequest('desc').flush(buildCursorPage([buildPost(1)], false, null));
    await flushMicrotasks();
    TestBed.tick();

    expect(service.hasMore()).toBe(false);

    service.loadMore();
    TestBed.tick();

    httpMock.expectNone((r) => r.url === `${environment.apiUrl}/posts` && r.params.has('cursor'));
  });

  it('should reset the accumulated posts to the new first page when toggling the sort order', async () => {
    TestBed.tick();
    expectRequest('desc').flush(buildCursorPage([buildPost(1)], true, 1));
    await flushMicrotasks();
    TestBed.tick();

    service.loadMore();
    TestBed.tick();
    expectRequest('desc', 1).flush(buildCursorPage([buildPost(2)], false, null));
    await flushMicrotasks();
    TestBed.tick();

    expect(service.loadedPosts().length).toBe(2);

    service.toggleFilterByAsc();
    TestBed.tick();
    expectRequest('asc').flush(buildCursorPage([buildPost(3)], false, null));
    await flushMicrotasks();
    TestBed.tick();

    expect(service.loadedPosts()).toEqual([buildPost(3)]);
  });
});
