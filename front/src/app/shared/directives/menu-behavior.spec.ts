import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, beforeEach, afterEach, it, expect } from '@jest/globals';
import { By } from '@angular/platform-browser';

import { MenuBehavior } from './menu-behavior';

@Component({
  selector: 'app-menu-behavior-host',
  imports: [MenuBehavior],
  template: `<div appMenuBehavior></div>`,
})
class MenuBehaviorHost {}

const setWindowWidth = (width: number) => {
  Object.defineProperty(window, 'innerWidth', { value: width, writable: true, configurable: true });
};

describe('MenuBehavior', () => {
  let fixture: ComponentFixture<MenuBehaviorHost>;
  let directive: MenuBehavior;
  const originalInnerWidth = window.innerWidth;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuBehaviorHost],
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuBehaviorHost);
    fixture.detectChanges();

    directive = fixture.debugElement.query(By.directive(MenuBehavior)).injector.get(MenuBehavior);
  });

  afterEach(() => {
    setWindowWidth(originalInnerWidth);
  });

  it('should create', () => {
    expect(directive).toBeTruthy();
  });

  it('should be closed by default', () => {
    expect(directive.open()).toBe(false);
  });

  describe('toggle', () => {
    it('should open the menu when closed', () => {
      directive.toggle();
      expect(directive.open()).toBe(true);
    });

    it('should close the menu when open', () => {
      directive.toggle();
      directive.toggle();
      expect(directive.open()).toBe(false);
    });
  });

  describe('close', () => {
    it('should close the menu and emit menuClosed when open', () => {
      let closed = false;
      directive.menuClosed.subscribe(() => (closed = true));
      directive.toggle();

      directive.close();

      expect(directive.open()).toBe(false);
      expect(closed).toBeTruthy();
    });

    it('should not emit menuClosed when already closed', () => {
      let closed = false;
      directive.menuClosed.subscribe(() => (closed = true));

      directive.close();

      expect(closed).toBeFalsy();
    });
  });

  describe('isMobile', () => {
    it('should be false when the window is wider than the mobile breakpoint', () => {
      setWindowWidth(1024);
      window.dispatchEvent(new Event('resize'));

      expect(directive.isMobile()).toBe(false);
    });

    it('should be true when the window is narrower than the mobile breakpoint', () => {
      setWindowWidth(500);
      window.dispatchEvent(new Event('resize'));

      expect(directive.isMobile()).toBe(true);
    });
  });

  describe('onResize', () => {
    it('should close the menu when resizing from mobile to desktop while open', () => {
      setWindowWidth(500);
      window.dispatchEvent(new Event('resize'));
      directive.toggle();
      expect(directive.open()).toBe(true);

      setWindowWidth(1024);
      window.dispatchEvent(new Event('resize'));

      expect(directive.open()).toBe(false);
    });

    it('should not affect the menu when resizing while staying mobile', () => {
      setWindowWidth(500);
      window.dispatchEvent(new Event('resize'));
      directive.toggle();

      setWindowWidth(400);
      window.dispatchEvent(new Event('resize'));

      expect(directive.open()).toBe(true);
    });
  });

  describe('escape key', () => {
    it('should close the menu when pressing Escape', () => {
      directive.toggle();
      expect(directive.open()).toBe(true);

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

      expect(directive.open()).toBe(false);
    });
  });
});
