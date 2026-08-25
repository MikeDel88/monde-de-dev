import {Component, inject} from '@angular/core';
import {PostCard} from "../../components/post-card/post-card";
import {FeedService} from "../../core/services/feed-service";

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

  feedService = inject(FeedService);
  sortByAsc = this.feedService.sortByAsc;
  posts = this.feedService.posts

  toggle() {
    this.feedService.toogleFilterByAsc()
  }
}


