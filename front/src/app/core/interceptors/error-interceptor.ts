import {HttpErrorResponse, HttpHandlerFn, HttpRequest} from "@angular/common/http";
import {inject} from "@angular/core";
import {Router} from "@angular/router";
import {catchError, throwError} from "rxjs";
import {SessionService} from "../services/session-service";

export function errorInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  const sessionService = inject(SessionService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && sessionService.getToken()) {
        sessionService.logOut();
        router.navigateByUrl('/login');
      }
      return throwError(() => error);
    })
  );
}
