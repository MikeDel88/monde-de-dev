import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { of, throwError } from 'rxjs';
import { EnvironmentProviders, Provider } from '@angular/core';
import { By } from '@angular/platform-browser';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { Profile } from './profile';
import { ProfileResponse } from '../models/profile-response';
import { ProfileService } from '../services/profile-service';
import { TopicService } from '../../topic/services/topic-service';
import { Topic } from '../../topic/models/topic';
import { TopicCard } from '../../../shared/components/topic-card/topic-card';
import { environment } from '../../../../environments/environment';

const MOCK_TOPIC: Topic = {
  id: 1,
  title: 'Angular',
  description: 'Le framework Angular',
  subscribed: true,
};

const MOCK_PROFIL: ProfileResponse = {
  name: 'John',
  email: 'john.doe@test.com',
  topics: [],
};

/**
 * Plan de test
 * Vérifie que le titre est bien présent.
 * Vérifie que le formulaire est bien rempli (nom, email) mais pas password.
 * Vérifie le formulaire (nom, email, password)
 * Vérifie que la modale de confirmation du mot de passe s'affiche lors du submit d'un formulaire valide.
 * Vérifie l'affichage de la liste des topics
 * Vérifie que lors du click sur désabonnement, on reload et on ne voit plus le topic.
 */
