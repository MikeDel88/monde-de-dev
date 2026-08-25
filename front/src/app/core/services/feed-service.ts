import {Service, signal} from '@angular/core';
import {httpResource} from "@angular/common/http";
import {PostFeed} from "../models/post-feed";

@Service()
export class FeedService {

  sortByAsc = signal<Boolean>(false);

  toogleFilterByAsc() {
    this.sortByAsc.set(!this.sortByAsc())
  }

  posts = httpResource<PostFeed[]>(() => ({
    url: 'http://localhost:9000/feed',
    params: {
      sort: this.sortByAsc() ? "asc" : "desc"
    }
  }));

}
