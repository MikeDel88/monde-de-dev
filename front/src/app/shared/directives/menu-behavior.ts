import {Directive, signal, WritableSignal, Signal, computed, output, OutputEmitterRef} from '@angular/core';

const MOBILE_BREAKPOINT_PX = 640;

@Directive({
  selector: '[appMenuBehavior]',
  host: {
    '(window:resize)': 'onResize()',
    '(document:keydown.escape)': 'close()',
  },
})
export class MenuBehavior {

  private readonly width: WritableSignal<number> = signal(window.innerWidth);

  readonly isMobile: Signal<boolean> = computed(() => this.width() < MOBILE_BREAKPOINT_PX);
  readonly open: WritableSignal<boolean> = signal(false);

  readonly menuClosed: OutputEmitterRef<void> = output<void>();

  toggle(): void {
    this.open.set(!this.open());
  }

  close(): void {
    if (this.open()) {
      this.open.set(false);
      this.menuClosed.emit();
    }
  }

  onResize(): void {
    this.width.set(window.innerWidth);
    if (!this.isMobile()) {
      this.close();
    }
  }
}
