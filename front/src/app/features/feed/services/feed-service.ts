import {Service, signal, WritableSignal} from '@angular/core';
import {httpResource, HttpResourceRef} from "@angular/common/http";
import {PostFeed} from "../models/post-feed";
import {environment} from "../../../../environments/environment";

@Service()
export class FeedService {

  sortByAsc: WritableSignal<boolean> = signal<boolean>(false);

  toogleFilterByAsc(): void {
    this.sortByAsc.set(!this.sortByAsc())
  }

  posts: HttpResourceRef<PostFeed[] | undefined> = httpResource<PostFeed[]>(() => ({
    url: `${environment.apiUrl}/feed`,
    params: {
      sort: this.sortByAsc() ? "asc" : "desc"
    }
  }));

}
