import {inject, Service} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../../../../environments/environment";

@Service()
export class TopicService {

  private readonly httpClient = inject(HttpClient);
  readonly path = `${environment.apiUrl}/topics`

  /** Abonne l'utilisateur connecté au thème `topicId`. */
  subscribe$(topicId: number): Observable<void> {
    return this.httpClient.post<void>(`${this.path}/subscribe`, { topicId });
  }

  /** Désabonne l'utilisateur connecté du thème `topicId`. */
  unsubscribe$(topicId: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.path}/${topicId}/subscribe`,);
  }
}
