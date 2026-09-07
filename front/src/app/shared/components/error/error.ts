import {Component, input, InputSignal} from '@angular/core';

@Component({
  selector: 'app-error',
  imports: [],
  templateUrl: './error.html',
})
export class Error {
   readonly message: InputSignal<string | undefined> = input.required();
}
