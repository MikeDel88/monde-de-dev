import {Component, effect, inject, signal, WritableSignal} from '@angular/core';
import {HttpResourceRef} from "@angular/common/http";
import {ProfileService} from "../services/profile-service";
import {ProfileResponse} from "../models/profile-response";
import {TopicCard} from "../../feed/components/topic-card/topic-card";
import {email, FieldTree, form, FormField, minLength, pattern, required, SchemaPathTree} from "@angular/forms/signals";


export interface ProfileData {
  name: string;
  email: string,
  password: string,
}

const initialProfileData: ProfileData = {
  name: "",
  email: "",
  password: ''
};

const validationProfileForm = (schemaPath: SchemaPathTree<ProfileData>) => {
  email(schemaPath.email, {message: 'Email invalide'});
  minLength(schemaPath.password, 8, {message: 'Doit être supérieur ou égal à 8 caractères'});
  pattern(schemaPath.password,
    /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).+$/,
    {message: 'Doit contenir au moins une lettre Majuscule, Minuscule, un chiffre et un caractère spécial'});
}

@Component({
  selector: 'app-profile',
  imports: [TopicCard, FormField],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {

  private profilService = inject(ProfileService);
  profile!: HttpResourceRef<ProfileResponse | undefined>;

  readonly btnUnsubscribed = "Se désabonner";
  readonly titleSubscription  = "Abonnements";
  readonly titleProfilUser = "Profil utilisateur";
  readonly btnSaveProfilUser = "Sauvegarder";

  error: WritableSignal<string | undefined> = signal<string | undefined>(undefined);

  profileModel: WritableSignal<ProfileData> = signal<ProfileData>(initialProfileData);
  profileForm: FieldTree<ProfileData> = form(this.profileModel, validationProfileForm);

  constructor() {
    this.profile = this.profilService.profile;

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

  }

  onUnsubscribe(topicId: number) {

  }

}
