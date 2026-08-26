import {HttpHandlerFn, HttpRequest} from "@angular/common/http";
import {inject} from "@angular/core";
import {SessionService} from "../services/session-service";

export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  const authToken = inject(SessionService).getToken();
  if(authToken) {
    const newReq = req.clone({
      headers: req.headers.append('Authorization', "Bearer " + authToken),
    });
    return next(newReq);
  }
  return next(req);
}
