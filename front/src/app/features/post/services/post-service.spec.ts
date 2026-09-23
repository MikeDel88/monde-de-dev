import { TestBed } from '@angular/core/testing';
import { beforeEach, afterEach, describe, expect, it } from '@jest/globals';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting, TestRequest } from '@angular/common/http/testing';

import { PostService } from './post-service';
import { environment } from '../../../../environments/environment';

describe('PostService', () => {
  let service: PostService;
  let httpMock: HttpTestingController;

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

  describe('createPost$', () => {
    it('should POST to /posts with the topicId, title and content', (done) => {
      service.createPost$(1, 'My title', 'My content').subscribe({
        next: () => done(),
      });

      const req: TestRequest = httpMock.expectOne(`${environment.apiUrl}/posts`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ topicId: 1, title: 'My title', content: 'My content' });
      req.flush(null, { status: 201, statusText: 'Created' });
    });

    it('should propagate an error when the request fails', (done) => {
      service.createPost$(1, 'My title', 'My content').subscribe({
        error: (error) => {
          expect(error.status).toBe(500);
          done();
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/posts`);
      req.flush(null, { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('createComment$', () => {
    it('should POST to /posts/{postId}/comments with the comment content', (done) => {
      service.createComment$(1, 'Nice article').subscribe({
        next: () => done(),
      });

      const req: TestRequest = httpMock.expectOne(`${environment.apiUrl}/posts/1/comments`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ content: 'Nice article' });
      req.flush(null, { status: 201, statusText: 'Created' });
    });

    it('should propagate an error when the request fails', (done) => {
      service.createComment$(1, 'Nice article').subscribe({
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
