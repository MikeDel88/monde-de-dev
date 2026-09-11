import {Service, signal, WritableSignal, Signal, computed, effect} from '@angular/core';
import {httpResource, HttpResourceRef} from "@angular/common/http";
import {PostFeed} from "../models/post-feed";
import {Page} from "../../../shared/models/page";
import {environment} from "../../../../environments/environment";

const PAGE_SIZE = 20;

@Service()
export class FeedService {

  sortByAsc: WritableSignal<boolean> = signal<boolean>(false);
  private page: WritableSignal<number> = signal<number>(0);
  private accumulatedPosts: WritableSignal<PostFeed[]> = signal<PostFeed[]>([]);

  posts: HttpResourceRef<Page<PostFeed> | undefined> = httpResource<Page<PostFeed>>(() => ({
    url: `${environment.apiUrl}/posts`,
    params: {
      sort: this.sortByAsc() ? "asc" : "desc",
      page: this.page(),
      size: PAGE_SIZE
    }
  }));

  readonly loadedPosts: Signal<PostFeed[]> = computed(() => this.accumulatedPosts());

  readonly hasMore: Signal<boolean> = computed(() => {
    const currentPage = this.posts.value();
    return currentPage ? currentPage.number < currentPage.totalPages - 1 : false;
  });

  constructor() {
    effect(() => {
      const currentPage = this.posts.value();
      if (!currentPage) {
        return;
      }
      if (currentPage.number === 0) {
        this.accumulatedPosts.set(currentPage.content);
      } else {
        this.accumulatedPosts.update((posts) => [...posts, ...currentPage.content]);
      }
    });
  }

  toggleFilterByAsc(): void {
    this.sortByAsc.set(!this.sortByAsc());
    this.page.set(0);
  }

  loadMore(): void {
    if (this.posts.isLoading() || !this.hasMore()) {
      return;
    }
    this.page.update((current) => current + 1);
  }

}
