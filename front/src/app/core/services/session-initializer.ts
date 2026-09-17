import {inject} from "@angular/core";
import {HttpClient, HttpContext} from "@angular/common/http";
import {catchError, map, Observable, of} from "rxjs";
import {environment} from "../../../environments/environment";
import {SessionService} from "./session-service";
import {SKIP_AUTH_REDIRECT} from "../interceptors/error-interceptor";

export function initSession(): Observable<void> {
  const httpClient = inject(HttpClient);
  const sessionService = inject(SessionService);

  return httpClient.get(`${environment.apiUrl}/profile`, {
    context: new HttpContext().set(SKIP_AUTH_REDIRECT, true),
  }).pipe(
    map(() => sessionService.logIn()),
    catchError(() => of(undefined)),
  );
}
