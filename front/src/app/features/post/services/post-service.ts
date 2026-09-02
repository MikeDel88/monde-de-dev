import {inject, Service, signal, WritableSignal} from '@angular/core';
import {HttpClient, httpResource, HttpResourceRef} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../../../../environments/environment";

export interface Post {
  id: number;
  title: string;
  date: string;
  author: string;
  content: string;
  topicName: string;
  comments: PostComment[];
}

export interface PostComment {
  author: string,
  content: string
}

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
}
