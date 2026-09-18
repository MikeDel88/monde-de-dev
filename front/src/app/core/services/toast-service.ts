import {Service, Signal} from '@angular/core';
import {AppError} from '../models/app-error';
import {createToastState, ToastState, ToastType} from '../../shared/utils/toast-state';

const SUCCESS_AUTO_CLOSE_MS = 2000;
const ERROR_AUTO_CLOSE_MS = 5000;
const WARNING_AUTO_CLOSE_MS = 4000;

@Service()
export class ToastService {

  private readonly state: ToastState = createToastState();

  readonly message: Signal<string | undefined> = this.state.message;
  readonly visible: Signal<boolean> = this.state.visible;
  readonly type: Signal<ToastType> = this.state.type;

  showSuccess(message: string): void {
    this.state.show(message, 'success', SUCCESS_AUTO_CLOSE_MS);
  }

  showError(err: AppError): void {
    this.state.show(err.message, 'error', ERROR_AUTO_CLOSE_MS);
  }

  showWarning(message: string): void {
    this.state.show(message, 'warning', WARNING_AUTO_CLOSE_MS);
  }

  clear(): void {
    this.state.clear();
  }
}
