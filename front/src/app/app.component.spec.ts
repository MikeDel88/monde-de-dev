import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { ToastService } from './core/services/toast-service';
import { AppError } from './core/models/app-error';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display an error toast when ToastService reports an error', () => {
    const toastService = TestBed.inject(ToastService);

    toastService.showError(new AppError('Une erreur globale', 500));
    fixture.detectChanges();

    const toast = fixture.debugElement.query(By.css('[data-test="app-toast"] [role="alert"]'));
    expect(toast.nativeElement.textContent).toContain('Une erreur globale');
    expect(toast.nativeElement.className).toContain('border-red-500');
  });

  it('should display a success toast when ToastService reports a success', () => {
    const toastService = TestBed.inject(ToastService);

    toastService.showSuccess('Sauvegardé');
    fixture.detectChanges();

    const toast = fixture.debugElement.query(By.css('[data-test="app-toast"] [role="alert"]'));
    expect(toast.nativeElement.textContent).toContain('Sauvegardé');
    expect(toast.nativeElement.className).toContain('border-green-500');
  });
});
