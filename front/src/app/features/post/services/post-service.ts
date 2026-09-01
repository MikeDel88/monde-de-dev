import {inject, Service } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../../../../environments/environment";

@Service()
export class PostService {

  private readonly httpClient = inject(HttpClient);

  createPost$(topicId: string, title: string, content: string): Observable<void> {
    return this.httpClient.post<void>(`${environment.apiUrl}/posts`, { topicId, title, content });
  }
}
