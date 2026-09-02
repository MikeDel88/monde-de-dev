import {Component, DestroyRef, inject, signal, WritableSignal} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {Post, PostService} from "../../services/post-service";
import {HttpResourceRef} from "@angular/common/http";
import {DatePipe} from "@angular/common";
import {FieldState, FieldTree, form, FormField, required, SchemaPathTree} from "@angular/forms/signals";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {Dividers} from "../../../../shared/components/divider/dividers";
import {Error} from "../../../../shared/components/error/error";
import {Title} from "../../../../shared/components/title/title";
import {Back} from "../../../../shared/components/back/back";

export interface CreateComment {
  content: string
}

const commentInitialData: CreateComment = {
  content: ''
};

const validationCreateCommentForm = (schemaPath: SchemaPathTree<CreateComment>) => {
  required(schemaPath.content);
};

@Component({
  selector: 'app-post-detail',
  imports: [
    DatePipe,
    FormField,
    Dividers,
    Error,
    Title,
    Back
  ],
  templateUrl: './post-detail.html',
  styleUrl: './post-detail.css',
})
export class PostDetail {

  readonly titleComments: string = "Commentaires";
  readonly placeholderComment: string = "Écrivez ici votre commentaire";

  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  readonly postId: string | null = this.activatedRoute.snapshot.params['id'];
  private readonly postService = inject(PostService);
  post: HttpResourceRef<Post | undefined> = this.postService.post;
  error: WritableSignal<string | undefined> = signal<string | undefined>(undefined);

  createCommentModel: WritableSignal<CreateComment> = signal<CreateComment>(commentInitialData);
  commentForm: FieldTree<CreateComment> = form(this.createCommentModel, validationCreateCommentForm);


  constructor() {
    this.postService.postId.set(this.postId);
  }

  onBack() {
    this.router.navigate(['/feed']);
  }

  onSubmitComment(event: Event) {
    event.preventDefault();
    if(this.postId != null) {
      const commentData: FieldState<CreateComment> = this.commentForm();
      this.postService.createComment$(commentData.value().content)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.commentForm().reset(commentInitialData);
            this.post.reload();
          },
          error: () => {
            this.error.set('Erreur lors de la création du commentaire.');
          }
        });
    }

  }

}
