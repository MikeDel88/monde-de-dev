import {HttpContextToken, HttpErrorResponse, HttpHandlerFn, HttpRequest} from "@angular/common/http";
import {inject} from "@angular/core";
import {Router} from "@angular/router";
import {catchError, throwError} from "rxjs";
import {SessionService} from "../services/session-service";
import {AppError} from "../models/app-error";
import {mapHttpErrorToMessage} from "../utils/http-error-message";

/**
 * Contexte HTTP permettant de désactiver, pour une requête donnée, la déconnexion
 * automatique et la redirection vers /login déclenchées par un 401.
 * Utile pour les requêtes qui testent volontairement l'état de la session
 * (ex. `initSession`) sans vouloir provoquer d'effet de bord en cas d'échec.
 */
export const SKIP_AUTH_REDIRECT = new HttpContextToken<boolean>(() => false);

/**
 * Intercepteur global des erreurs HTTP.
 * - Sur un 401 (sauf si {@link SKIP_AUTH_REDIRECT} est activé pour la requête), déconnecte
 *   la session locale et redirige vers la page de login.
 * - Dans tous les cas, transforme l'erreur HTTP brute en {@link AppError} avec un message
 *   déjà traduit (voir `mapHttpErrorToMessage`), pour que le reste de l'app n'ait jamais
 *   à manipuler des `HttpErrorResponse`.
 */
export function errorInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  const sessionService = inject(SessionService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.context.get(SKIP_AUTH_REDIRECT)) {
        sessionService.logOut();
        router.navigateByUrl('/login');
      }
      return throwError(() => new AppError(mapHttpErrorToMessage(error), error.status));
    })
  );
}
