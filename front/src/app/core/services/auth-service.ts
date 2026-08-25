import {inject, Service} from '@angular/core';
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {catchError, Observable, throwError} from "rxjs";
import {RegisterData} from "../models/register-data";

@Service()
export class AuthService {

  private httpClient = inject(HttpClient);

   register(datas: RegisterData): Observable<void> {
     return this.httpClient.post<void>("http://localhost:9000/auth/register", datas)
       .pipe(catchError((err: HttpErrorResponse) => throwError(() => new Error(this.buildErrorMessage(err)))));
   }

   private buildErrorMessage(err: HttpErrorResponse): string {
     const body = err.error as ApiProblemDetail | null;
     switch (err.status) {
       case 400:
         return body?.errors?.map(e => e.message).join(', ') ?? 'Formulaire invalide';
       case 409:
         return "Une erreur est survenue, l'utilisateur n'a pas été enregistré";
       default:
         return 'Une erreur est survenue, veuillez réessayer plus tard';
     }
   }
}
