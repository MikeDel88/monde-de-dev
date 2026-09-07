import {Component, input, output} from '@angular/core';
import {DatePipe} from "@angular/common";
import {PostFeed} from "../../../features/feed/models/post-feed";
import {FirstUpperPipe} from "../../pipes/first-upper";

@Component({
  selector: 'app-post-card',
  imports: [
    DatePipe,
    FirstUpperPipe
  ],
  templateUrl: './post-card.html',
})
export class PostCard {
    post = input.required<PostFeed>();
    ariaLabel = input<string>();
    clickPost = output<number>();

    onClick(postId: number) {
      this.clickPost.emit(postId);
    }
}
