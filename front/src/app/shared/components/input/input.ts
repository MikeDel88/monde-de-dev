import {Component, input, InputSignal, model, ModelSignal, output, OutputEmitterRef} from '@angular/core';
import {ValidationError} from '@angular/forms/signals';
import {Error} from '../errors/error';

@Component({
  selector: 'app-input',
  imports: [Error],
  templateUrl: './input.html',
  styleUrl: './input.css',
})
export class Input {
  readonly type: InputSignal<string> = input.required();
  readonly label: InputSignal<string | undefined> = input<string | undefined>(undefined);
  readonly value: ModelSignal<string> = model<string>('');
  readonly touch: OutputEmitterRef<void> = output<void>();
  readonly placeholder: InputSignal<string> = input<string>("");

  readonly touched: InputSignal<boolean> = input<boolean>(false);
  readonly invalid: InputSignal<boolean> = input<boolean>(false);
  readonly errors: InputSignal<readonly ValidationError[]> = input<readonly ValidationError[]>([]);
  readonly errorDataTest: InputSignal<string | undefined> = input<string | undefined>(undefined);
}
