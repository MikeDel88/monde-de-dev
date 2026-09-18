import {Signal, signal, WritableSignal} from '@angular/core';
import {AppError} from '../../core/models/app-error';

export interface ErrorState {
  readonly error: Signal<string | undefined>;
  clear(): void;
  setFromError(err: AppError): void;
}

export function createErrorState(): ErrorState {
  const error: WritableSignal<string | undefined> = signal<string | undefined>(undefined);
  return {
    error: error.asReadonly(),
    clear: () => error.set(undefined),
    setFromError: (err: AppError) => error.set(err.message),
  };
}
