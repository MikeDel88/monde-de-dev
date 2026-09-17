import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, beforeEach, afterEach, it, expect, jest } from '@jest/globals';
import { By } from '@angular/platform-browser';

import { InfiniteScroll } from './infinite-scroll';

let observedCallback: IntersectionObserverCallback | undefined;
const observeSpy = jest.fn();
const disconnectSpy = jest.fn();

class IntersectionObserverMock {
  constructor(callback: IntersectionObserverCallback) {
    observedCallback = callback;
  }
  observe = observeSpy;
  disconnect = disconnectSpy;
  unobserve = jest.fn();
  takeRecords = jest.fn(() => []);
  root = null;
  rootMargin = '';
  thresholds: ReadonlyArray<number> = [];
}

@Component({
  selector: 'app-infinite-scroll-host',
  imports: [InfiniteScroll],
  template: `<div appInfiniteScroll (nearEnd)="onNearEnd()"></div>`,
})
class InfiniteScrollHost {
  nearEndCount = 0;
  onNearEnd(): void {
    this.nearEndCount++;
  }
}

describe('InfiniteScroll', () => {
  let fixture: ComponentFixture<InfiniteScrollHost>;
  let host: InfiniteScrollHost;
  const originalIntersectionObserver = window.IntersectionObserver;

  beforeEach(async () => {
    observedCallback = undefined;
    observeSpy.mockClear();
    disconnectSpy.mockClear();
    (window as any).IntersectionObserver = IntersectionObserverMock;

    await TestBed.configureTestingModule({
      imports: [InfiniteScrollHost],
    }).compileComponents();

    fixture = TestBed.createComponent(InfiniteScrollHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    window.IntersectionObserver = originalIntersectionObserver;
  });

  it('should observe its host element', () => {
    expect(observeSpy).toHaveBeenCalledWith(fixture.debugElement.query(By.directive(InfiniteScroll)).nativeElement);
  });

  it('should emit nearEnd when the sentinel intersects the viewport', () => {
    observedCallback?.([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);

    expect(host.nearEndCount).toBe(1);
  });

  it('should not emit nearEnd when the sentinel is not intersecting', () => {
    observedCallback?.([{ isIntersecting: false } as IntersectionObserverEntry], {} as IntersectionObserver);

    expect(host.nearEndCount).toBe(0);
  });

  it('should disconnect the observer on destroy', () => {
    fixture.destroy();

    expect(disconnectSpy).toHaveBeenCalled();
  });
});
