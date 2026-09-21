import {Directive, signal, WritableSignal, Signal, computed, output, OutputEmitterRef} from '@angular/core';

/** Largeur en dessous de laquelle le menu est considéré comme étant en mode mobile (repliable). */
const MOBILE_BREAKPOINT_PX = 640;

/**
 * Factorise le comportement d'un menu repliable : détection du mode mobile selon
 * la largeur de fenêtre, ouverture/fermeture, et fermeture automatique sur `Échap`
 * ou lors du passage en mode desktop (le menu desktop n'a pas d'état ouvert/fermé).
 */
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

  /** Émis uniquement quand le menu se ferme alors qu'il était ouvert (pas à l'état initial). */
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

  /**
   * Recalcule le mode mobile/desktop à chaque redimensionnement et referme
   * automatiquement le menu s'il repasse en mode desktop.
   */
  onResize(): void {
    this.width.set(window.innerWidth);
    if (!this.isMobile()) {
      this.close();
    }
  }
}
