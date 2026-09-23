import {Component, computed, effect, inject, signal, Signal, WritableSignal} from '@angular/core';
import {PostCard} from "../../../shared/components/post-card/post-card";
import {httpResource, HttpResourceRef} from "@angular/common/http";
import {PostFeed} from "../models/post-feed";
import {CursorPage} from "../../../shared/models/cursor-page";
import {InfiniteScroll} from "../../../shared/directives/infinite-scroll";
import {Router} from "@angular/router";
import {Button} from "../../../shared/components/button/button";
import {ErrorMessage} from "../../../shared/components/error-message/error-message";
import {Loader} from "../../../shared/components/loader/loader";
import {environment} from "../../../../environments/environment";

@Component({
  selector: 'app-feed',
  imports: [
    PostCard,
    Button,
    ErrorMessage,
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
  private readonly cursor: WritableSignal<number | undefined> = signal<number | undefined>(undefined);
  private readonly accumulatedPosts: WritableSignal<PostFeed[]> = signal<PostFeed[]>([]);
  readonly loadedPosts: Signal<PostFeed[]> = computed(() => this.accumulatedPosts());
  readonly hasMore: Signal<boolean> = computed(() => this.posts.value()?.hasNext ?? false);

  posts: HttpResourceRef<CursorPage<PostFeed> | undefined> = httpResource<CursorPage<PostFeed>>(() => ({
    url: `${environment.apiUrl}/posts`,
    params: {
      direction: this.sortByAsc() ? "asc" : "desc",
      ...(this.cursor() !== undefined ? {cursor: this.cursor()!} : {})
    }
  }));

  /**
   * Accumule les pages de posts reçues au fil de la pagination par curseur.
   * Quand `cursor` vaut `undefined` (premier chargement, ou tri changé via {@link onToggle}),
   * la page reçue remplace la liste accumulée au lieu de s'y ajouter : c'est ce qui permet
   * de repartir de zéro sans recharger la page.
   */
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

  /** Inverse le sens de tri et réinitialise la pagination (le curseur n'a plus de sens dans l'autre ordre). */
  onToggle(): void {
    this.sortByAsc.set(!this.sortByAsc());
    this.cursor.set(undefined);
  }

  /** Charge la page suivante en avançant le curseur, sauf si un chargement est déjà en cours ou qu'il n'y a plus de page. */
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


