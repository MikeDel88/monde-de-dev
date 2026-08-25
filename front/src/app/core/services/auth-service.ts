import {inject, Service} from '@angular/core';
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {catchError, map, Observable, tap, throwError} from "rxjs";
import {RegisterData} from "../models/register-data";
import {LoginData} from "../models/login-data";
import {FieldError} from "../models/field-error";
import {ApiProblemDetail} from "../models/api-problem-detail";
import {SessionService} from "./session-service";

@Service()
export class AuthService {

  private httpClient = inject(HttpClient);
  private sessionService = inject(SessionService);

   register$(datas: RegisterData): Observable<void> {
     return this.httpClient.post<void>("http://localhost:9000/auth/register", datas)
       .pipe(catchError((err: HttpErrorResponse) => throwError(() => new Error(this.buildRegisterErrorMessage(err)))));
   }

   login$(datas: LoginData): Observable<boolean> {
    return this.httpClient.post<string>("http://localhost:9000/auth/login", datas)
      .pipe(tap((token) => this.sessionService.logIn(token)))
      .pipe(map(() => true))
      .pipe(catchError((err: HttpErrorResponse) => throwError(() => new Error(this.buildLoginErrorMessage(err)))));
   }

   private buildLoginErrorMessage(err: HttpErrorResponse) {
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
