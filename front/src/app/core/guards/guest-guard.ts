import {CanActivateFn, Router, UrlTree} from "@angular/router";
import {inject} from "@angular/core";
import {SessionService} from "../services/session-service";

/**
 * Protège les routes réservées aux visiteurs non connectés (login, register).
 * Renvoie un `UrlTree` vers `/feed` pour rediriger un utilisateur déjà authentifié
 * plutôt que de simplement bloquer l'accès à la page.
 */
export const guestGuard: CanActivateFn = (): boolean | UrlTree => {
  const router = inject(Router);
  const sessionService = inject(SessionService);

  if (sessionService.isAuthenticated) {
    return router.parseUrl("/feed");
  }
  return true;
};
