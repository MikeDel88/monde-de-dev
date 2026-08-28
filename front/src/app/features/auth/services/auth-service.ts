import {inject, Service} from '@angular/core';
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {catchError, map, Observable, tap, throwError} from "rxjs";
import {RegisterData} from "../models/register-data";
import {LoginData} from "../models/login-data";
import {FieldError} from "../../../core/models/field-error";
import {ApiProblemDetail} from "../../../core/models/api-problem-detail";
import {SessionService} from "../../../core/services/session-service";
import {AuthResponse} from "../models/auth-response";
import {environment} from "../../../../environments/environment";

@Service()
export class AuthService {

  private httpClient: HttpClient = inject(HttpClient);
  private sessionService: SessionService = inject(SessionService);

   register$(datas: RegisterData): Observable<void> {
     return this.httpClient.post<void>(`${environment.apiUrl}/auth/register`, datas)
       .pipe(catchError((err: HttpErrorResponse) => throwError(() => new Error(this.buildRegisterErrorMessage(err)))));
   }

   login$(datas: LoginData): Observable<boolean> {
    return this.httpClient.post<AuthResponse>(`${environment.apiUrl}/auth/login`, datas)
      .pipe(tap((authResponse: AuthResponse) => this.sessionService.logIn(authResponse.token)))
      .pipe(map(() => this.sessionService.isAuthenticated))
      .pipe(catchError((err: HttpErrorResponse) => throwError(() => new Error(this.buildLoginErrorMessage(err)))));
   }

   private buildLoginErrorMessage(err: HttpErrorResponse): string {
     switch (err.status) {
       case 404:
         return "Une erreur est survenue. Vérifier le couple email ou nom d'utilisateur et mot de passe";
       default:
         return 'Une erreur est survenue, veuillez réessayer plus tard';
     }
   }

   private buildRegisterErrorMessage(err: HttpErrorResponse): string {
     const body = err.error as ApiProblemDetail | null;
     switch (err.status) {
       case 400:
         return body?.errors?.map((e: FieldError) => e.message).join(', ') ?? 'Formulaire invalide';
       case 409:
         return "Une erreur est survenue, l'utilisateur n'a pas été enregistré";
       default:
         return 'Une erreur est survenue, veuillez réessayer plus tard';
     }
   }
}
