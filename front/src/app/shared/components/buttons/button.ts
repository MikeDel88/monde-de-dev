import {Component, input, InputSignal, output} from '@angular/core';
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

    readonly type: InputSignal<HTMLButtonElement["type"]> = input.required();
    readonly text: InputSignal<string> = input.required();
    readonly disabled: InputSignal<boolean> = input.required();

    click = output()

    onClick() {
      this.click.emit();
    }
}
