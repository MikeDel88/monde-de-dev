import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { ErrorToastService } from './core/services/error-toast-service';
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

  it('should display the error toast when ErrorToastService reports an error', () => {
    const errorToastService = TestBed.inject(ErrorToastService);

    errorToastService.showError(new AppError('Une erreur globale', 500));
    fixture.detectChanges();

    const toast = fixture.debugElement.query(By.css('[data-test="error-toast"] [role="alert"]'));
    expect(toast.nativeElement.textContent).toContain('Une erreur globale');
  });
});
