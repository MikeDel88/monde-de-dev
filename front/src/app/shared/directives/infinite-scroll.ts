import {Directive, DestroyRef, ElementRef, afterNextRender, inject, output, OutputEmitterRef} from '@angular/core';

@Directive({
  selector: '[appInfiniteScroll]',
})
export class InfiniteScroll {

  private readonly elementRef: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  readonly nearEnd: OutputEmitterRef<void> = output<void>();

  constructor() {
    afterNextRender(() => {
      const observer = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          this.nearEnd.emit();
        }
      });

      observer.observe(this.elementRef.nativeElement);
      this.destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
