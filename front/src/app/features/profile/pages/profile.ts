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
import {Dividers} from "../../../shared/components/divider/dividers";
import {Error} from "../../../shared/components/error/error";
import {Input} from "../../../shared/components/input/input";
import {Title} from "../../../shared/components/title/title";
import {Loader} from "../../../shared/components/loader/loader";
import {validatePasswordStrength} from "../../../shared/validators/password-strength-validator";
import {Toast} from "../../../shared/components/toast/toast";
import {environment} from "../../../../environments/environment";


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

  private profilService: ProfileService = inject(ProfileService);
  profile: HttpResourceRef<ProfileResponse | undefined> = httpResource<ProfileResponse>(() =>
    ({ url: this.profilService.path })
  );

  private topicService: TopicService = inject(TopicService);
  private destroyRef: DestroyRef = inject(DestroyRef);

  readonly btnUnsubscribed: string = "Se désabonner";
  readonly titleSubscription: string= "Abonnements";
  readonly titleProfilUser: string = "Profil utilisateur";
  readonly btnSaveProfilUser: string = "Sauvegarder";
  readonly placeholderPassword: string = "Nouveau mot de passe"

  showToastSuccess = signal({message: "", visible: false})
  error: WritableSignal<string | undefined> = signal<string | undefined>(undefined);
  showPasswordModal: WritableSignal<boolean> = signal(false);
  private pendingNewPassword = '';

  profileModel: WritableSignal<ProfileData> = signal<ProfileData>(initialProfileData);
  profileForm: FieldTree<ProfileData> = form(this.profileModel, validationProfileForm);

  constructor() {
    this.profile.reload();

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
    this.error.set(undefined);
    this.showToastSuccess.set({message, visible: true});
    setTimeout(() => {
      this.showToastSuccess.set({message: "", visible: false});
    }, 2000)
  }

  onFocus(): void {
    this.error.set(undefined);
  }

  onSubmit(event: Event): void {
    event.preventDefault();

    const nameDirty = this.profileForm.name().dirty();
    const emailDirty = this.profileForm.email().dirty();

    if (nameDirty || emailDirty) {
      const name = nameDirty ? this.profileForm.name().value() : null;
      const email = emailDirty ? this.profileForm.email().value() : null;

      this.profilService.updateProfile$(email, name)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: value => {
            this.profile.set(value);
            this.onUpdateProfilSuccess("Le profil a bien été mis à jour!");
          },
          error: () => {
            this.error.set("Une erreur est survenue, le profil n'a pas été mis à jour.");
          }
        });
    }

    if (this.checkHasNewPasswordToChange()) {
      this.pendingNewPassword = this.profileForm.password().value();
      this.showPasswordModal.set(true);
    }
  }

  onConfirmPassword(currentPassword: string): void {
    this.showPasswordModal.set(false);
    this.profilService.updatePassword$(this.pendingNewPassword, currentPassword)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.profileForm.password().reset("")
          this.onUpdateProfilSuccess("Le mot de passe a bien été changé!");
        },
        error: () => {
          this.error.set("Une erreur est survenue, le mot de passe n'a pas été mis à jour.");
        }
      });
  }

  onUnsubscribe(topicId: number) {
    this.topicService.unsubscribe$(topicId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        complete: () => this.profile.reload(),
      })
  }

  private checkHasNewPasswordToChange(): boolean {
    return this.profileForm.password().dirty()
      && this.profileForm.password().valid()
      && this.profileForm.password().value() !== '';
  }

}
