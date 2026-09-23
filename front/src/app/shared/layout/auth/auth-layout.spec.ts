import { ComponentFixture, TestBed } from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import {RouterTestingHarness} from '@angular/router/testing';
import {Location} from '@angular/common';

import { AuthLayout } from './auth-layout';
import {describe, expect, beforeEach, afterEach, it, jest} from "@jest/globals";
import {By} from "@angular/platform-browser";
import {routes} from "../../../app.routes";

describe('AuthLayout', () => {
  let component: AuthLayout;
  let fixture: ComponentFixture<AuthLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthLayout],
      providers: [provideRouter(routes)],
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it("should have button back", () => {
    const btnBack = fixture.nativeElement.querySelector('app-back');
    expect(btnBack).toBeTruthy();
  });

  it("should have a title level 1", () => {
    const titleLevel = fixture.nativeElement.querySelector('app-title h1');
    expect(titleLevel).toBeTruthy();
  });

  it("should have the logo", () => {
    const logo = fixture.nativeElement.querySelector('app-logo');
    expect(logo).toBeTruthy();
  });

  describe('Route title', () => {
    afterEach(() => {
      localStorage.clear();
    });

    it('should display the route title when navigating to /login', async () => {
      const harness = await RouterTestingHarness.create('/login');
      await harness.fixture.whenStable();

      const title = harness.fixture.debugElement.query(By.css('app-title')).nativeElement as HTMLElement;
      expect(title.textContent).toContain('Se connecter');
    });

    it('should update the title when navigating to /register', async () => {
      const harness = await RouterTestingHarness.create('/login');
      await harness.navigateByUrl('/register');
      await harness.fixture.whenStable();

      const title = harness.fixture.debugElement.query(By.css('app-title')).nativeElement as HTMLElement;
      expect(title.textContent).toContain('Inscription');
    });
  });

  describe('Back navigation', () => {
    afterEach(() => {
      localStorage.clear();
    });

    it('should call onBack when the back button is clicked', () => {
      const onBackSpy = jest.spyOn(component, 'onBack');

      fixture.debugElement.query(By.css('[data-test="btn-back"]')).nativeElement.click();

      expect(onBackSpy).toHaveBeenCalledTimes(1);
    });

    it('should navigate to / when the back button is clicked', async () => {
      const harness = await RouterTestingHarness.create('/login');
      await harness.fixture.whenStable();

      harness.fixture.debugElement.query(By.css('[data-test="btn-back"]')).nativeElement.click();
      await harness.fixture.whenStable();

      expect(TestBed.inject(Location).path()).toBe('');
    });
  });
});
