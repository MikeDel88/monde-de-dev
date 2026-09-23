import {Service, Signal} from '@angular/core';
import {createToastState, ToastState, ToastType} from '../../shared/utils/toast-state';

/** Délais de fermeture automatique (ms) par type de toast : plus long pour les erreurs, à laisser le temps de les lire. */
const SUCCESS_AUTO_CLOSE_MS = 2000;
const ERROR_AUTO_CLOSE_MS = 5000;
const WARNING_AUTO_CLOSE_MS = 4000;

/** API applicative au-dessus de {@link ToastState} : fixe un délai de fermeture par type de message. */
@Service()
export class ToastService {

  private readonly state: ToastState = createToastState();

  readonly message: Signal<string | undefined> = this.state.message;
  readonly visible: Signal<boolean> = this.state.visible;
  readonly type: Signal<ToastType> = this.state.type;

  showSuccess(message: string): void {
    this.state.show(message, 'success', SUCCESS_AUTO_CLOSE_MS);
  }

  /** Affiche le message d'une erreur (typiquement une {@link AppError} déjà traduite en français). */
  showError(err: Error): void {
    this.state.show(err.message, 'error', ERROR_AUTO_CLOSE_MS);
  }

  showWarning(message: string): void {
    this.state.show(message, 'warning', WARNING_AUTO_CLOSE_MS);
  }

  clear(): void {
    this.state.clear();
  }
}
