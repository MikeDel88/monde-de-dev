import {Component, DestroyRef, inject, signal} from '@angular/core';
import {
  form,
  FormField,
  required,
  email,
  minLength,
  pattern,
  SchemaPathTree
} from '@angular/forms/signals';
import {Location} from "@angular/common";
import {AuthService} from "../../core/services/auth-service";
import {RegisterData} from "../../core/models/register-data";
import {Toast} from "../../components/toasts/toast";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

const initialRegisterData: RegisterData = {
  name: "",
  email: '',
  password: ''
};

const registerModel = signal<RegisterData>(initialRegisterData);

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
  imports: [FormField, Toast],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private readonly destroyRef = inject(DestroyRef);
  private readonly location = inject(Location);
  private readonly authService = inject(AuthService);
  error = signal<string | undefined>(undefined);
  showToastSuccessfully = signal(false)

  registerForm = form(registerModel, validationRegisterForm);

  onBack() {
    this.location.back();
  }

  onReset() {
    this.showToastSuccessfully.set(false);
    this.error.set(undefined);
  }

  onFocus() {
    this.error.set(undefined);
  }

  onSubmit(event: Event) {
    event.preventDefault();
    const credentials = this.registerForm();
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
