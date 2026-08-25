import {Component, DestroyRef, inject, signal} from '@angular/core';
import {form, FormField, required, SchemaPathTree} from "@angular/forms/signals";
import {AuthService} from "../../core/services/auth-service";
import {Router} from "@angular/router";
import {LoginData} from "../../core/models/login-data";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {Auth} from "../../components/auth/auth";

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
  imports: [FormField, Auth]
})
export class Login {

  title: string = "Se connecter"
  btnText: string = "Se connecter"
  labelEmailOrName: string = "E-mail ou nom d'utilisateur"
  labelPassword: string = "Mot de passe"

  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  error = signal<string | undefined>(undefined);

  loginForm = form(loginModel, validationLoginForm);

  onFocus() {
    this.error.set(undefined);
  }

  onSubmit(event: Event) {
    event.preventDefault();
    const credentials = this.loginForm();
    this.authService.login$(credentials.value())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (isAuthenticated) => {
          this.loginForm().reset(initialLoginData);
          if(isAuthenticated) {
            this.router.navigate(['/feed']);
          }
        },
        error: (error: Error) => this.error.set(error.message),
      });
  }
}
