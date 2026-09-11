import { ComponentFixture, TestBed } from '@angular/core/testing';

import { describe, it, expect, beforeEach } from '@jest/globals';
import { By } from '@angular/platform-browser';

import { TopicCard } from './topic-card';
import { Topic } from '../../../features/topic/models/topic';

const MOCK_TOPIC: Topic = { id: 1, title: 'Topic 1', description: 'Topic 1', subscribed: false };

describe('TopicCard', () => {
  let component: TopicCard;
  let fixture: ComponentFixture<TopicCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopicCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopicCard);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('topic', MOCK_TOPIC);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should disable the button when the topic is subscribed', () => {
    fixture.componentRef.setInput('topic', { ...MOCK_TOPIC, subscribed: true });
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('button')).nativeElement as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    expect(button.textContent).toContain('Déjà abonné');
  });

  it('should enable the button when the topic is not subscribed', () => {
    fixture.componentRef.setInput('topic', { ...MOCK_TOPIC, subscribed: false });
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('button')).nativeElement as HTMLButtonElement;
    expect(button.disabled).toBe(false);
    expect(button.textContent).toContain("S'abonner");
  });
});
