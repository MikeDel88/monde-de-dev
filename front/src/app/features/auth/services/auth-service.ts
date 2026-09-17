import {inject, Service} from '@angular/core';
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {catchError, map, Observable, tap, throwError} from "rxjs";
import {RegisterData} from "../models/register-data";
import {LoginData} from "../models/login-data";
import {SessionService} from "../../../core/services/session-service";
import {environment} from "../../../../environments/environment";
import {mapHttpErrorToMessage} from "../../../core/utils/http-error-message";

@Service()
export class AuthService {

  private httpClient: HttpClient = inject(HttpClient);
  private sessionService: SessionService = inject(SessionService);

   register$(datas: RegisterData): Observable<void> {
     return this.httpClient.post<void>(`${environment.apiUrl}/auth/register`, datas)
       .pipe(catchError((err: HttpErrorResponse) => throwError(() => new Error(mapHttpErrorToMessage(err)))));
   }

   login$(datas: LoginData): Observable<boolean> {
    return this.httpClient.post<void>(`${environment.apiUrl}/auth/login`, datas)
      .pipe(tap(() => this.sessionService.logIn()))
      .pipe(map(() => this.sessionService.isAuthenticated))
      .pipe(catchError((err: HttpErrorResponse) => throwError(() => new Error(mapHttpErrorToMessage(err)))));
   }

   logout$(): Observable<void> {
     return this.httpClient.post<void>(`${environment.apiUrl}/auth/logout`, {})
       .pipe(tap(() => this.sessionService.logOut()));
   }
}
