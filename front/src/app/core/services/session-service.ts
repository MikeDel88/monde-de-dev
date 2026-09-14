import { Service } from '@angular/core';
import {BehaviorSubject} from "rxjs";

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
