import {Component, DestroyRef, effect, inject, signal, WritableSignal} from '@angular/core';
import {HttpResourceRef} from "@angular/common/http";
import {ProfileService} from "../services/profile-service";
import {ProfileResponse} from "../models/profile-response";
import {TopicCard} from "../../feed/components/topic-card/topic-card";
import {ConfirmPasswordModal} from "../components/confirm-password-modal/confirm-password-modal";
import {
  email,
  FieldTree,
  form,
  FormField,
  minLength,
  pattern,
  SchemaPathTree
} from "@angular/forms/signals";
import {TopicService} from "../../topic/services/topic-service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {NgClass} from "@angular/common";
import {Button} from "../../../shared/components/buttons/button";


export interface ProfileData {
  name: string;
  email: string,
  password: string,
};

const initialProfileData: ProfileData = {
  name: "",
  email: "",
  password: ""
};

const validationProfileForm = (schemaPath: SchemaPathTree<ProfileData>) => {
  email(schemaPath.email, {message: 'Email invalide'});
  minLength(schemaPath.password, 8, {message: 'Doit être supérieur ou égal à 8 caractères'});
  pattern(schemaPath.password,
    /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).+$/,
    {message: 'Doit contenir au moins une lettre Majuscule, Minuscule, un chiffre et un caractère spécial'});
};

@Component({
  selector: 'app-profile',
  imports: [TopicCard, FormField, ConfirmPasswordModal, NgClass, Button],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {

  private profilService: ProfileService = inject(ProfileService);
  profile!: HttpResourceRef<ProfileResponse | undefined>;

  private topicService: TopicService = inject(TopicService);
  private destroyRef: DestroyRef = inject(DestroyRef);

  readonly btnUnsubscribed: string = "Se désabonner";
  readonly titleSubscription: string= "Abonnements";
  readonly titleProfilUser: string = "Profil utilisateur";
  readonly btnSaveProfilUser: string = "Sauvegarder";

  error: WritableSignal<string | undefined> = signal<string | undefined>(undefined);
  showPasswordModal: WritableSignal<boolean> = signal(false);
  private pendingNewPassword: string = '';

  profileModel: WritableSignal<ProfileData> = signal<ProfileData>(initialProfileData);
  profileForm: FieldTree<ProfileData> = form(this.profileModel, validationProfileForm);

  constructor() {
    this.profile = this.profilService.profile;
    this.profile.reload();

    effect(() => {
      if (this.profile.hasValue()) {
        const value = this.profile.value();
        this.profileModel.set({name: value.name, email: value.email, password: ''});
      }
    });
  }

  onFocus(): void {
    this.error.set(undefined);
  }

  onSubmit(event: Event): void {
    event.preventDefault();

    const nameDirty = this.profileForm.name().dirty();
    const emailDirty = this.profileForm.email().dirty();
    const passwordDirty = this.profileForm.password().dirty();

    if (nameDirty || emailDirty) {
      const name = nameDirty ? this.profileForm.name().value() : null;
      const email = emailDirty ? this.profileForm.email().value() : null;

      this.profilService.updateProfil$(email, name)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: value => {
            this.error.set(undefined);
            this.profile.set(value);
          },
          error: () => {
            this.error.set("Une erreur est survenue, le profil n'a pas été mis à jour.");
          }
        });
    }

    if (passwordDirty) {
      this.pendingNewPassword = this.profileForm.password().value();
      this.showPasswordModal.set(true);
    }
  }

  onConfirmPassword(currentPassword: string): void {
    this.showPasswordModal.set(false);
    this.profilService.updatePassword$(this.pendingNewPassword, currentPassword)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => { this.profileForm.password().reset("") },
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

}
