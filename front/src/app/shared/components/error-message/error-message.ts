import {Component, input, InputSignal} from '@angular/core';

@Component({
  selector: 'app-error',
  imports: [],
  templateUrl: './error-message.html',
})
export class ErrorMessage {
   readonly message: InputSignal<string | undefined> = input.required();
}
