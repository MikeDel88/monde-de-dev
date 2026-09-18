import {Component, DestroyRef, inject, signal, WritableSignal} from '@angular/core';
import {FieldState, FieldTree, form, FormField, required, SchemaPathTree} from "@angular/forms/signals";
import {AuthService} from "../../services/auth-service";
import {Router} from "@angular/router";
import {LoginData} from "../../models/login-data";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {Button} from "../../../../shared/components/button/button";
import {Input} from "../../../../shared/components/input/input";
import {ToastService} from "../../../../core/services/toast-service";

const initialLoginData: LoginData = {
  emailOrName: "",
  password: ''
};

const validationLoginForm = (schemaPath: SchemaPathTree<LoginData>) => {
  required(schemaPath.emailOrName);
  required(schemaPath.password);
}

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  imports: [FormField, Button, Input]
})
export class Login {

  readonly btnText: string = "Se connecter";
  readonly labelEmailOrName: string = "E-mail ou nom d'utilisateur";
  readonly labelPassword: string = "Mot de passe";

  private readonly destroyRef: DestroyRef = inject(DestroyRef);
  private readonly router: Router = inject(Router);
  private readonly authService: AuthService = inject(AuthService);
  private readonly toastService = inject(ToastService);

  private readonly loginModel: WritableSignal<LoginData> = signal<LoginData>(initialLoginData);
  loginForm: FieldTree<LoginData> = form(this.loginModel, validationLoginForm);

  onFocus(): void {
    this.toastService.clear();
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    this.loginForm().markAsTouched();
    if (this.loginForm().invalid()) {
      return;
    }
    const credentials: FieldState<LoginData> = this.loginForm();
    this.authService.login$(credentials.value())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (isAuthenticated: boolean) => {
          this.loginForm().reset(initialLoginData);
          if(isAuthenticated) {
            this.router.navigate(['/feed']);
          }
        },
        error: (error) => this.toastService.showError(error),
      });
  }
}
