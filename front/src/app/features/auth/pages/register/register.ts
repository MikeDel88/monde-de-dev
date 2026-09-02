import {Component, DestroyRef, inject, signal, WritableSignal} from '@angular/core';
import {
  form,
  FormField,
  required,
  email,
  minLength,
  pattern,
  SchemaPathTree, FieldTree, FieldState
} from '@angular/forms/signals';
import {AuthService} from "../../services/auth-service";
import {RegisterData} from "../../models/register-data";
import {Toast} from "../../../../shared/components/toasts/toast";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {Button} from "../../../../shared/components/buttons/button";
import {Error as AppError} from "../../../../shared/components/errors/error";
import {Input} from "../../../../shared/components/input/input";

const initialRegisterData: RegisterData = {
  name: "",
  email: '',
  password: ''
};

const registerModel: WritableSignal<RegisterData> = signal<RegisterData>(initialRegisterData);

const validationRegisterForm = (schemaPath: SchemaPathTree<RegisterData>) => {
  required(schemaPath.name);
  required(schemaPath.email);
  email(schemaPath.email, {message: 'Email invalide'});
  required(schemaPath.password);
  minLength(schemaPath.password, 8, {message: 'Doit être supérieur ou égal à 8 caractères'});
  pattern(schemaPath.password,
    /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).+$/,
    {message: 'Doit contenir au moins une lettre Majuscule, Minuscule, un chiffre et un caractère spécial'});
}

@Component({
  selector: 'app-register',
  imports: [FormField, Toast, Button, AppError, Input],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {

  readonly btnText: string = "S'inscrire";
  readonly labelName: string = "Nom d'utilisateur";
  readonly labelEmail: string = "Adresse e-mail";
  readonly labelPassword: string = "Mot de passe";

  private readonly destroyRef: DestroyRef = inject(DestroyRef);
  private readonly authService: AuthService = inject(AuthService);
  error: WritableSignal<string | undefined> = signal<string | undefined>(undefined);
  showToastSuccessfully: WritableSignal<boolean> = signal(false)

  registerForm: FieldTree<RegisterData> = form(registerModel, validationRegisterForm);


  onReset(): void {
    this.showToastSuccessfully.set(false);
    this.error.set(undefined);
  }

  onFocus(): void {
    this.error.set(undefined);
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    this.registerForm().markAsTouched();
    if (this.registerForm().invalid()) {
      return;
    }
    const credentials: FieldState<RegisterData> = this.registerForm();
    this.authService.register$(credentials.value())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.registerForm().reset(initialRegisterData);
          this.showToastSuccessfully.set(true);
        },
        error: (error: Error) => this.error.set(error.message),
      });
  }
}
