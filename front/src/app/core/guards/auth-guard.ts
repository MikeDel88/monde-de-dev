import {CanActivateFn, Router, UrlTree} from "@angular/router";
import {inject} from "@angular/core";
import {SessionService} from "../services/session-service";

/**
 * Protège les routes réservées aux utilisateurs connectés. Renvoie un `UrlTree` vers
 * `/login` (plutôt qu'un simple `false`) pour que le routeur redirige directement
 * l'utilisateur non authentifié au lieu de simplement bloquer la navigation.
 */
export const authGuard: CanActivateFn = (): boolean | UrlTree => {
  const router = inject(Router);
  const sessionService = inject(SessionService);

  if (!sessionService.isAuthenticated) {
    return router.parseUrl("/login");
  }
  return true;
};
