import {Signal, signal, WritableSignal} from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning';

export interface ToastState {
  readonly message: Signal<string | undefined>;
  readonly visible: Signal<boolean>;
  readonly type: Signal<ToastType>;
  clear(): void;
  show(message: string, type: ToastType, autoCloseMs: number): void;
}

export function createToastState(): ToastState {
  const message: WritableSignal<string | undefined> = signal<string | undefined>(undefined);
  const visible: WritableSignal<boolean> = signal(false);
  const type: WritableSignal<ToastType> = signal<ToastType>('success');
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
    type: type.asReadonly(),
    clear(): void {
      clearTimer();
      visible.set(false);
    },
    show(newMessage: string, newType: ToastType, autoCloseMs: number): void {
      clearTimer();
      message.set(newMessage);
      type.set(newType);
      visible.set(true);
      timeoutId = setTimeout(() => visible.set(false), autoCloseMs);
    },
  };
}