describe('Profile', () => {
  let component: Profile;
  let fixture: ComponentFixture<Profile>;

  const mockProfileService = {
    path: `${environment.apiUrl}/profile`,
    updateProfile$: jest.fn(),
  };

  const mockTopicService = {
    unsubscribe$: jest.fn(),
  };

  const flushMicrotasks = () => new Promise((resolve) => setTimeout(resolve, 0));

  const submit = () => {
    fixture.debugElement.query(By.css('form')).triggerEventHandler('submit', new Event('submit'));
    fixture.detectChanges();
  };

  const setDirtyValue = (field: () => { value: { set(v: string): void }; markAsDirty(): void }, value: string) => {
    field().value.set(value);
    field().markAsDirty();
  };

  const configureProfile = async (providers: (Provider | EnvironmentProviders)[]): Promise<void> => {
    await TestBed.configureTestingModule({
      imports: [Profile],
      providers,
    }).compileComponents();

    fixture = TestBed.createComponent(Profile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  beforeEach(() => {
    HTMLDialogElement.prototype.showModal = jest.fn(function (this: HTMLDialogElement) {
      this.open = true;
    });
    HTMLDialogElement.prototype.close = jest.fn(function (this: HTMLDialogElement) {
      this.open = false;
    });
  });

  describe('Unit Test', () => {
    let httpMock: HttpTestingController;

    const flushProfile = async (profile: ProfileResponse = MOCK_PROFIL) => {
      const req = httpMock.expectOne(`${environment.apiUrl}/profile`);
      req.flush(profile);
      await flushMicrotasks();
      fixture.detectChanges();
    };

    beforeEach(async () => {
      mockProfileService.updateProfile$.mockReset();
      mockTopicService.unsubscribe$.mockReset();

      await configureProfile([
        { provide: ProfileService, useValue: mockProfileService },
        { provide: TopicService, useValue: mockTopicService },
        provideHttpClient(),
        provideHttpClientTesting(),
      ]);

      httpMock = TestBed.inject(HttpTestingController);
      await flushProfile();
    });

    afterEach(() => {
      httpMock.verify();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should title is present', () => {
      const title = fixture.nativeElement.querySelector('app-title');
      expect(title).toBeTruthy();
    });

    it('should form is valid', () => {
      const name = fixture.nativeElement.querySelector('app-input[data-test="name"]');
      expect(name).toBeTruthy();

      const email = fixture.nativeElement.querySelector('app-input[data-test="email"]');
      expect(email).toBeTruthy();

      const password = fixture.nativeElement.querySelector('app-input[data-test="password"]');
      expect(password).toBeTruthy();

      const error = fixture.nativeElement.querySelector('p[data-test="error"]');
      expect(error).toBeFalsy();

      const button = fixture.nativeElement.querySelector('app-button');
      expect(button).toBeTruthy();

      const submitBtn = fixture.debugElement.query(By.css('button[type="submit"]')).nativeElement as HTMLButtonElement;
      expect(submitBtn.disabled).toBeTruthy();
    });

    it('should form name and email are not empty but password is empty', () => {
      const name = component.profileForm.name().value();
      expect(name).toBe('John');

      const email = component.profileForm.email().value();
      expect(email).toBe('john.doe@test.com');

      const password = component.profileForm.password().value();
      expect(password).toBe('');
    });

    describe('Form validation', () => {
      it.each([
        ['john@test.com', true, []],
        ['not-an-email', false, 'email'],
      ])('email "%s" → valid=%s', (value, valid, expectedError: string | string[]) => {
        component.profileForm.email().value.set(value);

        expect(component.profileForm.email().valid()).toBe(valid);
        if (typeof expectedError === 'string') {
          expect(component.profileForm.email().errors()).toEqual([expect.objectContaining({ kind: expectedError })]);
        } else {
          expect(component.profileForm.email().errors()).toEqual([]);
        }
      });

      it.each([
        ['Aa1!aaa', false, 'minLength'],
        ['abcdefgh1!', false, 'pattern'],
        ['ValidPass1!', true, []],
      ])('password "%s" → valid=%s', (value, valid, expectedError: string | string[]) => {
        component.profileForm.password().value.set(value);

        expect(component.profileForm.password().valid()).toBe(valid);
        if (typeof expectedError === 'string') {
          expect(component.profileForm.password().errors()).toContainEqual(expect.objectContaining({ kind: expectedError }));
        } else {
          expect(component.profileForm.password().errors()).toEqual([]);
        }
      });
    });

    describe('Submit name/email', () => {
      it('should open the password confirmation modal on submit without calling updateProfile$', () => {
        setDirtyValue(component.profileForm.name, 'Jane');
        setDirtyValue(component.profileForm.email, 'jane@test.com');

        submit();

        expect(component.showPasswordModal()).toBe(true);
        expect(mockProfileService.updateProfile$).not.toHaveBeenCalled();
      });

      it('should call updateProfile$ with the dirty name and email once the password is confirmed', () => {
        mockProfileService.updateProfile$.mockReturnValue(of({ ...MOCK_PROFIL, name: 'Jane', email: 'jane@test.com' }));
        setDirtyValue(component.profileForm.name, 'Jane');
        setDirtyValue(component.profileForm.email, 'jane@test.com');

        submit();
        component.onConfirmPassword('CurrentPass1!');

        expect(mockProfileService.updateProfile$).toHaveBeenCalledWith('jane@test.com', 'Jane', null, 'CurrentPass1!');
      });

      it('should update the profile value on successful submission', () => {
        const updated = { ...MOCK_PROFIL, name: 'Jane' };
        mockProfileService.updateProfile$.mockReturnValue(of(updated));
        setDirtyValue(component.profileForm.name, 'Jane');

        submit();
        component.onConfirmPassword('CurrentPass1!');

        expect(component.profile.value()).toEqual(updated);
        expect(component.error()).toBeUndefined();
      });

      it('should display an error message when updateProfile$ fails', async () => {
        mockProfileService.updateProfile$.mockReturnValue(throwError(() => new Error('fail')));
        setDirtyValue(component.profileForm.name, 'Jane');

        submit();
        component.onConfirmPassword('CurrentPass1!');
        fixture.detectChanges();

        const errorElement = fixture.debugElement.query(By.css('p[data-test="error"]'));
        expect(errorElement.nativeElement.textContent).toContain('fail');

        await flushProfile();
      });
    });

    describe('Password change modal', () => {
      it('should display the modal when a valid new password is submitted', () => {
        setDirtyValue(component.profileForm.password, 'ValidPass1!');

        submit();

        expect(component.showPasswordModal()).toBe(true);
      });

      it('should not display the modal when the password is invalid', () => {
        setDirtyValue(component.profileForm.password, 'short');

        submit();

        expect(component.showPasswordModal()).toBe(false);
      });

      it('should call updateProfile$ with the dirty password and current password on confirmation', () => {
        mockProfileService.updateProfile$.mockReturnValue(of({ ...MOCK_PROFIL }));
        setDirtyValue(component.profileForm.password, 'ValidPass1!');
        submit();

        component.onConfirmPassword('CurrentPass1!');

        expect(mockProfileService.updateProfile$).toHaveBeenCalledWith(null, null, 'ValidPass1!', 'CurrentPass1!');
        expect(component.showPasswordModal()).toBe(false);
      });

      it('should reset the password field on successful password update', () => {
        mockProfileService.updateProfile$.mockReturnValue(of({ ...MOCK_PROFIL }));
        setDirtyValue(component.profileForm.password, 'ValidPass1!');
        submit();

        component.onConfirmPassword('CurrentPass1!');

        expect(component.profileForm.password().value()).toBe('');
      });

      it('should display an error message when updateProfile$ fails', async () => {
        mockProfileService.updateProfile$.mockReturnValue(throwError(() => new Error('fail')));
        setDirtyValue(component.profileForm.password, 'ValidPass1!');
        submit();

        component.onConfirmPassword('CurrentPass1!');
        fixture.detectChanges();

        const errorElement = fixture.debugElement.query(By.css('p[data-test="error"]'));
        expect(errorElement.nativeElement.textContent).toContain('fail');

        await flushProfile();
      });
    });

    describe('Topics list', () => {
      it('should not display the topics section when there are none', () => {
        expect(fixture.debugElement.query(By.directive(TopicCard))).toBeFalsy();
      });

      it('should display the topics when there are some', () => {
        component.profile.set({ ...MOCK_PROFIL, topics: [MOCK_TOPIC] });
        fixture.detectChanges();

        const topicCard = fixture.debugElement.query(By.directive(TopicCard));
        expect(topicCard).toBeTruthy();
        expect(topicCard.componentInstance.topic()).toEqual(MOCK_TOPIC);

        const text = fixture.nativeElement.textContent as string;
        expect(text).toContain(MOCK_TOPIC.title);
      });

      it('should call unsubscribe$ and reload, then remove the topic from the list', async () => {
        component.profile.set({ ...MOCK_PROFIL, topics: [MOCK_TOPIC] });
        fixture.detectChanges();

        mockTopicService.unsubscribe$.mockReturnValue(of(undefined));

        fixture.debugElement.query(By.css('app-topic-card button')).nativeElement.click();
        fixture.detectChanges();

        expect(mockTopicService.unsubscribe$).toHaveBeenCalledWith(MOCK_TOPIC.id);

        await flushProfile({ ...MOCK_PROFIL, topics: [] });

        expect(fixture.debugElement.query(By.directive(TopicCard))).toBeFalsy();
      });

      it('should display an error message when unsubscribe$ fails', () => {
        mockTopicService.unsubscribe$.mockReturnValue(throwError(() => new Error('fail')));

        component.onUnsubscribe(MOCK_TOPIC.id);
        fixture.detectChanges();

        const errorElement = fixture.debugElement.query(By.css('p[data-test="error"]'));
        expect(errorElement.nativeElement.textContent).toContain('fail');
      });
    });
  });

  describe('Integration Test (Component + ProfileService/TopicService + HttpClientTesting)', () => {

    let httpMock: HttpTestingController;

    const configureIntegrationProfile = async () => {
      await TestBed.configureTestingModule({
        imports: [Profile],
        providers: [provideHttpClient(), provideHttpClientTesting()],
      }).compileComponents();

      fixture = TestBed.createComponent(Profile);
      component = fixture.componentInstance;
      fixture.detectChanges();
    };

    beforeEach(async () => {
      TestBed.resetTestingModule();

      await configureIntegrationProfile();

      httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
      httpMock.verify();
    });

    const flushProfile = async (profile: ProfileResponse = MOCK_PROFIL) => {
      const req = httpMock.expectOne(`${environment.apiUrl}/profile`);
      req.flush(profile);
      await flushMicrotasks();
      fixture.detectChanges();
    };

    it('should fetch and display the profile from the real ProfileService', async () => {
      await flushProfile();

      const name = fixture.nativeElement.querySelector('app-input[data-test="name"]');
      expect(name).toBeTruthy();
      expect(component.profileForm.name().value()).toBe(MOCK_PROFIL.name);
    });

    it('should call PATCH /profile when the name is updated', async () => {
      await flushProfile();
      setDirtyValue(component.profileForm.name, 'Jane');

      submit();
      component.onConfirmPassword('CurrentPass1!');

      const req = httpMock.expectOne({ url: `${environment.apiUrl}/profile` });
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ email: null, name: 'Jane', password: null, currentPassword: 'CurrentPass1!' });

      req.flush({ ...MOCK_PROFIL, name: 'Jane' });
    });

    it('should call DELETE /topics/:id/subscribe and reload the profile on unsubscribe', async () => {
      await flushProfile({ ...MOCK_PROFIL, topics: [MOCK_TOPIC] });

      fixture.debugElement.query(By.css('app-topic-card button')).nativeElement.click();

      const req = httpMock.expectOne({ url: `${environment.apiUrl}/topics/${MOCK_TOPIC.id}/subscribe` });
      expect(req.request.method).toBe('DELETE');
      req.flush(null, { status: 204, statusText: 'No Content' });
      await flushMicrotasks();
      fixture.detectChanges();

      await flushProfile({ ...MOCK_PROFIL, topics: [] });

      expect(fixture.debugElement.query(By.directive(TopicCard))).toBeFalsy();
    });
  });
});
