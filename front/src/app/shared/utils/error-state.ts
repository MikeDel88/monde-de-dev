import {Signal, signal, WritableSignal} from '@angular/core';
import {AppError} from '../../core/models/app-error';

const DEFAULT_AUTO_CLOSE_MS = 5000;

export interface ErrorState {
  readonly message: Signal<string | undefined>;
  readonly visible: Signal<boolean>;
  clear(): void;
  setFromError(err: AppError): void;
}

export function createErrorState(autoCloseMs: number = DEFAULT_AUTO_CLOSE_MS): ErrorState {
  const message: WritableSignal<string | undefined> = signal<string | undefined>(undefined);
  const visible: WritableSignal<boolean> = signal(false);
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  function clearTimer(): void {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
      timeoutId = undefined;
    }
  }

  return {
    message: message.asReadonly(),
    visible: visible.asReadonly(),
    clear(): void {
      clearTimer();
      visible.set(false);
    },
    setFromError(err: AppError): void {
      clearTimer();
      message.set(err.message);
      visible.set(true);
      timeoutId = setTimeout(() => visible.set(false), autoCloseMs);
    },
  };
}
