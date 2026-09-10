import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { MainLayout } from './main-layout';
import {describe, beforeEach, afterEach, it, expect} from "@jest/globals";
import {By} from "@angular/platform-browser";
import {RouterTestingHarness} from "@angular/router/testing";
import {Location} from "@angular/common";
import {routes} from "../../../app.routes";
import {HttpTestingController, provideHttpClientTesting} from "@angular/common/http/testing";
import {provideHttpClient} from "@angular/common/http";
import {SessionService} from "../../../core/services/session-service";
import {environment} from "../../../../environments/environment";

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

      TestBed.inject(SessionService).logIn('existing-token');
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
      httpMock.expectOne((req) => req.url === `${environment.apiUrl}/feed`).flush([]);
      await flushMicrotasks();
      harness.fixture.detectChanges();

      expect(TestBed.inject(Location).path()).toBe('/feed');
    });

    it('should navigate to /topic when the topic link is clicked', async () => {
      const harness = await RouterTestingHarness.create('/feed');
      await flushMicrotasks();
      httpMock.expectOne((req) => req.url === `${environment.apiUrl}/feed`).flush([]);
      await flushMicrotasks();
      harness.fixture.detectChanges();

      harness.fixture.debugElement.query(By.css('[data-test="link-topic"]')).nativeElement.click();
      await flushMicrotasks();
      httpMock.expectOne(`${environment.apiUrl}/topics`).flush([]);
      await flushMicrotasks();
      harness.fixture.detectChanges();

      expect(TestBed.inject(Location).path()).toBe('/topics');
    });

    it('should navigate to /profile when the profile link is clicked', async () => {
      const harness = await RouterTestingHarness.create('/feed');
      await flushMicrotasks();
      httpMock.expectOne((req) => req.url === `${environment.apiUrl}/feed`).flush([]);
      await flushMicrotasks();
      harness.fixture.detectChanges();

      harness.fixture.debugElement.query(By.css('[data-test="link-profile"]')).nativeElement.click();
      await flushMicrotasks();
      httpMock.expectOne(`${environment.apiUrl}/profile`).flush({ name: '', email: '', topics: [] });
      httpMock.expectOne(`${environment.apiUrl}/topics`).flush([]);
      await flushMicrotasks();
      harness.fixture.detectChanges();

      expect(TestBed.inject(Location).path()).toBe('/profile');
    });

    it("should logout when the logout link is clicked", async () => {
      const harness = await RouterTestingHarness.create('/feed');
      await flushMicrotasks();
      httpMock.expectOne((req) => req.url === `${environment.apiUrl}/feed`).flush([]);
      await flushMicrotasks();
      harness.fixture.detectChanges();

      harness.fixture.debugElement.query(By.css('[data-test="btn-logout"]')).nativeElement.click();
      await flushMicrotasks();
      harness.fixture.detectChanges();

      expect(TestBed.inject(SessionService).isAuthenticated).toBe(false);
      expect(TestBed.inject(Location).path()).toBe('/login');
    });
  });
});
