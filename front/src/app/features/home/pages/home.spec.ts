import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Home } from './home';
import {describe, beforeEach, afterEach, expect, it} from "@jest/globals";
import {provideRouter} from "@angular/router";
import {routes} from "../../../app.routes";
import {By} from "@angular/platform-browser";
import {Location} from "@angular/common";
import {RouterTestingHarness} from "@angular/router/testing";

/**
 * Plan de test
 * Vérifie que le logo soit bien affiché
 * Vérifie qur les deux boutons "se connecter" et "s'inscrire" soient présent.
 * Test de la navigation lors des clicks sur les liens.
 */
describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [provideRouter(routes)],
    })
    .compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it("should display the logo", () => {
    const logo = fixture.nativeElement.querySelector('app-logo');
    expect(logo).toBeTruthy();
  });

  it('should display the login and register links', () => {
    const loginLink = fixture.debugElement.query(By.css('[data-test="login"]'));
    const registerLink = fixture.debugElement.query(By.css('[data-test="register"]'));

    expect(loginLink).toBeTruthy();
    expect(registerLink).toBeTruthy();
  });

  describe('Navigation', () => {

    afterEach(() => {
      localStorage.clear();
    });

    it('should navigate to /login when the login link is clicked', async () => {
      const harness = await RouterTestingHarness.create('/');

      harness.fixture.debugElement.query(By.css('[data-test="login"]')).nativeElement.click();
      await harness.fixture.whenStable();

      expect(TestBed.inject(Location).path()).toBe('/login');
    });

    it('should navigate to /register when the register link is clicked', async () => {
      const harness = await RouterTestingHarness.create('/');

      harness.fixture.debugElement.query(By.css('[data-test="register"]')).nativeElement.click();
      await harness.fixture.whenStable();

      expect(TestBed.inject(Location).path()).toBe('/register');
    });
  });
});
