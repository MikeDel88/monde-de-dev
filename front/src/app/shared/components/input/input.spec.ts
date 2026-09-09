import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Input } from './input';
import {describe, beforeEach, it, expect, jest} from "@jest/globals";
import {By} from "@angular/platform-browser";
import {ValidationError} from "@angular/forms/signals";
import {Error} from "../error/error";

describe('Input', () => {
  let component: Input;
  let fixture: ComponentFixture<Input>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Input]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Input);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('type', 'text');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render inside a label when label is set', () => {
    fixture.componentRef.setInput('label', 'Email');
    fixture.detectChanges();

    const label = fixture.debugElement.query(By.css('label'));
    expect(label.nativeElement.textContent).toContain('Email');
  });

  it('should not render a label when label is not set', () => {
    const label = fixture.debugElement.query(By.css('label'));
    expect(label).toBeFalsy();
  });

  it('should reflect the value input on the native input', () => {
    fixture.componentRef.setInput('value', 'hello');
    fixture.detectChanges();

    const input = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
    expect(input.value).toBe('hello');
  });

  it('should update the value model when the user types', () => {
    const input = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
    input.value = 'typed';
    input.dispatchEvent(new Event('input'));

    expect(component.value()).toBe('typed');
  });

  it('should emit touch on blur', () => {
    let touched = false;
    component.touch.subscribe(() => (touched = true));

    fixture.debugElement.query(By.css('input')).nativeElement.dispatchEvent(new Event('blur'));

    expect(touched).toBeTruthy();
  });

  it('should mark the input as invalid when touched and invalid', () => {
    fixture.componentRef.setInput('touched', true);
    fixture.componentRef.setInput('invalid', true);
    fixture.detectChanges();

    const input = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe(component.errorId);
  });

  it('should display errors when touched and invalid', () => {
    fixture.componentRef.setInput('touched', true);
    fixture.componentRef.setInput('invalid', true);
    fixture.componentRef.setInput('errors', [{ kind: 'required', message: 'Champ requis' } as ValidationError]);
    fixture.detectChanges();

    const errors = fixture.debugElement.queryAll(By.directive(Error));
    expect(errors.length).toBe(1);
    expect(errors[0].componentInstance.message()).toBe('Champ requis');
  });

  it('should not display errors when not touched', () => {
    fixture.componentRef.setInput('invalid', true);
    fixture.componentRef.setInput('errors', [{ kind: 'required', message: 'Champ requis' } as ValidationError]);
    fixture.detectChanges();

    expect(fixture.debugElement.queryAll(By.directive(Error)).length).toBe(0);
  });

  it('should focus the native input when focus() is called', () => {
    const input = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
    const focusSpy = jest.spyOn(input, 'focus');

    component.focus();

    expect(focusSpy).toHaveBeenCalled();
  });
});
