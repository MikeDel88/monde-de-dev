import {Component, DestroyRef, effect, inject, signal, Signal, WritableSignal} from '@angular/core';
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
import {Dividers} from "../../../shared/components/divider/dividers";
import {Error} from "../../../shared/components/error/error";
import {Input} from "../../../shared/components/input/input";
import {Title} from "../../../shared/components/title/title";
import {Loader} from "../../../shared/components/loader/loader";
import {validatePasswordStrength} from "../../../shared/validators/password-strength-validator";
import {Toast} from "../../../shared/components/toast/toast";
import {createErrorState} from "../../../shared/utils/error-state";


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
  imports: [TopicCard, FormField, ConfirmPasswordModal, Button, Dividers, Error, Input, Title, Loader, Toast],
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
  readonly titleProfilUser: string = "Profil utilisateur";
  readonly btnSaveProfilUser: string = "Sauvegarder";
  readonly placeholderPassword: string = "Nouveau mot de passe"

  showToastSuccess = signal({message: "", visible: false})
  private readonly errorState = createErrorState();
  error: Signal<string | undefined> = this.errorState.error;
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

  onCloseToastSuccessed() {
    this.showToastSuccess.set({message: "", visible: false});
  }

  onUpdateProfilSuccess(message: string) {
    this.errorState.clear();
    this.showToastSuccess.set({message, visible: true});
    setTimeout(() => {
      this.showToastSuccess.set({message: "", visible: false});
    }, 2000)
  }

  onFocus(): void {
    this.errorState.clear();
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
          this.onUpdateProfilSuccess("Le profil a bien été mis à jour!");
        },
        error: (err) => {
          this.profile.reload();
          this.errorState.setFromError(err);
        }
      });
  }

  onUnsubscribe(topicId: number) {
    this.topicService.unsubscribe$(topicId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        complete: () => {
          this.errorState.clear();
          this.profile.reload();
        },
        error: (err) => this.errorState.setFromError(err),
      })
  }
}
