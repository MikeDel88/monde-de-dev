import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { MainLayout } from './main-layout';
import {describe, beforeEach, afterEach, it, expect, jest} from "@jest/globals";
import {By} from "@angular/platform-browser";
import {RouterTestingHarness} from "@angular/router/testing";
import {Location} from "@angular/common";
import {routes} from "../../../app.routes";
import {HttpTestingController, provideHttpClientTesting} from "@angular/common/http/testing";
import {provideHttpClient} from "@angular/common/http";
import {SessionService} from "../../../core/services/session-service";
import {environment} from "../../../../environments/environment";
import {CursorPage} from "../../models/cursor-page";
import {PostFeed} from "../../../features/feed/models/post-feed";

const EMPTY_PAGE: CursorPage<PostFeed> = { content: [], hasNext: false, nextCursor: null };

describe('MainLayout', () => {
  let component: MainLayout;
  let fixture: ComponentFixture<MainLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainLayout],
      providers: [provideRouter(routes)],
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle the mobile menu open state', () => {
    expect(component.menu.open()).toBe(false);
    component.menu.toggle();
    expect(component.menu.open()).toBe(true);
  });

  it("should have all links", () => {
    const btnLogout = fixture.debugElement.query(By.css('[data-test="btn-logout"]'));
    expect(btnLogout).toBeTruthy();

    const btnFeed = fixture.debugElement.query(By.css('[data-test="link-feed"]'));
    expect(btnFeed).toBeTruthy();

    const btnTopics = fixture.debugElement.query(By.css('[data-test="link-topic"]'));
    expect(btnTopics).toBeTruthy();

    const btnProfile = fixture.debugElement.query(By.css('[data-test="link-profile"]'));
    expect(btnProfile).toBeTruthy();
  });

  describe('Mobile menu dialog', () => {
    const setViewportWidth = (width: number) => {
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: width });
      window.dispatchEvent(new Event('resize'));
    };

    const getDialog = () => fixture.debugElement.query(By.css('dialog')).nativeElement as HTMLDialogElement;

    beforeEach(() => {
      HTMLDialogElement.prototype.showModal = jest.fn(function (this: HTMLDialogElement) {
        this.open = true;
      });
      HTMLDialogElement.prototype.close = jest.fn(function (this: HTMLDialogElement) {
        this.open = false;
      });

      setViewportWidth(375);
      fixture.detectChanges();
    });

    afterEach(() => {
      setViewportWidth(1024);
    });

    it('should render the dialog on a mobile viewport', () => {
      expect(component.menu.isMobile()).toBe(true);
      expect(getDialog()).toBeTruthy();
    });

    it('should call showModal and mark the dialog open when the menu is toggled open', () => {
      const dialog = getDialog();

      component.menu.toggle();
      fixture.detectChanges();

      expect(dialog.showModal).toHaveBeenCalled();
      expect(dialog.open).toBe(true);
    });

    it('should call close and mark the dialog closed when the menu is toggled closed again', () => {
      const dialog = getDialog();

      component.menu.toggle();
      fixture.detectChanges();
      expect(dialog.open).toBe(true);

      component.menu.toggle();
      fixture.detectChanges();

      expect(dialog.close).toHaveBeenCalled();
      expect(dialog.open).toBe(false);
    });

    it('should open and then close the dialog when the burger button is clicked twice', () => {
      const burgerButton = fixture.debugElement.query(By.css('[data-test="btn-burger"]')).nativeElement;
      const dialog = getDialog();

      burgerButton.click();
      fixture.detectChanges();
      expect(component.menu.open()).toBe(true);
      expect(dialog.open).toBe(true);

      burgerButton.click();
      fixture.detectChanges();
      expect(component.menu.open()).toBe(false);
      expect(dialog.open).toBe(false);
    });

    it('should close the dialog when a mobile nav link is clicked', () => {
      const dialog = getDialog();

      component.menu.toggle();
      fixture.detectChanges();
      expect(dialog.open).toBe(true);

      fixture.debugElement.query(By.css('[data-test="link-feed"]')).nativeElement.click();
      fixture.detectChanges();

      expect(component.menu.open()).toBe(false);
      expect(dialog.open).toBe(false);
    });

    it('should close the dialog when clicking the backdrop (outside the nav panel)', () => {
      const dialog = getDialog();

      component.menu.toggle();
      fixture.detectChanges();
      expect(dialog.open).toBe(true);

      dialog.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      fixture.detectChanges();

      expect(component.menu.open()).toBe(false);
      expect(dialog.open).toBe(false);
    });

    it('should close the dialog when the native cancel event fires (Escape key)', () => {
      const dialog = getDialog();

      component.menu.toggle();
      fixture.detectChanges();
      expect(dialog.open).toBe(true);

      dialog.dispatchEvent(new Event('cancel', { cancelable: true }));
      fixture.detectChanges();

      expect(component.menu.open()).toBe(false);
      expect(dialog.open).toBe(false);
    });
  });

  describe('Routing integration (real Router + Guards)', () => {
    let httpMock: HttpTestingController;

    beforeEach(async () => {
      TestBed.resetTestingModule();

      await TestBed.configureTestingModule({
        providers: [
          SessionService,
          provideRouter(routes),
          provideHttpClient(),
          provideHttpClientTesting(),
        ],
      }).compileComponents();

      TestBed.inject(SessionService).logIn();
      httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
      httpMock.verify();
      localStorage.clear();
    });

    const flushMicrotasks = () => new Promise((resolve) => setTimeout(resolve, 0));

    it('should navigate to /feed when the feed link is clicked', async () => {
      const harness = await RouterTestingHarness.create('/topics');
      await flushMicrotasks();
      httpMock.expectOne(`${environment.apiUrl}/topics`).flush([]);
      await flushMicrotasks();
      harness.fixture.detectChanges();

      harness.fixture.debugElement.query(By.css('[data-test="link-feed"]')).nativeElement.click();
      await flushMicrotasks();
      harness.fixture.detectChanges();
      await flushMicrotasks();
      httpMock.expectOne((req) => req.url === `${environment.apiUrl}/posts`).flush(EMPTY_PAGE);
      await flushMicrotasks();
      harness.fixture.detectChanges();

      expect(TestBed.inject(Location).path()).toBe('/feed');
    });

    it('should navigate to /topic when the topic link is clicked', async () => {
      const harness = await RouterTestingHarness.create('/feed');
      await flushMicrotasks();
      httpMock.expectOne((req) => req.url === `${environment.apiUrl}/posts`).flush(EMPTY_PAGE);
      await flushMicrotasks();
      harness.fixture.detectChanges();

      harness.fixture.debugElement.query(By.css('[data-test="link-topic"]')).nativeElement.click();
      await flushMicrotasks();
      harness.fixture.detectChanges();
      await flushMicrotasks();
      httpMock.expectOne(`${environment.apiUrl}/topics`).flush([]);
      await flushMicrotasks();
      harness.fixture.detectChanges();

      expect(TestBed.inject(Location).path()).toBe('/topics');
    });

    it('should navigate to /profile when the profile link is clicked', async () => {
      const harness = await RouterTestingHarness.create('/feed');
      await flushMicrotasks();
      httpMock.expectOne((req) => req.url === `${environment.apiUrl}/posts`).flush(EMPTY_PAGE);
      await flushMicrotasks();
      harness.fixture.detectChanges();

      harness.fixture.debugElement.query(By.css('[data-test="link-profile"]')).nativeElement.click();
      await flushMicrotasks();
      harness.fixture.detectChanges();
      await flushMicrotasks();
      httpMock.expectOne(`${environment.apiUrl}/profile`).flush({ name: '', email: '', topics: [] });
      await flushMicrotasks();
      harness.fixture.detectChanges();

      expect(TestBed.inject(Location).path()).toBe('/profile');
    });

    it("should logout when the logout link is clicked", async () => {
      const harness = await RouterTestingHarness.create('/feed');
      await flushMicrotasks();
      httpMock.expectOne((req) => req.url === `${environment.apiUrl}/posts`).flush(EMPTY_PAGE);
      await flushMicrotasks();
      harness.fixture.detectChanges();

      harness.fixture.debugElement.query(By.css('[data-test="btn-logout"]')).nativeElement.click();
      await flushMicrotasks();
      httpMock.expectOne(`${environment.apiUrl}/auth/logout`).flush(null);
      await flushMicrotasks();
      harness.fixture.detectChanges();

      expect(TestBed.inject(SessionService).isAuthenticated).toBe(false);
      expect(TestBed.inject(Location).path()).toBe('/login');
    });
  });
});
