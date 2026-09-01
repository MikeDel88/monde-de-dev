import {Component, inject} from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import {Post, PostService} from "../../../services/post-service";
import {HttpResourceRef} from "@angular/common/http";
import {DatePipe} from "@angular/common";

@Component({
  selector: 'app-post-detail',
  imports: [
    DatePipe
  ],
  templateUrl: './post-detail.html',
  styleUrl: './post-detail.css',
})
export class PostDetail {

  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  readonly postId: string | null = this.activatedRoute.snapshot.params['id'];
  private readonly postService = inject(PostService);
  post: HttpResourceRef<Post | undefined> = this.postService.post;

  constructor() {
    this.postService.postId.set(this.postId);
  }

}
