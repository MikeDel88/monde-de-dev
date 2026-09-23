import {HttpHandlerFn, HttpRequest} from "@angular/common/http";

export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  const newReq = req.clone({withCredentials: true});
  return next(newReq);
}
