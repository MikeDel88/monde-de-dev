import {Component, inject} from '@angular/core';
import {HttpResourceRef} from "@angular/common/http";
import {ProfileService} from "../services/profile-service";
import {ProfileResponse} from "../models/profile-response";
import {TopicCard} from "../../feed/components/topic-card/topic-card";

@Component({
  selector: 'app-profile',
  imports: [
    TopicCard
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {

  private profilService = inject(ProfileService);
  profile!: HttpResourceRef<ProfileResponse | undefined>;

  readonly btnUnsubscribedText = "Se désabonner";

  constructor() {
    this.profile = this.profilService.profile;
  }

  onUnsubscribe(topicId: number) {

  }

}
