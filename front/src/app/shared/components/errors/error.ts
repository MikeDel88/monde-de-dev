import {Component, input} from '@angular/core';

@Component({
  selector: 'app-error',
  imports: [],
  templateUrl: './error.html',
  styleUrl: './error.css',
})
export class Error {
   readonly message = input.required();
}
