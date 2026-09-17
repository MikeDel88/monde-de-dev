import {inject, Service} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {finalize, map, Observable, tap} from "rxjs";
import {RegisterData} from "../models/register-data";
import {LoginData} from "../models/login-data";
import {SessionService} from "../../../core/services/session-service";
import {environment} from "../../../../environments/environment";

@Service()
export class AuthService {

  private httpClient: HttpClient = inject(HttpClient);
  private sessionService: SessionService = inject(SessionService);

   register$(datas: RegisterData): Observable<void> {
     return this.httpClient.post<void>(`${environment.apiUrl}/auth/register`, datas);
   }

   login$(datas: LoginData): Observable<boolean> {
    return this.httpClient.post<void>(`${environment.apiUrl}/auth/login`, datas)
      .pipe(tap(() => this.sessionService.logIn()))
      .pipe(map(() => this.sessionService.isAuthenticated));
   }

   logout$(): Observable<void> {
     return this.httpClient.post<void>(`${environment.apiUrl}/auth/logout`, {})
       .pipe(finalize(() => this.sessionService.logOut()));
   }
}
