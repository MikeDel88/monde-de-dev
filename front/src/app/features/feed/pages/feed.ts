import {Component, computed, effect, inject, signal, Signal, WritableSignal} from '@angular/core';
import {PostCard} from "../../../shared/components/post-card/post-card";
import {httpResource, HttpResourceRef} from "@angular/common/http";
import {PostFeed} from "../models/post-feed";
import {CursorPage} from "../../../shared/models/cursor-page";
import {InfiniteScroll} from "../../../shared/directives/infinite-scroll";
import {Router} from "@angular/router";
import {Button} from "../../../shared/components/button/button";
import {Error} from "../../../shared/components/error/error";
import {Loader} from "../../../shared/components/loader/loader";
import {environment} from "../../../../environments/environment";

@Component({
  selector: 'app-feed',
  imports: [
    PostCard,
    Button,
    Error,
    Loader,
    InfiniteScroll
  ],
  templateUrl: './feed.html',
})
export class Feed {
  readonly sortByAscText: string = "Trier par";
  readonly btnCreatePostText: string = "Créer un article";

  private readonly router = inject(Router);
  readonly sortByAsc: WritableSignal<boolean> = signal<boolean>(false);
  private cursor: WritableSignal<number | undefined> = signal<number | undefined>(undefined);
  private accumulatedPosts: WritableSignal<PostFeed[]> = signal<PostFeed[]>([]);
  readonly loadedPosts: Signal<PostFeed[]> = computed(() => this.accumulatedPosts());
  readonly hasMore: Signal<boolean> = computed(() => this.posts.value()?.hasNext ?? false);

  posts: HttpResourceRef<CursorPage<PostFeed> | undefined> = httpResource<CursorPage<PostFeed>>(() => ({
    url: `${environment.apiUrl}/posts`,
    params: {
      direction: this.sortByAsc() ? "asc" : "desc",
      ...(this.cursor() !== undefined ? {cursor: this.cursor()!} : {})
    }
  }));

  constructor() {
    this.posts.reload();
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

  onToggle(): void {
    this.sortByAsc.set(!this.sortByAsc());
    this.cursor.set(undefined);
  }

  onLoadMore(): void {
    if (this.posts.isLoading() || !this.hasMore()) {
      return;
    }
    const nextCursor = this.posts.value()?.nextCursor;
    if (nextCursor != null) {
      this.cursor.set(nextCursor);
    }
  }

  onClickCreatePost(): void {
    this.router.navigate(['/post']);
  }

  onClickPost(postId: number): void {
    this.router.navigate(['/post', postId]);
  }
}


