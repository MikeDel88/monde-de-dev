import {inject, Service} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../../../../environments/environment";

@Service()
export class PostService {

  private readonly httpClient = inject(HttpClient);
  readonly path = `${environment.apiUrl}/posts`

  /** Crée un nouvel article rattaché à un thème (`topicId`). */
  createPost$(topicId: number, title: string, content: string): Observable<void> {
    return this.httpClient.post<void>(this.path, { topicId, title, content });
  }

  /** Ajoute un commentaire à l'article `postId`. */
  createComment$(postId: number, content: string): Observable<void> {
    return this.httpClient.post<void>(`${this.path}/${postId}/comments`, { content });
  }

}
