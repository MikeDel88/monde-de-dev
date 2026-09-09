import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Dividers } from './dividers';
import {describe,beforeEach, expect, it} from "@jest/globals";
import {By} from "@angular/platform-browser";

describe('Dividers', () => {
  let component: Dividers;
  let fixture: ComponentFixture<Dividers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dividers]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Dividers);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it("should contain hr", () => {
    const divider = fixture.debugElement.query(By.css('hr'));
    expect(divider).toBeTruthy();
  });
});
