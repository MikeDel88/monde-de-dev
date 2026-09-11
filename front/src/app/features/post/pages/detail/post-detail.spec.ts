import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { of, throwError } from 'rxjs';
import { EnvironmentProviders, Provider, signal, WritableSignal } from '@angular/core';

import { PostDetail } from './post-detail';
import { PostService } from '../../services/post-service';
import { ActivatedRoute, Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { Post } from '../../models/post';

const MOCK_POST: Post = {
  id: 1,
  title: 'Test Post',
  date: '2024-06-01T12:00:00Z',
  author: 'john doe',
  content: 'some content',
  topicName: 'some topic',
  comments: [],
};

/**
 * Plan de test
 * Vérifie le bouton back qu'il renvoi vers /feed.
 * Vérifie que le titre correspond bien au title du post.
 * Vérifie le loader tant que isLoading
 * Vérifie l'erreur si une erreur est survenue à la création d'un commentaire.
 * Vérifie si toutes les données du post sont bien affichés (avec les pipes).
 * Vérifie la validation du formulaire commentaire.
 * Vérifie l'affichage des commentaires s'il y en a.
 */
describe('PostDetail', () => {
  let component: PostDetail;
  let fixture: ComponentFixture<PostDetail>;
  let router: Router;

  let mockPostValue: WritableSignal<Post>;
  let mockPostHasValue: WritableSignal<boolean>;
  let mockPostIsLoading: WritableSignal<boolean>;
  let mockPostError: WritableSignal<Error | undefined>;

  const mockPostService = {
    postId: { set: jest.fn() },
    post: {
      hasValue: () => mockPostHasValue(),
      value: () => mockPostValue(),
      isLoading: () => mockPostIsLoading(),
      error: () => mockPostError(),
      reload: jest.fn(),
    },
    createComment$: jest.fn(),
  };

  const submitComment = () => {
    fixture.debugElement.query(By.css('form')).triggerEventHandler('submit', new Event('submit'));
    fixture.detectChanges();
  };

  const flushMicrotasks = () => new Promise((resolve) => setTimeout(resolve, 0));

  const configurePostDetail = async (providers: (Provider | EnvironmentProviders)[]): Promise<void> => {
    await TestBed.configureTestingModule({
      imports: [PostDetail],
      providers,
    }).compileComponents();

    fixture = TestBed.createComponent(PostDetail);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.detectChanges();
  };

  beforeEach(async () => {
    mockPostValue = signal(MOCK_POST);
    mockPostHasValue = signal(true);
    mockPostIsLoading = signal(false);
    mockPostError = signal<Error | undefined>(undefined);

    mockPostService.postId.set.mockReset();
    mockPostService.post.reload.mockReset();
    mockPostService.createComment$.mockReset();

    await configurePostDetail([
      { provide: PostService, useValue: mockPostService },
      { provide: ActivatedRoute, useValue: { snapshot: { params: { id: '1' } } } },
    ]);
  });

  describe('Unit Test', () => {

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should navigate to /feed when the back button is clicked', () => {
      fixture.debugElement.query(By.css('[data-test="btn-back"]')).nativeElement.click();

      expect(router.navigate).toHaveBeenCalledWith(['/feed']);
    });

    it('should display the post title', () => {
      const heading = fixture.nativeElement.querySelector('h1');
      expect(heading?.textContent).toContain(MOCK_POST.title);
    });

    it('should display the loader while the post is loading', () => {
      mockPostHasValue.set(false);
      mockPostIsLoading.set(true);
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.css('[data-test="loader"]'))).toBeTruthy();
    });

    it('should display an error message when the post fails to load', () => {
      mockPostHasValue.set(false);
      mockPostIsLoading.set(false);
      mockPostError.set(new Error('Une erreur est survenue'));
      fixture.detectChanges();

      const errorElement = fixture.debugElement.query(By.css('[data-test="error"]'));
      expect(errorElement.nativeElement.textContent).toContain('Une erreur est survenue');
    });

    it('should display the post data correctly formatted with pipes', () => {
      const text = fixture.nativeElement.textContent as string;

      expect(text).toContain('01/06/2024');
      expect(text).toContain('John doe');
      expect(text).toContain('Some topic');
      expect(text).toContain('Some content');
    });

    it('should display the comments when there are some', () => {
      mockPostValue.set({
        ...MOCK_POST,
        comments: [{ author: 'jane', content: 'nice article' }],
      });
      fixture.detectChanges();

      const text = fixture.nativeElement.textContent as string;
      expect(text).toContain('Jane');
      expect(text).toContain('Nice article');
    });

    it('should not display the comments section when there are none', () => {
      mockPostValue.set({ ...MOCK_POST, comments: [] });
      fixture.detectChanges();

      const commentItems = fixture.debugElement.queryAll(By.css("[data-test='comments']"));
      expect(commentItems.length).toBe(0);
    });

    describe('Comment form validation', () => {
      it.each([
        ['', false, 'required'],
        ['Nice article', true, []],
      ])('content "%s" → valid=%s, error=%s', (value, valid, expectedError: string | string[]) => {
        component.commentForm.content().value.set(value);

        expect(component.commentForm.content().valid()).toBe(valid);
        if (typeof expectedError === 'string') {
          expect(component.commentForm.content().errors()).toEqual([expect.objectContaining({ kind: expectedError })]);
        } else {
          expect(component.commentForm.content().errors()).toEqual([]);
        }
      });
    });

    describe('Comment submission', () => {
      it('should call postService.createComment$ with the comment content', () => {
        mockPostService.createComment$.mockReturnValue(of(undefined));
        component.commentForm.content().value.set('Nice article');

        submitComment();

        expect(mockPostService.createComment$).toHaveBeenCalledWith('Nice article');
      });

      it('should reset the form and reload the post on successful comment creation', () => {
        mockPostService.createComment$.mockReturnValue(of(undefined));
        component.commentForm.content().value.set('Nice article');

        submitComment();

        expect(component.commentForm.content().value()).toBe('');
        expect(mockPostService.post.reload).toHaveBeenCalled();
      });

      it('should display an error message when comment creation fails', () => {
        mockPostService.createComment$.mockReturnValue(throwError(() => new Error('fail')));
        component.commentForm.content().value.set('Nice article');

        submitComment();

        const errorElement = fixture.debugElement.query(By.css('[data-test="error"]'));
        expect(errorElement.nativeElement.textContent).toContain('Erreur lors de la création du commentaire.');
      });
    });
  });

  describe('Integration Test (Component + PostService + HttpClientTesting)', () => {

    let httpMock: HttpTestingController;

    beforeEach(async () => {
      TestBed.resetTestingModule();

      await configurePostDetail([
        { provide: ActivatedRoute, useValue: { snapshot: { params: { id: '1' } } } },
        provideHttpClient(),
        provideHttpClientTesting(),
      ]);

      httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
      httpMock.verify();
    });

    const flushPost = async (post: Post = MOCK_POST) => {
      const req = httpMock.expectOne(`${environment.apiUrl}/posts/1`);
      req.flush(post);
      await flushMicrotasks();
      fixture.detectChanges();
    };

    it('should display the loader before the post request resolves', () => {
      expect(fixture.debugElement.query(By.css('[data-test="loader"]'))).toBeTruthy();

      httpMock.expectOne(`${environment.apiUrl}/posts/1`).flush(MOCK_POST);
    });

    it('should fetch and display the post from the real PostService', async () => {
      await flushPost();

      const heading = fixture.nativeElement.querySelector('h1');
      expect(heading?.textContent).toContain(MOCK_POST.title);
    });

    it('should display an error message when the post request fails (500)', async () => {
      const req = httpMock.expectOne(`${environment.apiUrl}/posts/1`);
      req.flush(null, { status: 500, statusText: 'Internal Server Error' });
      await flushMicrotasks();
      fixture.detectChanges();

      const errorElement = fixture.debugElement.query(By.css('[data-test="error"]'));
      expect(errorElement).toBeTruthy();
    });

    it('should call POST /posts/1/comments and reload the post on success', async () => {
      await flushPost();
      component.commentForm.content().value.set('Nice article');

      submitComment();

      const req = httpMock.expectOne({ url: `${environment.apiUrl}/posts/1/comments` });
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ content: 'Nice article' });

      req.flush(null, { status: 204, statusText: 'No Content' });
      fixture.detectChanges();

      expect(component.commentForm.content().value()).toBe('');

      await flushPost();
    });

    it('should display an error message when comment creation fails (500)', async () => {
      await flushPost();
      component.commentForm.content().value.set('Nice article');

      submitComment();

      const req = httpMock.expectOne({ url: `${environment.apiUrl}/posts/1/comments` });
      req.flush(null, { status: 500, statusText: 'Internal Server Error' });
      fixture.detectChanges();

      const errorElement = fixture.debugElement.query(By.css('[data-test="error"]'));
      expect(errorElement.nativeElement.textContent).toContain('Erreur lors de la création du commentaire.');
    });
  });
});
