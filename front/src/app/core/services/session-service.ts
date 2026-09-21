import { Service } from '@angular/core';
import {BehaviorSubject} from "rxjs";

/**
 * Source de vérité locale (côté client) de l'état d'authentification. Ne détient aucune
 * information de session à proprement parler : la session réelle est un cookie géré par
 * le backend, ce service ne fait que refléter localement si l'utilisateur est connu comme connecté.
 */
@Service()
export class SessionService {

  private isLoggedSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  public get isAuthenticated(): boolean {
    return this.isLoggedSubject.value;
  }

  public logIn(): void {
    this.isLoggedSubject.next(true);
  }

  public logOut(): void {
    this.isLoggedSubject.next(false);
  }
}
