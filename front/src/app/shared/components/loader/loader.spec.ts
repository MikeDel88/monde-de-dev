import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Loader } from './loader';
import {describe, expect, it, beforeEach} from "@jest/globals";
import {By} from "@angular/platform-browser";

describe('Loader', () => {
  let component: Loader;
  let fixture: ComponentFixture<Loader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Loader]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Loader);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it("should display loader", () => {
    const loader = fixture.debugElement.query(By.css('.loader')).nativeElement as HTMLElement;
    expect(loader.className).toContain('loader');
  });
});
