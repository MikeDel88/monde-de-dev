import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Back } from './back';
import {describe, beforeEach, it, expect} from "@jest/globals";
import {By} from "@angular/platform-browser";

describe('Back', () => {
  let component: Back;
  let fixture: ComponentFixture<Back>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Back]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Back);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it("should display the arrow-back image", () => {
    const img = fixture.debugElement.query(By.css('img'));
    expect(img).toBeTruthy();
    expect(img.attributes['src']).toContain('arrow-back.png');
  });

  it("should call onBack() when the button is clicked", () => {
    let emitted = false;
    component.nav.subscribe(() => (emitted = true));

    fixture.debugElement.query(By.css('[data-test="btn-back"]')).nativeElement.click();

    expect(emitted).toBeTruthy();
  });
});
