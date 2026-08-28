import {Component, computed, inject, signal, Signal, WritableSignal} from '@angular/core';
import {ProfileService} from "../../profile/services/profile-service";
import {HttpResourceRef} from "@angular/common/http";
import {ProfileResponse} from "../../profile/models/profile-response";
import {Topic} from "../../topic/models/topic";
import {Router} from "@angular/router";
import {FieldTree, form, FormField, required, SchemaPathTree} from "@angular/forms/signals";
import {FormsModule} from "@angular/forms";
import {NgClass} from "@angular/common";

export interface CreatePost {
  topicId: string,
  title: string,
  content: string
}

const initialPostData: CreatePost = {
  topicId: "",
  title: "",
  content: ""
};

const validationCreatePostForm = (schemaPath: SchemaPathTree<CreatePost>) => {
  required(schemaPath.topicId);
  required(schemaPath.title);
  required(schemaPath.content);
};

@Component({
  selector: 'app-post',
  imports: [
    FormsModule,
    FormField,
    NgClass
  ],
  templateUrl: './post.html',
  styleUrl: './post.css',
})
export class Post {

  readonly title = "Créer un nouvel article";
  readonly btnText = "Créer";
  readonly titlePlaceholder = "Titre de l'article";
  readonly contentPlaceholder = "Contenu de l'article";

  readonly router = inject(Router);
  private profilService = inject(ProfileService);
  topics: Signal<Topic[] | undefined> = computed(() => {
      if(this.profile.hasValue()) {
        return this.profile.value().topics;
      } else {
        return undefined;
      }
  });
  profile!: HttpResourceRef<ProfileResponse | undefined>;

  createPostModel: WritableSignal<CreatePost> = signal<CreatePost>(initialPostData);
  postForm: FieldTree<CreatePost> = form(this.createPostModel, validationCreatePostForm);

  constructor() {
    this.profile = this.profilService.profile;
    this.profile.reload();
  }

  onBack(): void {
    this.router.navigate(['/feed']);
  }

  onFocus(): void {

  }

  onSubmit(event: Event): void {
    event.preventDefault();
  }
}
