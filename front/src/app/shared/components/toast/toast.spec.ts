import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Toast } from './toast';
import {describe, beforeEach, it, expect} from "@jest/globals";
import {By} from "@angular/platform-browser";

describe('Toast', () => {
  let component: Toast;
  let fixture: ComponentFixture<Toast>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Toast]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Toast);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not display the toast when visible is false', () => {
    const alert = fixture.debugElement.query(By.css('[role="alert"]'));
    expect(alert).toBeFalsy();
  });

  it('should display the toast when visible is true', () => {
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();

    const alert = fixture.debugElement.query(By.css('[role="alert"]'));
    expect(alert).toBeTruthy();
  });

  it('should display the message', () => {
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('message', 'Saved successfully');
    fixture.detectChanges();

    const message = fixture.debugElement.query(By.css('h4')).nativeElement as HTMLElement;
    expect(message.textContent).toContain('Saved successfully');
  });

  it.each([
    ['success', 'border-green-500'],
    ['error', 'border-red-500'],
    ['warning', 'border-amber-500'],
  ] as const)('should apply the "%s" variant classes', (type, cardClass) => {
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('type', type);
    fixture.detectChanges();

    const alert = fixture.debugElement.query(By.css('[role="alert"]')).nativeElement as HTMLElement;
    expect(alert.className).toContain(cardClass);
  });

  it('should default to the success variant', () => {
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();

    const alert = fixture.debugElement.query(By.css('[role="alert"]')).nativeElement as HTMLElement;
    expect(alert.className).toContain('border-green-500');
  });

  it('should emit buttonClick with the click event when the close button is clicked', () => {
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();

    let emittedEvent: Event | undefined;
    component.buttonClick.subscribe((event) => (emittedEvent = event));

    const closeButton = fixture.debugElement.query(By.css('button[aria-label="Close"]')).nativeElement as HTMLButtonElement;
    closeButton.click();

    expect(emittedEvent).toBeInstanceOf(Event);
  });
});
