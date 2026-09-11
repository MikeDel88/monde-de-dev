import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Feed } from './feed';
import {afterEach, beforeEach, describe, it, expect, jest} from "@jest/globals";
import {Router} from "@angular/router";
import {PostFeed} from "../models/post-feed";
import {By} from "@angular/platform-browser";
import {HttpTestingController, provideHttpClientTesting, TestRequest} from "@angular/common/http/testing";
import {provideHttpClient} from "@angular/common/http";
import {environment} from "../../../../environments/environment";

/**
 * Plan de test
 * ● Vérifier que le composant Feed est créé correctement.
 * ● Vérifier le sorting des posts par ordre croissant et décroissant.
 * ● Vérifier que le bouton "Créer un article" redirige vers la page de création d'article.
 * ● Vérifier que le clic sur un post redirige vers la page de détail du post.
 * ● Vérifier que le composant affiche correctement les posts récupérés du service FeedService.
 *
 * Les tests sont classés en deux catégories :
 * - "Tests unitaires" : n'exercent que le DOM du composant, sans passer par FeedService ou une vraie requête HTTP.
 * - "Tests d'intégration" : passent par le vrai flux du composant (FeedService réel + Router réel), avec seulement la couche HTTP simulée via HttpClientTesting.
 */
describe('Feed', () => {

  let component: Feed;
  let fixture: ComponentFixture<Feed>;
  let router: Router


  const MOCK_POST: PostFeed = {
    id: 1,
    title: 'Test Post',
    preview: 'This is a test post.',
    date: "2024-06-01T12:00:00Z",
    author: 'John Doe'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Feed]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Feed);
    component = fixture.componentInstance;
    fixture.detectChanges();
    router = TestBed.inject(Router);
  });

  describe('Unit Test', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should toggle sortByAsc when toggle is called', () => {
      const initialSortByAsc = component.sortByAsc();
      component.toggle();
      expect(component.sortByAsc()).toBe(!initialSortByAsc);
    });

    it('should display the descending arrow when sortByAsc is false', () => {
      const arrowDesc = fixture.debugElement.query(By.css("[data-test='desc']"));
      expect(arrowDesc).toBeTruthy();
    });

    it('should display the ascending arrow when sortByAsc is true', () => {
      component.sortByAsc.set(true);
      fixture.detectChanges();
      const arrowAsc = fixture.debugElement.query(By.css("[data-test='asc']"));
      expect(arrowAsc).toBeTruthy();
    });

    it('should navigate to create post page when onClickCreatePost is called', () => {
      const spyOnNavigate = jest.spyOn(router, 'navigate');
      component.onClickCreatePost();
      expect(spyOnNavigate).toHaveBeenCalledWith(['/post']);
    });

    it('should navigate to post detail page when onClickPost is called', () => {
      const spyOnNavigate = jest.spyOn(router, 'navigate');
      component.onClickPost(MOCK_POST.id);
      expect(spyOnNavigate).toHaveBeenCalledWith(['/post', MOCK_POST.id]);
    });

    it('should display the posts correctly', () => {
      component.posts.set([MOCK_POST]);
      fixture.detectChanges();
      const postCard = fixture.nativeElement.querySelector('app-post-card');
      expect(postCard).toBeTruthy();
    });

    it('should not display any post card when posts is undefined', () => {
      component.posts.set(undefined);
      fixture.detectChanges();
      const postCard = fixture.nativeElement.querySelector('app-post-card');
      expect(postCard).toBeFalsy();
    });

    it('should display the loader while posts are loading', () => {
      const loader = fixture.nativeElement.querySelector('app-loader');
      expect(loader).toBeTruthy();
    });

  });

  describe('Integration Test', () => {
    let httpMock: HttpTestingController;

    beforeEach(async () => {
      TestBed.resetTestingModule();

      await TestBed.configureTestingModule({
        imports: [Feed],
        providers: [provideHttpClient(), provideHttpClientTesting()],
      }).compileComponents();

      fixture = TestBed.createComponent(Feed);
      component = fixture.componentInstance;
      router = TestBed.inject(Router);
      httpMock = TestBed.inject(HttpTestingController);
      fixture.detectChanges();
    });

    afterEach(() => {
      httpMock.verify();
    });

    const expectFeedRequest = (sort: 'asc' | 'desc'): TestRequest =>
      httpMock.expectOne(req => req.url === `${environment.apiUrl}/feed` && req.params.get('sort') === sort);

    const flushMicrotasks = () => new Promise((resolve) => setTimeout(resolve, 0));

    it('should fetch the posts from the real FeedService and display them', async () => {
      const req = expectFeedRequest('desc');
      expect(req.request.method).toBe('GET');

      req.flush([MOCK_POST]);
      await flushMicrotasks();
      fixture.detectChanges();

      const postCard = fixture.nativeElement.querySelector('app-post-card');
      expect(postCard).toBeTruthy();
    });

    it('should display an error message when the request fails', async () => {
      const req = expectFeedRequest('desc');

      req.flush(null, { status: 500, statusText: 'Internal Server Error' });
      await flushMicrotasks();
      fixture.detectChanges();

      const errorElement = fixture.debugElement.query(By.css('[data-test="error"]'));
      expect(errorElement).toBeTruthy();
    });

    it('should trigger a new request sorted ascending when toggle is called', async () => {
      expectFeedRequest('desc').flush([MOCK_POST]);
      await flushMicrotasks();
      fixture.detectChanges();

      component.toggle();
      fixture.detectChanges();

      const secondReq = expectFeedRequest('asc');
      secondReq.flush([MOCK_POST]);
      await flushMicrotasks();
      fixture.detectChanges();

      const postCard = fixture.nativeElement.querySelector('app-post-card');
      expect(postCard).toBeTruthy();
    });

  });
});
