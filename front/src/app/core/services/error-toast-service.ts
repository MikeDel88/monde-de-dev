import {Service, Signal} from '@angular/core';
import {AppError} from '../models/app-error';
import {createErrorState, ErrorState} from '../../shared/utils/error-state';

@Service()
export class ErrorToastService {

  private readonly state: ErrorState = createErrorState();

  readonly message: Signal<string | undefined> = this.state.message;
  readonly visible: Signal<boolean> = this.state.visible;

  showError(err: AppError): void {
    this.state.setFromError(err);
  }

  clear(): void {
    this.state.clear();
  }
}
