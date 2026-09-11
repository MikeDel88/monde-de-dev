import { TestBed } from '@angular/core/testing';
import { beforeEach, afterEach, describe, expect, it } from '@jest/globals';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting, TestRequest } from '@angular/common/http/testing';

import { PostService } from './post-service';
import { environment } from '../../../../environments/environment';
import { Post } from '../models/post';

const MOCK_POST: Post = {
  id: 1,
  title: 'Test Post',
  date: '2024-06-01T12:00:00Z',
  author: 'John Doe',
  content: 'Some content',
  topicName: 'Some topic',
  comments: [],
};

describe('PostService', () => {
  let service: PostService;
  let httpMock: HttpTestingController;

  const flushMicrotasks = () => new Promise((resolve) => setTimeout(resolve, 0));

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PostService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have postId set to null by default', () => {
    expect(service.postId()).toBeNull();
  });

  describe('createPost$', () => {
    it('should POST to /posts with the topicId, title and content', (done) => {
      service.createPost$('1', 'My title', 'My content').subscribe({
        next: () => done(),
      });

      const req: TestRequest = httpMock.expectOne(`${environment.apiUrl}/posts`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ topicId: '1', title: 'My title', content: 'My content' });
      req.flush(null, { status: 201, statusText: 'Created' });
    });

    it('should propagate an error when the request fails', (done) => {
      service.createPost$('1', 'My title', 'My content').subscribe({
        error: (error) => {
          expect(error.status).toBe(500);
          done();
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/posts`);
      req.flush(null, { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('post (httpResource)', () => {
    it('should not fetch anything while postId is null', () => {
      TestBed.tick();

      httpMock.expectNone(`${environment.apiUrl}/posts/null`);
      expect(service.post.hasValue()).toBe(false);
    });

    it('should fetch the post once postId is set', async () => {
      service.postId.set('1');
      TestBed.tick();

      const req = httpMock.expectOne(`${environment.apiUrl}/posts/1`);
      expect(req.request.method).toBe('GET');
      req.flush(MOCK_POST);

      await flushMicrotasks();
      TestBed.tick();

      expect(service.post.hasValue()).toBe(true);
      expect(service.post.value()).toEqual(MOCK_POST);
    });

    it('should refetch the post when reload is called', async () => {
      service.postId.set('1');
      TestBed.tick();

      httpMock.expectOne(`${environment.apiUrl}/posts/1`).flush(MOCK_POST);
      await flushMicrotasks();
      TestBed.tick();

      service.post.reload();
      TestBed.tick();

      const req = httpMock.expectOne(`${environment.apiUrl}/posts/1`);
      req.flush(MOCK_POST);
      await flushMicrotasks();
      TestBed.tick();

      expect(service.post.value()).toEqual(MOCK_POST);
    });
  });

  describe('createComment$', () => {
    it('should POST to /posts/{postId}/comments with the comment content', (done) => {
      service.postId.set('1');

      service.createComment$('Nice article').subscribe({
        next: () => done(),
      });

      const req: TestRequest = httpMock.expectOne(`${environment.apiUrl}/posts/1/comments`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ content: 'Nice article' });
      req.flush(null, { status: 201, statusText: 'Created' });
    });

    it('should propagate an error when the request fails', (done) => {
      service.postId.set('1');

      service.createComment$('Nice article').subscribe({
        error: (error) => {
          expect(error.status).toBe(500);
          done();
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/posts/1/comments`);
      req.flush(null, { status: 500, statusText: 'Internal Server Error' });
    });
  });
});
