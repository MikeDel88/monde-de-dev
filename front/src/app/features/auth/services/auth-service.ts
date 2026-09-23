import {inject, Service} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {finalize, map, Observable, tap} from "rxjs";
import {RegisterData} from "../models/register-data";
import {LoginData} from "../models/login-data";
import {SessionService} from "../../../core/services/session-service";
import {environment} from "../../../../environments/environment";

/**
 * Gère les appels HTTP d'authentification (inscription, connexion, déconnexion) et
 * synchronise l'état de session local ({@link SessionService}) en conséquence.
 */
@Service()
export class AuthService {

  private readonly httpClient: HttpClient = inject(HttpClient);
  private readonly sessionService: SessionService = inject(SessionService);

   /**
    * Crée un nouveau compte utilisateur. Ne modifie pas la session : l'utilisateur
    * doit ensuite se connecter explicitement via {@link login$}.
    */
   register$(datas: RegisterData): Observable<void> {
     return this.httpClient.post<void>(`${environment.apiUrl}/auth/register`, datas);
   }

   /**
    * Authentifie l'utilisateur et marque la session locale comme active en cas de succès
    * (le cookie de session étant lui posé côté serveur).
    * @returns `true` une fois la session locale mise à jour (reflète `sessionService.isAuthenticated`).
    */
   login$(datas: LoginData): Observable<boolean> {
    return this.httpClient.post<void>(`${environment.apiUrl}/auth/login`, datas)
      .pipe(tap(() => this.sessionService.logIn()))
      .pipe(map(() => this.sessionService.isAuthenticated));
   }

   /**
    * Déconnecte l'utilisateur côté serveur puis réinitialise la session locale.
    * La session locale est nettoyée via `finalize`, donc même si l'appel serveur échoue,
    * l'utilisateur est bien déconnecté côté client.
    */
   logout$(): Observable<void> {
     return this.httpClient.post<void>(`${environment.apiUrl}/auth/logout`, {})
       .pipe(finalize(() => this.sessionService.logOut()));
   }
}
