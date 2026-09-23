import {HttpHandlerFn, HttpRequest} from "@angular/common/http";
import {environment} from "../../../environments/environment";

const XSRF_COOKIE_NAME = 'XSRF-TOKEN';
const XSRF_HEADER_NAME = 'X-XSRF-TOKEN';

/**
 * Lit la valeur d'un cookie par son nom.
 * @param name Nom du cookie recherché.
 * @returns La valeur décodée du cookie, ou `null` s'il est absent.
 */
function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Intercepteur XSRF : recopie le cookie `XSRF-TOKEN` posé par le backend dans le header
 * `X-XSRF-TOKEN` des requêtes mutantes (tout sauf GET/HEAD, qui n'ont pas besoin de
 * protection XSRF). Le backend compare cookie et header pour valider la requête.
 * Si le cookie est absent, la requête part sans header (le backend la rejettera) ;
 * un avertissement est loggué en développement pour faciliter le diagnostic.
 */
export function xsrfInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  if (req.method === 'GET' || req.method === 'HEAD') {
    return next(req);
  }

  const token = readCookie(XSRF_COOKIE_NAME);
  if (!token) {
    if (!environment.production) {
      console.warn(`[xsrfInterceptor] Cookie ${XSRF_COOKIE_NAME} absent pour ${req.method} ${req.url} : requête envoyée sans header ${XSRF_HEADER_NAME}.`);
    }
    return next(req);
  }

  return next(req.clone({setHeaders: {[XSRF_HEADER_NAME]: token}}));
}
