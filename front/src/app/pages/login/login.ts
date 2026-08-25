import {Component, DestroyRef, inject, OnInit, signal} from '@angular/core';
import {form, FormField, required, SchemaPathTree} from "@angular/forms/signals";
import {Location} from "@angular/common";
import {AuthService} from "../../core/services/auth-service";
import {Router} from "@angular/router";
import {LoginData} from "../../core/models/login-data";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

const initialLoginData: LoginData = {
  emailOrName: "",
  password: ''
};

const loginModel = signal<LoginData>(initialLoginData);

const validationLoginForm = (schemaPath: SchemaPathTree<LoginData>) => {
  required(schemaPath.emailOrName);
  required(schemaPath.password);
}

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrl: './login.css',
  imports: [FormField]
})
export class Login {

  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly authService = inject(AuthService);
  error = signal<string | undefined>(undefined);

  loginForm = form(loginModel, validationLoginForm);

  onBack() {
    this.location.back();
  }

  onFocus() {
    this.error.set(undefined);
  }

  onSubmit(event: Event) {
    event.preventDefault();
    const credentials = this.loginForm();
    this.authService.login$(credentials.value())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loginForm().reset(initialLoginData);
          this.router.navigate(['/']);
        },
        error: (error: Error) => this.error.set(error.message),
      });
  }
}
