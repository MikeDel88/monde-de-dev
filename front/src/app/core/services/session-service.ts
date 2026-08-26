import { Service } from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";

@Service()
export class SessionService {

  private static readonly TOKEN_KEY: string = 'token';

  private isLoggedSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(!!localStorage.getItem(SessionService.TOKEN_KEY));

  public isLogged$(): Observable<boolean> {
    return this.isLoggedSubject.asObservable();
  }

  public get isAuthenticated(): boolean {
    return this.isLoggedSubject.value;
  }

  public getToken(): string | null {
    return localStorage.getItem(SessionService.TOKEN_KEY);
  }

  public logIn(token: string): void {
    localStorage.setItem(SessionService.TOKEN_KEY, token);
    this.isLoggedSubject.next(true);
  }

  public logOut(): void {
    localStorage.removeItem(SessionService.TOKEN_KEY);
    this.isLoggedSubject.next(false);
  }
}
