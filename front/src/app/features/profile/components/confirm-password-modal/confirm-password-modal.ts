import {Component, effect, ElementRef, viewChild, input, output, signal, WritableSignal} from '@angular/core';
import {FieldTree, form, FormField, required, SchemaPathTree} from "@angular/forms/signals";
import {Title} from "../../../../shared/components/title/title";
import {Input} from "../../../../shared/components/input/input";
import {Button} from "../../../../shared/components/button/button";

interface ConfirmPasswordData {
  currentPassword: string;
}

const initialData: ConfirmPasswordData = { currentPassword: '' };

const validation = (schemaPath: SchemaPathTree<ConfirmPasswordData>) => {
  required(schemaPath.currentPassword, {message: 'Le mot de passe actuel est requis'});
};

let nextConfirmPasswordModalId = 0;

@Component({
  selector: 'app-confirm-password-modal',
  imports: [FormField, Title, Input, Button],
  templateUrl: './confirm-password-modal.html',
})
export class ConfirmPasswordModal {
  readonly titleId = `confirm-password-title-${nextConfirmPasswordModalId++}`;

  open = input(false);
  confirm = output<string>();
  cancel = output<void>();

  readonly confirmText = "Confimer";
  readonly cancelText = "Annuler";
  readonly title = "Confirmer le mot de passe";
  readonly description = "Veuillez saisir votre mot de passe actuel pour confirmer la modification.";

  private dialogRef = viewChild<ElementRef<HTMLDialogElement>>('dialog');

  model: WritableSignal<ConfirmPasswordData> = signal(initialData);
  passwordForm: FieldTree<ConfirmPasswordData> = form(this.model, validation);

  constructor() {
    effect(() => {
      const dialog = this.dialogRef()?.nativeElement;
      if (!dialog) return;
      if (this.open() && !dialog.open) dialog.showModal();
      if (!this.open() && dialog.open) dialog.close();
    });
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    if (this.passwordForm().invalid()) return;
    this.confirm.emit(this.passwordForm.currentPassword().value());
    this.model.set(initialData);
  }

  onCancel(): void {
    this.model.set(initialData);
    this.cancel.emit();
  }
}
