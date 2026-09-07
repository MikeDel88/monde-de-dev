import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { of, throwError } from 'rxjs';
import { EnvironmentProviders, Provider } from '@angular/core';

import { Login } from './login';
import {AuthService} from "../../services/auth-service";
import {provideRouter, Router} from "@angular/router";
import {routes} from "../../../../app.routes";
import {By} from "@angular/platform-browser";
import {LoginData} from "../../models/login-data";
import {HttpTestingController, provideHttpClientTesting, TestRequest} from "@angular/common/http/testing";
import {environment} from "../../../../../environments/environment";
import {provideHttpClient} from "@angular/common/http";
import {Location} from "@angular/common";
import {RouterTestingHarness} from "@angular/router/testing";
import {SessionService} from "../../../../core/services/session-service";

const VALID_CREDENTIALS: LoginData = { emailOrName: 'test@test.com', password: 'azerty' };

/**
 * Plan de test
 * ● La connexion
 * ● La gestion des erreurs
 * ● L’affichage d’erreur en l’absence d’un champ obligatoire
 */
describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let router: Router;
  let httpMock: HttpTestingController;
  let sessionService: SessionService;

  const mockAuthService = {
    login$: jest.fn(),
  };

  const fillForm = (emailOrName: string, password: string) => {
    component.loginForm.emailOrName().value.set(emailOrName);
    component.loginForm.password().value.set(password);
  };

  const resetForm = () => component.loginForm().reset({ emailOrName: '', password: '' });

  const submit = () => {
    fixture.debugElement.query(By.css('form')).triggerEventHandler('submit', new Event('submit'));
    fixture.detectChanges();
  };

  const expectFormWasReset = () => {
    expect(component.loginForm.emailOrName().value()).toBe('');
    expect(component.loginForm.password().value()).toBe('');
  };

  const configureLogin = async (providers: (Provider | EnvironmentProviders)[]): Promise<void> => {
    await TestBed.configureTestingModule({
      imports: [Login],
      providers,
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.detectChanges();
  };

  beforeEach(async () => {
    mockAuthService.login$.mockReset();

    await configureLogin([
      { provide: AuthService, useValue: mockAuthService },
      { provide: Router, useValue: { navigate: jest.fn() } },
    ]);
  });

  describe('Unit Test', () => {

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    describe("Error display form validation", () => {
      it('should display the error message in the DOM when error is true', () => {
        component.error.set('Invalid credentials');
        fixture.detectChanges();

        const errorElement = fixture.debugElement.query(By.css('[data-test="error"]'));
        expect(errorElement).toBeTruthy();
      });

      it('should not display the error message in the DOM when field is focused', () => {
        component.error.set('Invalid credentials');
        fixture.detectChanges();

        component.loginForm.password().focusBoundControl();
        fixture.detectChanges();

        const errorElement = fixture.debugElement.query(By.css('p[data-test="error"]'));
        expect(errorElement).toBeFalsy();
      });
    });

    describe('Form validation', () => {
      it.each([
        ['', false, 'required'],
        ['test@test.com', true, []],
        ['not-an-email', true, []],
      ])('email "%s" → valid=%s, error=%s', (value, valid, expectedError: string | string[]) => {

        component.loginForm.emailOrName().value.set(value);

        expect(component.loginForm.emailOrName().valid()).toBe(valid);
        if(typeof expectedError === 'string') {
          expect(component.loginForm.emailOrName().errors()).toEqual([expect.objectContaining({kind: expectedError})]);
        } else {
          expect(component.loginForm.emailOrName().errors()).toEqual([]);
        }
      });

      it.each([
        ['', false, 'required'],
        ['azerty', true, []],
      ])('password "%s" → valid=%s, error=%s', (value, valid, expectedError: string | string[]) => {

        component.loginForm.password().value.set(value);

        expect(component.loginForm.password().valid()).toBe(valid);
        if(typeof expectedError === 'string') {
          expect(component.loginForm.password().errors()).toEqual([expect.objectContaining({kind: expectedError})]);
        } else {
          expect(component.loginForm.password().errors()).toEqual([]);
        }
      });

      it('should not call authService.login$ when the form is invalid on submit', () => {
        resetForm();
        fixture.detectChanges();

        submit();

        expect(mockAuthService.login$).not.toHaveBeenCalled();
      });

      it('should mark every required field as touched and show its error slot when submitting an empty form', () => {
        resetForm();
        fixture.detectChanges();

        submit();

        expect(fixture.debugElement.query(By.css('[data-test="error-name"]'))).toBeTruthy();
        expect(fixture.debugElement.query(By.css('[data-test="error-password"]'))).toBeTruthy();
      });
    });

    describe('Submission', () => {

      it('should call authService.login$ with the form values', () => {
        mockAuthService.login$.mockReturnValue(of(true));
        fillForm(VALID_CREDENTIALS.emailOrName, VALID_CREDENTIALS.password);

        submit();

        expect(mockAuthService.login$).toHaveBeenCalledWith(VALID_CREDENTIALS);
      });

      it('should prevent the default form submission behavior', () => {
        mockAuthService.login$.mockReturnValue(of(true));
        fillForm(VALID_CREDENTIALS.emailOrName, VALID_CREDENTIALS.password);

        const event = new Event('submit');
        const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
        component.onSubmit(event);

        expect(preventDefaultSpy).toHaveBeenCalled();
      });

      it('should navigate to /feed and reset the form on successful authentication', () => {
        mockAuthService.login$.mockReturnValue(of(true));
        fillForm(VALID_CREDENTIALS.emailOrName, VALID_CREDENTIALS.password);

        submit();

        expect(router.navigate).toHaveBeenCalledWith(['/feed']);
        expectFormWasReset();
      });

      it('should reset the form but not navigate when authentication is unsuccessful', () => {
        mockAuthService.login$.mockReturnValue(of(false));
        fillForm(VALID_CREDENTIALS.emailOrName, VALID_CREDENTIALS.password);

        submit();

        expect(router.navigate).not.toHaveBeenCalled();
        expectFormWasReset();
      });

      it('should display the error message and not navigate when authService.login$ fails', () => {
        mockAuthService.login$.mockReturnValue(throwError(() => new Error('Invalid credentials')));
        fillForm(VALID_CREDENTIALS.emailOrName, VALID_CREDENTIALS.password);

        submit();

        expect(component.error()).toBe('Invalid credentials');
        expect(router.navigate).not.toHaveBeenCalled();

        const errorElement = fixture.debugElement.query(By.css('[data-test="error"]'));
        expect(errorElement.nativeElement.textContent).toContain('Invalid credentials');
      });
    });
  });

  describe("Integration Test (Component + AuthService + HttpClientTesting)", () => {

    beforeEach(async () => {
      TestBed.resetTestingModule();

      await configureLogin([
        SessionService,
        provideRouter(routes),
        provideHttpClient(),
        provideHttpClientTesting(),
      ]);

      httpMock = TestBed.inject(HttpTestingController);
      sessionService = TestBed.inject(SessionService);
    });

    afterEach(() => {
      httpMock.verify();
      localStorage.clear();
    });

    const submitAndExpectLoginRequest = (): TestRequest => {
      fillForm(VALID_CREDENTIALS.emailOrName, VALID_CREDENTIALS.password);

      submit();

      const req: TestRequest = httpMock.expectOne({ url: `${environment.apiUrl}/auth/login` });
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(VALID_CREDENTIALS);
      return req;
    };

    it('should connexion is success', () => {
      const req = submitAndExpectLoginRequest();

      req.flush({ token: 'fake-jwt-token' });
      fixture.detectChanges();

      expect(router.navigate).toHaveBeenCalledWith(['/feed']);
    });

    it('should display the "invalid credentials" message and not navigate on a 401 response', () => {
      const req = submitAndExpectLoginRequest();

      req.flush(null, { status: 401, statusText: 'Unauthorized' });
      fixture.detectChanges();

      expect(component.error()).toBe("Une erreur est survenue. Vérifier le couple email ou nom d'utilisateur et mot de passe");
      expect(router.navigate).not.toHaveBeenCalled();

      const errorElement = fixture.debugElement.query(By.css('[data-test="error"]'));
      expect(errorElement.nativeElement.textContent).toContain("Vérifier le couple email ou nom d'utilisateur et mot de passe");
    });

    it('should display a generic error message and not navigate on a server error (500)', () => {
      const req = submitAndExpectLoginRequest();

      req.flush(null, { status: 500, statusText: 'Internal Server Error' });
      fixture.detectChanges();

      expect(component.error()).toBe('Une erreur est survenue, veuillez réessayer plus tard');
      expect(router.navigate).not.toHaveBeenCalled();

      const errorElement = fixture.debugElement.query(By.css('[data-test="error"]'));
      expect(errorElement.nativeElement.textContent).toContain('Une erreur est survenue, veuillez réessayer plus tard');
    });

    it('should persist the session (token + isAuthenticated) after a successful login', () => {
      const req = submitAndExpectLoginRequest();

      req.flush({ token: 'fake-jwt-token' });
      fixture.detectChanges();

      expect(sessionService.isAuthenticated).toBe(true);
      expect(sessionService.getToken()).toBe('fake-jwt-token');
    });

  });

  describe('Routing integration (real Router + Guards)', () => {
    let routingHttpMock: HttpTestingController;

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

      routingHttpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
      routingHttpMock.verify();
      localStorage.clear();
    });

    const flushFeedRequest = () => {
      const feedReq = routingHttpMock.expectOne(req => req.url.startsWith(`${environment.apiUrl}/feed`));
      feedReq.flush([]);
    };

    it('should really navigate to /feed once AuthGuard allows it after a successful login', async () => {
      const harness = await RouterTestingHarness.create('/login');
      const loginComponent = harness.fixture.debugElement.query(By.directive(Login)).componentInstance as Login;

      loginComponent.loginForm.emailOrName().value.set(VALID_CREDENTIALS.emailOrName);
      loginComponent.loginForm.password().value.set(VALID_CREDENTIALS.password);

      harness.fixture.debugElement.query(By.css('form')).triggerEventHandler('submit', new Event('submit'));
      harness.detectChanges();

      const loginReq = routingHttpMock.expectOne({ url: `${environment.apiUrl}/auth/login` });
      loginReq.flush({ token: 'fake-jwt-token' });

      await harness.fixture.whenStable();
      harness.detectChanges();
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(TestBed.inject(Location).path()).toBe('/feed');

      flushFeedRequest();
    });

    it('should redirect an already authenticated user away from /login to /feed via GuestGuard', async () => {
      TestBed.inject(SessionService).logIn('existing-token');

      await RouterTestingHarness.create('/login');

      expect(TestBed.inject(Location).path()).toBe('/feed');

      flushFeedRequest();
    });
  });
});
