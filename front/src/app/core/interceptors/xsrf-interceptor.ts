import {HttpHandlerFn, HttpRequest} from "@angular/common/http";

const XSRF_COOKIE_NAME = 'XSRF-TOKEN';
const XSRF_HEADER_NAME = 'X-XSRF-TOKEN';

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function xsrfInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  if (req.method === 'GET' || req.method === 'HEAD') {
    return next(req);
  }

  const token = readCookie(XSRF_COOKIE_NAME);
  if (!token) {
    return next(req);
  }

  return next(req.clone({setHeaders: {[XSRF_HEADER_NAME]: token}}));
}
