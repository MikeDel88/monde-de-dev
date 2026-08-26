import {Component, inject, WritableSignal} from '@angular/core';
import {PostCard} from "../../../shared/components/post-card/post-card";
import {FeedService} from "../services/feed-service";
import {HttpResourceRef} from "@angular/common/http";
import {PostFeed} from "../models/post-feed";

@Component({
  selector: 'app-feed',
  imports: [
    PostCard
  ],
  templateUrl: './feed.html',
  styleUrl: './feed.css',
})
export class Feed {
  readonly sortByAscText: string = "Trier par"
  readonly btnCreatePostText: string = "Créer un article"

  feedService: FeedService = inject(FeedService);
  sortByAsc: WritableSignal<Boolean> = this.feedService.sortByAsc;
  posts!: HttpResourceRef<PostFeed[] | undefined>;

  constructor() {
    this.posts = this.feedService.posts
  }

  toggle(): void {
    this.feedService.toogleFilterByAsc()
  }
}


