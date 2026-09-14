import {inject} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {catchError, map, Observable, of} from "rxjs";
import {environment} from "../../../environments/environment";
import {SessionService} from "./session-service";

export function initSession(): Observable<void> {
  const httpClient = inject(HttpClient);
  const sessionService = inject(SessionService);

  return httpClient.get(`${environment.apiUrl}/profile`).pipe(
    map(() => sessionService.logIn()),
    catchError(() => of(undefined)),
  );
}
