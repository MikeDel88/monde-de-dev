import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { of, throwError } from 'rxjs';
import { EnvironmentProviders, Provider, signal, WritableSignal } from '@angular/core';
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
 * Vérifie que password changé, alors on affiche le modal lors du click sauvegarder.
 * Vérifie l'affichage de la liste des topics
 * Vérifie que lors du click sur désabonnement, on reload et on ne voit plus le topic.
 */
describe('Profile', () => {
  let component: Profile;
  let fixture: ComponentFixture<Profile>;

  let mockProfileValue: WritableSignal<ProfileResponse>;
  let mockProfileHasValue: WritableSignal<boolean>;
  let mockProfileIsLoading: WritableSignal<boolean>;
  let mockProfileError: WritableSignal<Error | undefined>;

  const mockProfileService = {
    profile: {
      hasValue: () => mockProfileHasValue(),
      value: () => mockProfileValue(),
      isLoading: () => mockProfileIsLoading(),
      error: () => mockProfileError(),
      reload: jest.fn(),
      set: jest.fn((value: ProfileResponse) => mockProfileValue.set(value)),
    },
    updateProfile$: jest.fn(),
    updatePassword$: jest.fn(),
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

  beforeEach(async () => {
    HTMLDialogElement.prototype.showModal = jest.fn(function (this: HTMLDialogElement) {
      this.open = true;
    });
    HTMLDialogElement.prototype.close = jest.fn(function (this: HTMLDialogElement) {
      this.open = false;
    });

    mockProfileValue = signal(MOCK_PROFIL);
    mockProfileHasValue = signal(true);
    mockProfileIsLoading = signal(false);
    mockProfileError = signal<Error | undefined>(undefined);

    mockProfileService.profile.reload.mockReset();
    mockProfileService.profile.set.mockReset();
    mockProfileService.profile.set.mockImplementation((value: ProfileResponse) => mockProfileValue.set(value));
    mockProfileService.updateProfile$.mockReset();
    mockProfileService.updatePassword$.mockReset();
    mockTopicService.unsubscribe$.mockReset();

    await configureProfile([
      { provide: ProfileService, useValue: mockProfileService },
      { provide: TopicService, useValue: mockTopicService },
    ]);
  });

  describe('Unit Test', () => {

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
      it('should call updateProfil$ with dirty name and email', () => {
        mockProfileService.updateProfile$.mockReturnValue(of({ ...MOCK_PROFIL, name: 'Jane', email: 'jane@test.com' }));
        setDirtyValue(component.profileForm.name, 'Jane');
        setDirtyValue(component.profileForm.email, 'jane@test.com');

        submit();

        expect(mockProfileService.updateProfile$).toHaveBeenCalledWith('jane@test.com', 'Jane');
      });

      it('should not call updateProfil$ when only the password changed', () => {
        setDirtyValue(component.profileForm.password, 'ValidPass1!');

        submit();

        expect(mockProfileService.updateProfile$).not.toHaveBeenCalled();
      });

      it('should update the profile value on successful submission', () => {
        const updated = { ...MOCK_PROFIL, name: 'Jane' };
        mockProfileService.updateProfile$.mockReturnValue(of(updated));
        setDirtyValue(component.profileForm.name, 'Jane');

        submit();

        expect(component.profile.value()).toEqual(updated);
        expect(component.error()).toBeUndefined();
      });

      it('should display an error message when updateProfil$ fails', () => {
        mockProfileService.updateProfile$.mockReturnValue(throwError(() => new Error('fail')));
        setDirtyValue(component.profileForm.name, 'Jane');

        submit();

        const errorElement = fixture.debugElement.query(By.css('p[data-test="error"]'));
        expect(errorElement.nativeElement.textContent).toContain("Une erreur est survenue, le profil n'a pas été mis à jour.");
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

      it('should call updatePassword$ with the pending and current password on confirmation', () => {
        mockProfileService.updatePassword$.mockReturnValue(of(undefined));
        setDirtyValue(component.profileForm.password, 'ValidPass1!');
        submit();

        component.onConfirmPassword('CurrentPass1!');

        expect(mockProfileService.updatePassword$).toHaveBeenCalledWith('ValidPass1!', 'CurrentPass1!');
        expect(component.showPasswordModal()).toBe(false);
      });

      it('should reset the password field on successful password update', () => {
        mockProfileService.updatePassword$.mockReturnValue(of(undefined));
        setDirtyValue(component.profileForm.password, 'ValidPass1!');
        submit();

        component.onConfirmPassword('CurrentPass1!');

        expect(component.profileForm.password().value()).toBe('');
      });

      it('should display an error message when updatePassword$ fails', () => {
        mockProfileService.updatePassword$.mockReturnValue(throwError(() => new Error('fail')));
        setDirtyValue(component.profileForm.password, 'ValidPass1!');
        submit();

        component.onConfirmPassword('CurrentPass1!');
        fixture.detectChanges();

        const errorElement = fixture.debugElement.query(By.css('p[data-test="error"]'));
        expect(errorElement.nativeElement.textContent).toContain("Une erreur est survenue, le mot de passe n'a pas été mis à jour.");
      });
    });

    describe('Topics list', () => {
      it('should not display the topics section when there are none', () => {
        expect(fixture.debugElement.query(By.directive(TopicCard))).toBeFalsy();
      });

      it('should display the topics when there are some', () => {
        mockProfileValue.set({ ...MOCK_PROFIL, topics: [MOCK_TOPIC] });
        fixture.detectChanges();

        const topicCard = fixture.debugElement.query(By.directive(TopicCard));
        expect(topicCard).toBeTruthy();
        expect(topicCard.componentInstance.topic()).toEqual(MOCK_TOPIC);

        const text = fixture.nativeElement.textContent as string;
        expect(text).toContain(MOCK_TOPIC.title);
      });

      it('should call unsubscribe$ and reload, then remove the topic from the list', () => {
        mockProfileValue.set({ ...MOCK_PROFIL, topics: [MOCK_TOPIC] });
        fixture.detectChanges();

        mockTopicService.unsubscribe$.mockReturnValue(of(undefined));
        mockProfileService.profile.reload.mockImplementation(() => {
          mockProfileValue.set({ ...MOCK_PROFIL, topics: [] });
        });

        fixture.debugElement.query(By.css('app-topic-card button')).nativeElement.click();
        fixture.detectChanges();

        expect(mockTopicService.unsubscribe$).toHaveBeenCalledWith(MOCK_TOPIC.id);
        expect(mockProfileService.profile.reload).toHaveBeenCalled();
        expect(fixture.debugElement.query(By.directive(TopicCard))).toBeFalsy();
      });
    });
  });

  describe('Integration Test (Component + ProfileService/TopicService + HttpClientTesting)', () => {

    let httpMock: HttpTestingController;

    beforeEach(async () => {
      TestBed.resetTestingModule();

      await configureProfile([
        provideHttpClient(),
        provideHttpClientTesting(),
      ]);

      httpMock = TestBed.inject(HttpTestingController);
      httpMock.expectOne(`${environment.apiUrl}/topics`).flush([]);
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

      const req = httpMock.expectOne({ url: `${environment.apiUrl}/profile` });
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ email: null, name: 'Jane' });

      req.flush({ ...MOCK_PROFIL, name: 'Jane' });
    });

    it('should call DELETE /topics/:id/subscribe and reload the profile on unsubscribe', async () => {
      await flushProfile({ ...MOCK_PROFIL, topics: [MOCK_TOPIC] });

      fixture.debugElement.query(By.css('app-topic-card button')).nativeElement.click();

      const req = httpMock.expectOne({ url: `${environment.apiUrl}/topics/${MOCK_TOPIC.id}/subscribe` });
      expect(req.request.method).toBe('DELETE');
      req.flush(null, { status: 204, statusText: 'No Content' });
      await flushMicrotasks();

      await flushProfile({ ...MOCK_PROFIL, topics: [] });

      expect(fixture.debugElement.query(By.directive(TopicCard))).toBeFalsy();
    });
  });
});
