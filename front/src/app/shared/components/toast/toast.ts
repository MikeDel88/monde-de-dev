import {Component, computed, input, output} from '@angular/core';


type toast = "success" | "error"| "warning"

const TOAST_VARIANTS: Record<toast, { card: string; badge: string }> = {
  success: {
    card: 'border-green-500 bg-green-50',
    badge: 'bg-green-100 text-green-600',
  },
  error: {
    card: 'border-red-500 bg-red-50',
    badge: 'bg-red-100 text-red-600',
  },
  warning: {
    card: 'border-amber-500 bg-amber-50',
    badge: 'bg-amber-100 text-amber-600',
  },
};

@Component({
  selector: 'app-toast',
  imports: [],
  templateUrl: './toast.html',
})
export class Toast {
  message = input("");
  visible = input(false);
  type = input<toast>("success");

  buttonClick = output<Event>();

  variant = computed(() => TOAST_VARIANTS[this.type()]);


  onClose(event: Event) {
    this.buttonClick.emit(event);
  }
}
