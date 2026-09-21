import {Directive, DestroyRef, ElementRef, afterNextRender, inject, output, OutputEmitterRef} from '@angular/core';

/**
 * Émet {@link nearEnd} dès que l'élément hôte devient visible dans le viewport,
 * via un `IntersectionObserver`. Sert typiquement de sentinelle en bas d'une liste
 * pour déclencher le chargement de la page suivante (scroll infini).
 * L'observation démarre après le premier rendu (`afterNextRender`) et est
 * automatiquement arrêtée à la destruction de la directive.
 */
@Directive({
  selector: '[appInfiniteScroll]',
})
export class InfiniteScroll {

  private readonly elementRef: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  /** Émis à chaque fois que l'élément hôte entre dans le viewport. */
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
