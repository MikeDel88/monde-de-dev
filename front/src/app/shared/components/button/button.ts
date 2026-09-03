import {Component, input, InputSignal} from '@angular/core';
import {NgClass} from "@angular/common";

@Component({
  selector: 'app-button',
  imports: [
    NgClass
  ],
  templateUrl: './button.html',
  styleUrl: './button.css',
})
export class Button {
    readonly display: InputSignal<'normal' | 'outlined'> = input<'normal' | 'outlined'>('normal');
    readonly type: InputSignal<HTMLButtonElement["type"]> = input.required();
    readonly text: InputSignal<string> = input.required();
    readonly disabled: InputSignal<boolean> = input.required();
}
