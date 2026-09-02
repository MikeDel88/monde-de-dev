import {Component, input, output} from '@angular/core';
import {DatePipe} from "@angular/common";
import {PostFeed} from "../../../features/feed/models/post-feed";

@Component({
  selector: 'app-post-card',
  imports: [
    DatePipe
  ],
  templateUrl: './post-card.html',
  styleUrl: './post-card.css',
})
export class PostCard {
    post = input.required<PostFeed>();
    clickPost = output<number>();

    onClick(postId: number) {
      this.clickPost.emit(postId);
    }
}
