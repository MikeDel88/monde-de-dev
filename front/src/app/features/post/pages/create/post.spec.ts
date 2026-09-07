import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { of, throwError } from 'rxjs';
import { EnvironmentProviders, Provider } from '@angular/core';

import { Post } from './post';
import { ProfileService } from '../../../profile/services/profile-service';
import { PostService } from '../../services/post-service';
import { Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { HttpTestingController, provideHttpClientTesting, TestRequest } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { ProfileResponse } from '../../../profile/models/profile-response';

const MOCK_TOPIC = { id: 1, title: 'Topic A', description: '', subscribed: false };

const VALID_POST_DATA = { topicId: '1', title: 'My title', content: 'My content' };

/**
 * Plan de test
 * Vérifie que le bouton back renvoie sur /feed
 * Vérifié que title soit bien affiché
 * Vérifie le chargement des topics
 * Vérifie la sélection d'un thème obligatoire
 * Vérifie le titre obligatoire
 * Vérifie le contenu obligatoire
 * Vérifie le submit (en cas de succès redirige vers /feed, en cas d'erreur affichage)
 * Vérifie le bouton submit enabled seulement si le formulaire est valide.
 */
describe('Post', () => {
  let component: Post;
  let fixture: ComponentFixture<Post>;
  let router: Router;

  const mockProfileService = {
    profile: {
      hasValue: jest.fn(() => true),
      value: jest.fn(() => ({ topics: [MOCK_TOPIC] }) as ProfileResponse),
      reload: jest.fn(),
    },
  };

  const mockPostService = {
    createPost$: jest.fn(),
  };

  const fillForm = (topicId: string, title: string, content: string) => {
    component.postForm.topicId().value.set(topicId);
    component.postForm.title().value.set(title);
    component.postForm.content().value.set(content);
  };

  const resetForm = () => component.postForm().reset({ topicId: '', title: '', content: '' });

  const submit = () => {
    fixture.debugElement.query(By.css('form')).triggerEventHandler('submit', new Event('submit'));
    fixture.detectChanges();
  };

  const submitButton = () =>
    fixture.debugElement.query(By.css('button[type="submit"]')).nativeElement as HTMLButtonElement;

  const flushMicrotasks = () => new Promise((resolve) => setTimeout(resolve, 0));

  const configurePost = async (providers: (Provider | EnvironmentProviders)[]): Promise<void> => {
    await TestBed.configureTestingModule({
      imports: [Post],
      providers,
    }).compileComponents();

    fixture = TestBed.createComponent(Post);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.detectChanges();
  };

  beforeEach(async () => {
    mockProfileService.profile.hasValue.mockReturnValue(true);
    mockProfileService.profile.value.mockReturnValue({ topics: [MOCK_TOPIC] } as ProfileResponse);
    mockProfileService.profile.reload.mockReset();
    mockPostService.createPost$.mockReset();

    await configurePost([
      { provide: ProfileService, useValue: mockProfileService },
      { provide: PostService, useValue: mockPostService },
    ]);
  });

  describe('Unit Test', () => {

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should display the title', () => {
      const heading = fixture.nativeElement.querySelector('h1');
      expect(heading?.textContent).toContain('Créer un nouvel article');
    });

    it('should navigate to /feed when the back button is clicked', () => {
      fixture.debugElement.query(By.css('[data-test="btn-back"]')).nativeElement.click();

      expect(router.navigate).toHaveBeenCalledWith(['/feed']);
    });

    it('should populate the topic select with the topics from the profile', () => {
      const options = fixture.debugElement.queryAll(By.css('[data-test="topic"] option'));

      expect(options.map((el) => el.nativeElement.textContent.trim())).toEqual(['Sélectionner un thème', MOCK_TOPIC.title]);
    });

    describe('Form validation', () => {
      it.each([
        ['', false, 'required'],
        ['1', true, []],
      ])('topicId "%s" → valid=%s, error=%s', (value, valid, expectedError: string | string[]) => {
        component.postForm.topicId().value.set(value);

        expect(component.postForm.topicId().valid()).toBe(valid);
        if (typeof expectedError === 'string') {
          expect(component.postForm.topicId().errors()).toEqual([expect.objectContaining({ kind: expectedError })]);
        } else {
          expect(component.postForm.topicId().errors()).toEqual([]);
        }
      });

      it.each([
        ['', false, 'required'],
        ['My title', true, []],
      ])('title "%s" → valid=%s, error=%s', (value, valid, expectedError: string | string[]) => {
        component.postForm.title().value.set(value);

        expect(component.postForm.title().valid()).toBe(valid);
        if (typeof expectedError === 'string') {
          expect(component.postForm.title().errors()).toEqual([expect.objectContaining({ kind: expectedError })]);
        } else {
          expect(component.postForm.title().errors()).toEqual([]);
        }
      });

      it.each([
        ['', false, 'required'],
        ['My content', true, []],
      ])('content "%s" → valid=%s, error=%s', (value, valid, expectedError: string | string[]) => {
        component.postForm.content().value.set(value);

        expect(component.postForm.content().valid()).toBe(valid);
        if (typeof expectedError === 'string') {
          expect(component.postForm.content().errors()).toEqual([expect.objectContaining({ kind: expectedError })]);
        } else {
          expect(component.postForm.content().errors()).toEqual([]);
        }
      });

      it('should show the field error slots once the fields are touched and left empty', () => {
        component.postForm.topicId().markAsTouched();
        component.postForm.title().markAsTouched();
        component.postForm.content().markAsTouched();
        fixture.detectChanges();

        expect(fixture.debugElement.query(By.css('[data-test="error-topic"]'))).toBeTruthy();
        expect(fixture.debugElement.query(By.css('[data-test="error-title"]'))).toBeTruthy();
        expect(fixture.debugElement.query(By.css('[data-test="error-content"]'))).toBeTruthy();
      });
    });

    describe('Submit button state', () => {
      it('should disable the submit button while the form is invalid', () => {
        resetForm();
        fixture.detectChanges();

        expect(submitButton().disabled).toBe(true);
      });

      it('should enable the submit button once the form is valid', () => {
        fillForm(VALID_POST_DATA.topicId, VALID_POST_DATA.title, VALID_POST_DATA.content);
        fixture.detectChanges();

        expect(submitButton().disabled).toBe(false);
      });
    });

    describe('Submission', () => {
      it('should call postService.createPost$ with the form values', () => {
        mockPostService.createPost$.mockReturnValue(of(undefined));
        fillForm(VALID_POST_DATA.topicId, VALID_POST_DATA.title, VALID_POST_DATA.content);

        submit();

        expect(mockPostService.createPost$).toHaveBeenCalledWith(
          VALID_POST_DATA.topicId,
          VALID_POST_DATA.title,
          VALID_POST_DATA.content
        );
      });

      it('should reset the form and navigate to /feed on successful submission', () => {
        mockPostService.createPost$.mockReturnValue(of(undefined));
        fillForm(VALID_POST_DATA.topicId, VALID_POST_DATA.title, VALID_POST_DATA.content);

        submit();

        expect(router.navigate).toHaveBeenCalledWith(['/feed']);
        expect(component.postForm.topicId().value()).toBe('');
        expect(component.postForm.title().value()).toBe('');
        expect(component.postForm.content().value()).toBe('');
      });

      it('should display an error message and not navigate when createPost$ fails', () => {
        mockPostService.createPost$.mockReturnValue(throwError(() => new Error('server error')));
        fillForm(VALID_POST_DATA.topicId, VALID_POST_DATA.title, VALID_POST_DATA.content);

        submit();

        expect(component.error()).toBe('Erreur lors de la création du post.');
        expect(router.navigate).not.toHaveBeenCalled();

        const errorElement = fixture.debugElement.query(By.css('[data-test="error"]'));
        expect(errorElement.nativeElement.textContent).toContain('Erreur lors de la création du post.');
      });
    });
  });

  describe('Integration Test (Component + ProfileService/PostService + HttpClientTesting)', () => {

    let httpMock: HttpTestingController;

    beforeEach(async () => {
      TestBed.resetTestingModule();

      await configurePost([provideHttpClient(), provideHttpClientTesting()]);

      httpMock = TestBed.inject(HttpTestingController);

      // PostService.post (httpResource) fetches eagerly on injection, even though
      // this page never reads it — flush it away so it doesn't linger unhandled.
      httpMock.expectOne(`${environment.apiUrl}/posts/null`).flush(null);
    });

    afterEach(() => {
      httpMock.verify();
    });

    const flushProfile = async (topics = [MOCK_TOPIC]) => {
      const req = httpMock.expectOne(`${environment.apiUrl}/profile`);
      req.flush({ name: 'John', email: 'john@test.com', topics } as ProfileResponse);
      await flushMicrotasks();
      fixture.detectChanges();
    };

    it('should fetch the profile and populate the topic select', async () => {
      await flushProfile();

      const options = fixture.debugElement.queryAll(By.css('[data-test="topic"] option'));
      expect(options.map((el) => el.nativeElement.textContent.trim())).toEqual(['Sélectionner un thème', MOCK_TOPIC.title]);
    });

    it('should call POST /posts with the correct body and navigate to /feed on success', async () => {
      await flushProfile();
      fillForm(VALID_POST_DATA.topicId, VALID_POST_DATA.title, VALID_POST_DATA.content);

      submit();

      const req: TestRequest = httpMock.expectOne({ url: `${environment.apiUrl}/posts` });
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(VALID_POST_DATA);

      req.flush(null, { status: 201, statusText: 'Created' });
      fixture.detectChanges();

      expect(router.navigate).toHaveBeenCalledWith(['/feed']);
      expect(component.postForm.title().value()).toBe('');
    });

    it('should display an error message when the create request fails (500)', async () => {
      await flushProfile();
      fillForm(VALID_POST_DATA.topicId, VALID_POST_DATA.title, VALID_POST_DATA.content);

      submit();

      const req = httpMock.expectOne({ url: `${environment.apiUrl}/posts` });
      req.flush(null, { status: 500, statusText: 'Internal Server Error' });
      fixture.detectChanges();

      expect(component.error()).toBe('Erreur lors de la création du post.');
      expect(router.navigate).not.toHaveBeenCalled();

      const errorElement = fixture.debugElement.query(By.css('[data-test="error"]'));
      expect(errorElement.nativeElement.textContent).toContain('Erreur lors de la création du post.');
    });
  });
});
