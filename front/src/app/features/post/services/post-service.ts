import {inject, Service, signal, WritableSignal} from '@angular/core';
import {HttpClient, httpResource, HttpResourceRef} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../../../../environments/environment";
import {Post} from "../models/post";

@Service()
export class PostService {

  private readonly httpClient = inject(HttpClient);
  postId : WritableSignal<string | null> = signal(null);

  createPost$(topicId: string, title: string, content: string): Observable<void> {
    return this.httpClient.post<void>(`${environment.apiUrl}/posts`, { topicId, title, content });
  }

  post: HttpResourceRef<Post | undefined> = httpResource<Post>(() => ({
    url: `${environment.apiUrl}/posts/${this.postId()}`,
  }));

  createComment$(content: string): Observable<void> {
    return this.httpClient.post<void>(`${environment.apiUrl}/posts/${this.postId()}/comments`, { content });
  }

}
