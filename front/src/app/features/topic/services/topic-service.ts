import {inject, Service} from '@angular/core';
import {HttpClient, httpResource, HttpResourceRef} from "@angular/common/http";
import {Topic} from "../models/topic";
import {Observable} from "rxjs";
import {environment} from "../../../../environments/environment";

@Service()
export class TopicService {

  private httpClient = inject(HttpClient);

  topics: HttpResourceRef<Topic[] | undefined> = httpResource<Topic[]>(() => `${environment.apiUrl}/topics`);

  subscribe(topicId: number): Observable<void> {
    return this.httpClient.post<void>(`${environment.apiUrl}/topics/subscribe`, { topicId });
  }

  unsubscribe(topicId: number) {
    return this.httpClient.delete<void>(`${environment.apiUrl}/topics/${topicId}/subscribe`,);
  }
}
