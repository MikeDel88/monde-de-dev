import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { of, throwError } from 'rxjs';
import { EnvironmentProviders, Provider } from '@angular/core';

import { Register } from './register';
import {AuthService} from "../../services/auth-service";
import {provideRouter} from "@angular/router";
import {routes} from "../../../../app.routes";
import {By} from "@angular/platform-browser";
import {RegisterData} from "../../models/register-data";
import {HttpTestingController, provideHttpClientTesting, TestRequest} from "@angular/common/http/testing";
import {environment} from "../../../../../environments/environment";
import {provideHttpClient} from "@angular/common/http";
import {Location} from "@angular/common";
import {RouterTestingHarness} from "@angular/router/testing";
import {SessionService} from "../../../../core/services/session-service";

const VALID_REGISTER_DATA: RegisterData = { name: 'john', email: 'john@test.com', password: 'Azerty123!' };

/**
 * Plan de test
 * ● L'inscription
 * ● La gestion des erreurs
 * ● L'affichage d'erreur en l'absence d'un champ obligatoire
 */
describe('Register', () => {
  let component: Register;
  let fixture: ComponentFixture<Register>;
  let httpMock: HttpTestingController;

  const mockAuthService = {
    register$: jest.fn(),
  };

  const fillForm = (name: string, email: string, password: string) => {
    component.registerForm.name().value.set(name);
    component.registerForm.email().value.set(email);
    component.registerForm.password().value.set(password);
  };

  const resetForm = () => component.registerForm().reset({ name: '', email: '', password: '' });

  const submit = () => {
    fixture.debugElement.query(By.css('form')).triggerEventHandler('submit', new Event('submit'));
    fixture.detectChanges();
  };

  const expectFormWasReset = () => {
    expect(component.registerForm.name().value()).toBe('');
    expect(component.registerForm.email().value()).toBe('');
    expect(component.registerForm.password().value()).toBe('');
  };

  const configureRegister = async (providers: (Provider | EnvironmentProviders)[]): Promise<void> => {
    await TestBed.configureTestingModule({
      imports: [Register],
      providers,
    }).compileComponents();

    fixture = TestBed.createComponent(Register);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  beforeEach(async () => {
    mockAuthService.register$.mockReset();

    await configureRegister([
      { provide: AuthService, useValue: mockAuthService },
    ]);
  });

  describe('Unit Test', () => {

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    describe('Error display form validation', () => {
      it('should display the error message in the DOM when error is true', () => {
        component.error.set('Cet email ou ce nom est déjà utilisé');
        fixture.detectChanges();

        const errorElement = fixture.debugElement.query(By.css('[data-test="error"]'));
        expect(errorElement).toBeTruthy();
      });

      it('should clear the error message on focusin', () => {
        component.error.set('Cet email ou ce nom est déjà utilisé');
        fixture.detectChanges();

        const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
        form.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));

        expect(component.error()).toBeUndefined();
      });
    });

    describe('Form validation', () => {
      it.each([
        ['', false, 'required'],
        ['john', true, []],
      ])('name "%s" → valid=%s, error=%s', (value, valid, expectedError: string | string[]) => {

        component.registerForm.name().value.set(value);

        expect(component.registerForm.name().valid()).toBe(valid);
        if(typeof expectedError === 'string') {
          expect(component.registerForm.name().errors()).toEqual([expect.objectContaining({kind: expectedError})]);
        } else {
          expect(component.registerForm.name().errors()).toEqual([]);
        }
      });

      it.each([
        ['', false, 'required'],
        ['not-an-email', false, 'email'],
        ['john@test.com', true, []],
      ])('email "%s" → valid=%s, error=%s', (value, valid, expectedError: string | string[]) => {

        component.registerForm.email().value.set(value);

        expect(component.registerForm.email().valid()).toBe(valid);
        if(typeof expectedError === 'string') {
          expect(component.registerForm.email().errors()).toEqual([expect.objectContaining({kind: expectedError})]);
        } else {
          expect(component.registerForm.email().errors()).toEqual([]);
        }
      });

      it.each([
        ['', false, 'required'],
        ['Az1!', false, 'minLength'],
        ['azertyuiop', false, 'pattern'],
        ['Azerty123!', true, []],
      ])('password "%s" → valid=%s, error=%s', (value, valid, expectedError: string | string[]) => {

        component.registerForm.password().value.set(value);

        expect(component.registerForm.password().valid()).toBe(valid);
        if(typeof expectedError === 'string') {
          expect(component.registerForm.password().errors()).toEqual(
            expect.arrayContaining([expect.objectContaining({kind: expectedError})])
          );
        } else {
          expect(component.registerForm.password().errors()).toEqual([]);
        }
      });

      it('should not call authService.register$ when the form is invalid on submit', () => {
        resetForm();
        fixture.detectChanges();

        submit();

        expect(mockAuthService.register$).not.toHaveBeenCalled();
      });

      it('should mark every required field as touched and show its error slot when submitting an empty form', () => {
        resetForm();
        fixture.detectChanges();

        submit();

        expect(fixture.debugElement.query(By.css('[data-test="error-name"]'))).toBeTruthy();
        expect(fixture.debugElement.query(By.css('[data-test="error-email"]'))).toBeTruthy();
        expect(fixture.debugElement.query(By.css('[data-test="error-password"]'))).toBeTruthy();
      });
    });

    describe('Submission', () => {

      it('should call authService.register$ with the form values', () => {
        mockAuthService.register$.mockReturnValue(of(undefined));
        fillForm(VALID_REGISTER_DATA.name, VALID_REGISTER_DATA.email, VALID_REGISTER_DATA.password);

        submit();

        expect(mockAuthService.register$).toHaveBeenCalledWith(VALID_REGISTER_DATA);
      });

      it('should prevent the default form submission behavior', () => {
        mockAuthService.register$.mockReturnValue(of(undefined));
        fillForm(VALID_REGISTER_DATA.name, VALID_REGISTER_DATA.email, VALID_REGISTER_DATA.password);

        const event = new Event('submit');
        const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
        component.onSubmit(event);

        expect(preventDefaultSpy).toHaveBeenCalled();
      });

      it('should reset the form and show the success toast on successful registration', () => {
        mockAuthService.register$.mockReturnValue(of(undefined));
        fillForm(VALID_REGISTER_DATA.name, VALID_REGISTER_DATA.email, VALID_REGISTER_DATA.password);

        submit();

        expect(component.showToastSuccessfully()).toBe(true);
        expectFormWasReset();

        const toastAlert = fixture.debugElement.query(By.css('[data-test="toast"] [role="alert"]'));
        expect(toastAlert).toBeTruthy();
      });

      it('should display the error message and not show the toast when authService.register$ fails', () => {
        mockAuthService.register$.mockReturnValue(throwError(() => new Error('Cet email ou ce nom est déjà utilisé')));
        fillForm(VALID_REGISTER_DATA.name, VALID_REGISTER_DATA.email, VALID_REGISTER_DATA.password);

        submit();

        expect(component.error()).toBe('Cet email ou ce nom est déjà utilisé');
        expect(component.showToastSuccessfully()).toBe(false);

        const errorElement = fixture.debugElement.query(By.css('[data-test="error"]'));
        expect(errorElement.nativeElement.textContent).toContain('Cet email ou ce nom est déjà utilisé');

        const toastAlert = fixture.debugElement.query(By.css('[data-test="toast"] [role="alert"]'));
        expect(toastAlert).toBeFalsy();
      });

      it('should hide the toast and clear the error when onReset is triggered', () => {
        mockAuthService.register$.mockReturnValue(of(undefined));
        fillForm(VALID_REGISTER_DATA.name, VALID_REGISTER_DATA.email, VALID_REGISTER_DATA.password);
        submit();
        expect(component.showToastSuccessfully()).toBe(true);

        component.onReset();
        fixture.detectChanges();

        expect(component.showToastSuccessfully()).toBe(false);
        expect(component.error()).toBeUndefined();
      });
    });
  });

  describe('Integration Test (Component + AuthService + HttpClientTesting)', () => {

    beforeEach(async () => {
      TestBed.resetTestingModule();

      await configureRegister([
        provideHttpClient(),
        provideHttpClientTesting(),
      ]);

      httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
      httpMock.verify();
    });

    const submitAndExpectRegisterRequest = (): TestRequest => {
      fillForm(VALID_REGISTER_DATA.name, VALID_REGISTER_DATA.email, VALID_REGISTER_DATA.password);

      submit();

      const req: TestRequest = httpMock.expectOne({ url: `${environment.apiUrl}/auth/register` });
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(VALID_REGISTER_DATA);
      return req;
    };

    it('should not call the API when the form is invalid on submit', () => {
      resetForm();
      fixture.detectChanges();

      submit();

      httpMock.expectNone({ url: `${environment.apiUrl}/auth/register` });
    });

    it('should show the success toast and reset the form on successful registration', () => {
      const req = submitAndExpectRegisterRequest();

      req.flush(null, { status: 204, statusText: 'No Content' });
      fixture.detectChanges();

      expect(component.showToastSuccessfully()).toBe(true);
      expectFormWasReset();
    });

    it('should aggregate field error messages on a 400 response with field errors', () => {
      const req = submitAndExpectRegisterRequest();

      req.flush(
        { status: 400, errors: [{ field: 'email', message: 'Email déjà utilisé' }, { field: 'name', message: "Nom déjà pris" }] },
        { status: 400, statusText: 'Bad Request' }
      );
      fixture.detectChanges();

      expect(component.error()).toBe('Email déjà utilisé, Nom déjà pris');
    });

    it('should fall back to a generic message on a 400 response without field errors', () => {
      const req = submitAndExpectRegisterRequest();

      req.flush({ status: 400 }, { status: 400, statusText: 'Bad Request' });
      fixture.detectChanges();

      expect(component.error()).toBe('Formulaire invalide');
    });

    it('should display the "already registered" message on a 409 response', () => {
      const req = submitAndExpectRegisterRequest();

      req.flush(null, { status: 409, statusText: 'Conflict' });
      fixture.detectChanges();

      expect(component.error()).toBe("Une erreur est survenue, l'utilisateur n'a pas été enregistré");
    });

    it('should display a generic error message on a server error (500)', () => {
      const req = submitAndExpectRegisterRequest();

      req.flush(null, { status: 500, statusText: 'Internal Server Error' });
      fixture.detectChanges();

      expect(component.error()).toBe('Une erreur est survenue, veuillez réessayer plus tard');
    });
  });

  describe('Routing integration (real Router + GuestGuard)', () => {
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

    it('should redirect an already authenticated user away from /register to /feed via GuestGuard', async () => {
      TestBed.inject(SessionService).logIn('existing-token');

      await RouterTestingHarness.create('/register');

      expect(TestBed.inject(Location).path()).toBe('/feed');

      const feedReq = routingHttpMock.expectOne(req => req.url.startsWith(`${environment.apiUrl}/feed`));
      feedReq.flush([]);
    });
  });
});
