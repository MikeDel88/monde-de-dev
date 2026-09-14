import {Service, signal, WritableSignal, Signal, computed, effect} from '@angular/core';
import {httpResource, HttpResourceRef} from "@angular/common/http";
import {PostFeed} from "../models/post-feed";
import {CursorPage} from "../../../shared/models/cursor-page";
import {environment} from "../../../../environments/environment";

@Service()
export class FeedService {

  sortByAsc: WritableSignal<boolean> = signal<boolean>(false);
  private cursor: WritableSignal<number | undefined> = signal<number | undefined>(undefined);
  private accumulatedPosts: WritableSignal<PostFeed[]> = signal<PostFeed[]>([]);

  posts: HttpResourceRef<CursorPage<PostFeed> | undefined> = httpResource<CursorPage<PostFeed>>(() => ({
    url: `${environment.apiUrl}/posts`,
    params: {
      direction: this.sortByAsc() ? "asc" : "desc",
      ...(this.cursor() !== undefined ? {cursor: this.cursor()!} : {})
    }
  }));

  readonly loadedPosts: Signal<PostFeed[]> = computed(() => this.accumulatedPosts());

  readonly hasMore: Signal<boolean> = computed(() => this.posts.value()?.hasNext ?? false);

  constructor() {
    effect(() => {
      if (!this.posts.hasValue()) {
        return;
      }
      const currentPage = this.posts.value();
      if (this.cursor() === undefined) {
        this.accumulatedPosts.set(currentPage.content);
      } else {
        this.accumulatedPosts.update((posts) => [...posts, ...currentPage.content]);
      }
    });
  }

  toggleFilterByAsc(): void {
    this.sortByAsc.set(!this.sortByAsc());
    this.cursor.set(undefined);
  }

  loadMore(): void {
    if (this.posts.isLoading() || !this.hasMore()) {
      return;
    }
    const nextCursor = this.posts.value()?.nextCursor;
    if (nextCursor != null) {
      this.cursor.set(nextCursor);
    }
  }

}
