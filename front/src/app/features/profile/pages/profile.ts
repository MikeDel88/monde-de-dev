import {Component, DestroyRef, effect, inject, signal, WritableSignal} from '@angular/core';
import {httpResource, HttpResourceRef} from "@angular/common/http";
import {ProfileService} from "../services/profile-service";
import {ProfileResponse} from "../models/profile-response";
import {TopicCard} from "../../../shared/components/topic-card/topic-card";
import {ConfirmPasswordModal} from "../components/confirm-password-modal/confirm-password-modal";
import {
  email,
  FieldTree,
  form,
  FormField,
  SchemaPathTree
} from "@angular/forms/signals";
import {TopicService} from "../../topic/services/topic-service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {Button} from "../../../shared/components/button/button";
import {Dividers} from "../../../shared/components/dividers/dividers";
import {ErrorMessage} from "../../../shared/components/error-message/error-message";
import {Input} from "../../../shared/components/input/input";
import {Title} from "../../../shared/components/title/title";
import {Loader} from "../../../shared/components/loader/loader";
import {validatePasswordStrength} from "../../../shared/validators/password-strength-validator";
import {ToastService} from "../../../core/services/toast-service";


export interface ProfileData {
  name: string;
  email: string,
  password: string,
}

const initialProfileData: ProfileData = {
  name: "",
  email: "",
  password: ""
};

const validationProfileForm = (schemaPath: SchemaPathTree<ProfileData>) => {
  email(schemaPath.email, {message: 'Email invalide'});
  validatePasswordStrength(schemaPath.password);
};

@Component({
  selector: 'app-profile',
  imports: [TopicCard, FormField, ConfirmPasswordModal, Button, Dividers, ErrorMessage, Input, Title, Loader],
  templateUrl: './profile.html',
})
export class Profile {

  private profileService: ProfileService = inject(ProfileService);
  profile: HttpResourceRef<ProfileResponse | undefined> = httpResource<ProfileResponse>(() =>
    ({ url: this.profileService.path })
  );

  private topicService: TopicService = inject(TopicService);
  private destroyRef: DestroyRef = inject(DestroyRef);

  readonly btnUnsubscribed: string = "Se désabonner";
  readonly titleSubscription: string= "Abonnements";
  readonly titleProfileUser: string = "Profil utilisateur";
  readonly btnSaveProfileUser: string = "Sauvegarder";
  readonly placeholderPassword: string = "Nouveau mot de passe"

  private readonly toastService = inject(ToastService);
  showPasswordModal: WritableSignal<boolean> = signal(false);
  profileModel: WritableSignal<ProfileData> = signal<ProfileData>(initialProfileData);
  profileForm: FieldTree<ProfileData> = form(this.profileModel, validationProfileForm);

  constructor() {
    effect(() => {
      if (this.profile.hasValue()) {
        const value = this.profile.value();
        this.profileModel.set({name: value.name, email: value.email, password: ''});
      }
    });
  }

  onUpdateProfileSuccess(message: string) {
    this.toastService.showSuccess(message);
  }

  onFocus(): void {
    this.toastService.clear();
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    this.profileForm().markAsTouched()
    if(this.profileForm().invalid()) {
      return;
    }
    this.showPasswordModal.set(true);
  }

  onConfirmPassword(currentPassword: string): void {
    this.showPasswordModal.set(false);
    if(this.profileForm().invalid()) {
      return;
    }
    const name: string | null = this.profileForm.name().dirty() ? this.profileForm.name().value() : null;
    const email: string | null = this.profileForm.email().dirty() ? this.profileForm.email().value() : null;
    const password: string | null = this.profileForm.password().dirty() ? this.profileForm.password().value() : null;
    this.profileService.updateProfile$(email, name, password, currentPassword)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (value) => {
          this.profile.set(value);
          this.profileForm().reset({name: value.name, email: value.email, password: ''});
          this.onUpdateProfileSuccess("Le profil a bien été mis à jour!");
        },
        error: (err) => {
          this.profile.reload();
          this.toastService.showError(err);
        }
      });
  }

  onUnsubscribe(topicId: number) {
    this.topicService.unsubscribe$(topicId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        complete: () => {
          this.toastService.clear();
          this.profile.reload();
        },
        error: (err) => this.toastService.showError(err),
      })
  }
}
