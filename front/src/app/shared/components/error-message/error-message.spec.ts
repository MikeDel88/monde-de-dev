import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorMessage } from './error-message';
import {describe, beforeEach, expect, it} from "@jest/globals";
import { By } from "@angular/platform-browser";

describe('ErrorMessage', () => {
  let component: ErrorMessage;
  let fixture: ComponentFixture<ErrorMessage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorMessage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ErrorMessage);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('message', 'error message');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it("should display error when message exist", () => {
    const error = fixture.debugElement.query(By.css('[data-test="error"]'));
    expect(error).toBeTruthy();
  })

  it("should not display error when message is undefined", () => {
    fixture.componentRef.setInput('message', undefined);
    fixture.detectChanges();
    const error = fixture.debugElement.query(By.css('[data-test="error"]'));
    expect(error).toBeFalsy();
  });

  it("should contain class text-error for error message", () => {
    const error = fixture.debugElement.query(By.css('[data-test="error"]')).nativeElement as HTMLElement;
    expect(error.className).toContain('text-error');
  });
});
