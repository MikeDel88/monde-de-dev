import {Component, input} from '@angular/core';
import {PostFeed} from "../../pages/feed/feed";
import {DatePipe} from "@angular/common";

@Component({
  selector: 'app-post-card',
  imports: [
    DatePipe
  ],
  templateUrl: './post-card.html',
  styleUrl: './post-card.css',
})
export class PostCard {
    post = input.required<PostFeed >();
}
