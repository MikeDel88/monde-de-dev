import {HttpErrorResponse, HttpHandlerFn, HttpRequest} from "@angular/common/http";
import {inject} from "@angular/core";
import {Router} from "@angular/router";
import {catchError, throwError} from "rxjs";
import {SessionService} from "../services/session-service";
import {AppError} from "../models/app-error";
import {mapHttpErrorToMessage} from "../utils/http-error-message";

export function errorInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  const sessionService = inject(SessionService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        sessionService.logOut();
        router.navigateByUrl('/login');
      }
      return throwError(() => new AppError(mapHttpErrorToMessage(error), error.status));
    })
  );
}
