import {Component, inject, WritableSignal} from '@angular/core';
import {PostCard} from "../../../shared/components/post-card/post-card";
import {FeedService} from "../services/feed-service";
import {HttpResourceRef} from "@angular/common/http";
import {PostFeed} from "../models/post-feed";
import {Router} from "@angular/router";
import {Button} from "../../../shared/components/button/button";
import {Error} from "../../../shared/components/error/error";
import {Loader} from "../../../shared/components/loader/loader";

@Component({
  selector: 'app-feed',
  imports: [
    PostCard,
    Button,
    Error,
    Loader
  ],
  templateUrl: './feed.html',
  styleUrl: './feed.css',
})
export class Feed {
  readonly sortByAscText: string = "Trier par";
  readonly btnCreatePostText: string = "Créer un article";

  feedService: FeedService = inject(FeedService);
  readonly router = inject(Router);
  sortByAsc: WritableSignal<boolean> = this.feedService.sortByAsc;
  posts!: HttpResourceRef<PostFeed[] | undefined>;

  constructor() {
    this.posts = this.feedService.posts;
    this.posts.reload();
  }

  toggle(): void {
    this.feedService.toogleFilterByAsc();
  }

  onClickCreatePost(): void {
    this.router.navigate(['/post']);
  }

  onClickPost(postId: number): void {
    this.router.navigate(['/post', postId]);
  }
}


