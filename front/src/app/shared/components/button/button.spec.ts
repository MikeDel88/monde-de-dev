import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Button } from './button';
import {describe, beforeEach, expect, it} from "@jest/globals";
import {By} from "@angular/platform-browser";

describe('Button', () => {
  let component: Button;
  let fixture: ComponentFixture<Button>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Button]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Button);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('type', 'button');
    fixture.componentRef.setInput('text', 'Valider');
    fixture.componentRef.setInput('disabled', false);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the text and type', () => {
    const button = fixture.debugElement.query(By.css('button')).nativeElement as HTMLButtonElement;
    expect(button.textContent).toContain('Valider');
    expect(button.type).toBe('button');
  });

  it('should disable the button when disabled is true', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('button')).nativeElement as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it('should display the normal variant by default', () => {
    const button = fixture.debugElement.query(By.css('button')).nativeElement as HTMLButtonElement;
    expect(button.className).toContain('bg-primary');
  });

  it("should display outlined button", () => {
    fixture.componentRef.setInput('display', 'outlined');
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('button')).nativeElement as HTMLButtonElement;
    expect(button.className).toContain('border');
    expect(button.className).toContain('border-primary');
  });

  it('should apply the disabled class when disabled is true', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('button')).nativeElement as HTMLButtonElement;
    expect(button.className).toContain('bg-btn-disabled');
  });
});
