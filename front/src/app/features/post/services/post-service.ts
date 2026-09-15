import {inject, Service} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../../../../environments/environment";

@Service()
export class PostService {

  private readonly httpClient = inject(HttpClient);
  readonly path = `${environment.apiUrl}/posts`

  createPost$(topicId: number, title: string, content: string): Observable<void> {
    return this.httpClient.post<void>(this.path, { topicId, title, content });
  }

  createComment$(postId: number, content: string): Observable<void> {
    return this.httpClient.post<void>(`${this.path}/${postId}/comments`, { content });
  }

}
