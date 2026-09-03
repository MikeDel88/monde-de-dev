import {Component, computed, DestroyRef, inject, signal, Signal, WritableSignal} from '@angular/core';
import {ProfileService} from "../../../profile/services/profile-service";
import {HttpResourceRef} from "@angular/common/http";
import {ProfileResponse} from "../../../profile/models/profile-response";
import {Topic} from "../../../topic/models/topic";
import {Router} from "@angular/router";
import {FieldState, FieldTree, form, FormField, required, SchemaPathTree} from "@angular/forms/signals";
import {FormsModule} from "@angular/forms";
import {PostService} from "../../services/post-service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {Button} from "../../../../shared/components/button/button";
import {Error} from "../../../../shared/components/error/error";
import {Input} from "../../../../shared/components/input/input";
import {Title} from "../../../../shared/components/title/title";
import {Back} from "../../../../shared/components/back/back";

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
    Button,
    Error,
    Input,
    Title,
    Back
  ],
  templateUrl: './post.html',
  styleUrl: './post.css',
})
export class Post {

  readonly title = "Créer un nouvel article";
  readonly btnText = "Créer";
  readonly titlePlaceholder = "Titre de l'article";
  readonly contentPlaceholder = "Contenu de l'article";
  readonly selectDefault = "Sélectionner un thème";

  readonly router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private readonly profilService = inject(ProfileService);
  private readonly postService = inject(PostService);
  error: WritableSignal<string | undefined> = signal<string | undefined>(undefined);
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
    this.error.set(undefined);
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    const postData: FieldState<CreatePost> = this.postForm();
    this.postService.createPost$(postData.value().topicId, postData.value().title, postData.value().content)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.postForm().reset(initialPostData);
          this.router.navigate(['/feed']);
        },
        error: () => {
          this.error.set('Erreur lors de la création du post.');
        }
      });
  }
}
