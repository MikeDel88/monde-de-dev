import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Logo } from './logo';
import {describe, expect, it, beforeEach} from "@jest/globals";
import {By} from "@angular/platform-browser";
import {DebugElement} from "@angular/core";

describe('Logo', () => {
  let component: Logo;
  let fixture: ComponentFixture<Logo>;
  let logo: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Logo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Logo);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("width", 50);
    fixture.componentRef.setInput("height", 100);
    logo = fixture.debugElement.query(By.css('img'));
    fixture.detectChanges();

  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it("should display logo.png", () => {
    expect(logo.attributes["src"]).toContain("logo.png");
  });

  it("should contain width and height", () => {
    expect(logo.attributes["width"]).toBe("50");
    expect(logo.attributes["height"]).toBe("100");
  });
});
