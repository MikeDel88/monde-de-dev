import {inject} from "@angular/core";
import {HttpClient, HttpContext} from "@angular/common/http";
import {catchError, map, Observable, of} from "rxjs";
import {environment} from "../../../environments/environment";
import {SessionService} from "./session-service";
import {SKIP_AUTH_REDIRECT} from "../interceptors/error-interceptor";

/**
 * Initialise la session au démarrage de l'application en interrogeant `/profile`.
 * Si l'appel réussit, l'utilisateur est considéré comme connecté (cookie de session valide).
 * Si l'appel échoue (401, réseau, etc.), l'erreur est volontairement absorbée : l'utilisateur
 * reste simplement non authentifié, sans redirection ni message d'erreur au chargement.
 * La requête utilise {@link SKIP_AUTH_REDIRECT} pour éviter que l'intercepteur d'erreurs
 * ne redirige vers /login lors de ce simple test de session.
 */
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
