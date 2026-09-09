import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Title } from './title';
import {describe, expect, it, beforeEach} from "@jest/globals";
import {By} from "@angular/platform-browser";

describe('Title', () => {
  let component: Title;
  let fixture: ComponentFixture<Title>;
  let title: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Title]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Title);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("content", "title");
    fixture.detectChanges();
    title = fixture.debugElement.query(By.css('[data-test="title"]')).nativeElement as HTMLElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it("should display title", () => {
    expect(title.textContent).toEqual("title");
  });

  it.each([
    [1],
    [2],
    [3],
    [4],
    [5],
    [6],
  ])('level "%s"', (level: number) => {

    fixture.componentRef.setInput("level", level);
    fixture.detectChanges();

    const titleLevel = fixture.debugElement.query(By.css(`h${level}`));
    expect(titleLevel).toBeTruthy();
  });
});
