import {CanActivateFn, Router, UrlTree} from "@angular/router";
import {inject} from "@angular/core";
import {SessionService} from "../services/session-service";

export const authGuard: CanActivateFn = (): boolean | UrlTree => {
  const router = inject(Router);
  const sessionService = inject(SessionService);

  if (!sessionService.isAuthenticated) {
    return router.parseUrl("/login");
  }
  return true;
};
