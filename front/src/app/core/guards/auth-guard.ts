import {CanActivate, Router, UrlTree} from "@angular/router";
import {inject, Service} from "@angular/core";
import {SessionService} from "../services/session-service";

@Service()
export class AuthGuard implements CanActivate {

  private readonly router = inject(Router);
  private sessionService = inject(SessionService);

  public canActivate(): boolean | UrlTree {
    if (!this.sessionService.isAuthenticated) {
      return this.router.parseUrl("/login");
    }
    return true;
  }
}
