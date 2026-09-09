import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostCard } from './post-card';
import {describe, expect, beforeEach, it} from "@jest/globals";
import {PostFeed} from "../../../features/feed/models/post-feed";
import {By} from "@angular/platform-browser";

const MOCK_POST: PostFeed = {
  id: 1,
  title: 'Test Post',
  preview: 'this is a test post.',
  date: "2024-06-01T12:00:00Z",
  author: 'john'
}

describe('PostCard', () => {
  let component: PostCard;
  let fixture: ComponentFixture<PostCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostCard);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("post", MOCK_POST);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it("should display title", () => {
    const title = fixture.debugElement.query(By.css('h3')).nativeElement as HTMLElement;
    expect(title.textContent).toBe("Test Post");
  });

  it("shoudl display date with dd/MM/yyyy format", () => {
    const date = fixture.debugElement.query(By.css('[data-test="date"]')).nativeElement as HTMLElement;
    expect(date.textContent).toBe("01/06/2024");
  });

  it("should display author with first char upper", () => {
    const author = fixture.debugElement.query(By.css('[data-test="author"]')).nativeElement as HTMLElement;
    expect(author.textContent).toBe("John");
  });

  it("should display preview with first char upper", () => {
    const preview = fixture.debugElement.query(By.css('[data-test="preview"]')).nativeElement;
    expect(preview.textContent).toBe("This is a test post.");
  })

  it("should display ariaLabel in button when set", () => {
    fixture.componentRef.setInput("ariaLabel", "post");
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('[data-test="button"]'));
    expect(button.attributes["aria-label"]).toBe("post");
  });

  it("should not display ariaLabel in button when not set", () => {
    const button = fixture.debugElement.query(By.css('[data-test="button"]'));
    expect(button.attributes["aria-label"]).toBeUndefined();
  });

  it("should call clickPost() when click button", () => {
    let emitted = false;
    component.clickPost.subscribe(() => (emitted = true));

    fixture.debugElement.query(By.css('[data-test="button"]')).nativeElement.click();

    expect(emitted).toBeTruthy();
  });
});
