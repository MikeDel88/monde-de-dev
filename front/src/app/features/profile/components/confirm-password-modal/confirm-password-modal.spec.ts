import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, beforeEach, it, expect, jest } from '@jest/globals';
import { By } from '@angular/platform-browser';

import { ConfirmPasswordModal } from './confirm-password-modal';

describe('ConfirmPasswordModal', () => {
  let component: ConfirmPasswordModal;
  let fixture: ComponentFixture<ConfirmPasswordModal>;

  const submit = () => {
    fixture.debugElement.query(By.css('form')).triggerEventHandler('submit', new Event('submit'));
    fixture.detectChanges();
  };

  beforeEach(async () => {
    HTMLDialogElement.prototype.showModal = jest.fn(function (this: HTMLDialogElement) {
      this.open = true;
    });
    HTMLDialogElement.prototype.close = jest.fn(function (this: HTMLDialogElement) {
      this.open = false;
    });

    await TestBed.configureTestingModule({
      imports: [ConfirmPasswordModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmPasswordModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open the dialog when openModal is true', () => {
    fixture.componentRef.setInput('openModal', true);
    fixture.detectChanges();

    const dialog = fixture.debugElement.query(By.css('dialog')).nativeElement as HTMLDialogElement;
    expect(dialog.showModal).toHaveBeenCalled();
    expect(dialog.open).toBe(true);
  });

  it('should close the dialog when openModal is false', () => {
    fixture.componentRef.setInput('openModal', true);
    fixture.detectChanges();
    fixture.componentRef.setInput('openModal', false);
    fixture.detectChanges();

    const dialog = fixture.debugElement.query(By.css('dialog')).nativeElement as HTMLDialogElement;
    expect(dialog.close).toHaveBeenCalled();
    expect(dialog.open).toBe(false);
  });

  it('should disable the confirm button when the password is empty', () => {
    const confirmButton = fixture.debugElement.query(By.css('[data-test="btn-confirm"] button')).nativeElement as HTMLButtonElement;
    expect(confirmButton.disabled).toBe(true);
  });

  it('should enable the confirm button when the password is filled', () => {
    component.passwordForm.currentPassword().value.set('CurrentPass1!');
    fixture.detectChanges();

    const confirmButton = fixture.debugElement.query(By.css('[data-test="btn-confirm"] button')).nativeElement as HTMLButtonElement;
    expect(confirmButton.disabled).toBe(false);
  });

  it('should not emit confirmPassword when the password is empty', () => {
    let emitted: string | undefined;
    component.confirmPassword.subscribe((value) => (emitted = value));

    submit();

    expect(emitted).toBeUndefined();
  });

  it('should emit confirmPassword with the entered password on submit', () => {
    let emitted: string | undefined;
    component.confirmPassword.subscribe((value) => (emitted = value));
    component.passwordForm.currentPassword().value.set('CurrentPass1!');
    fixture.detectChanges();

    submit();

    expect(emitted).toBe('CurrentPass1!');
  });

  it('should reset the password field after a successful submit', () => {
    component.passwordForm.currentPassword().value.set('CurrentPass1!');
    fixture.detectChanges();

    submit();

    expect(component.passwordForm.currentPassword().value()).toBe('');
  });

  it('should emit cancelModal and reset the password field when the cancel button is clicked', () => {
    let cancelled = false;
    component.cancelModal.subscribe(() => (cancelled = true));
    component.passwordForm.currentPassword().value.set('CurrentPass1!');
    fixture.detectChanges();

    fixture.debugElement.query(By.css('[data-test="btn-cancel"] button')).nativeElement.click();

    expect(cancelled).toBeTruthy();
    expect(component.passwordForm.currentPassword().value()).toBe('');
  });
});
