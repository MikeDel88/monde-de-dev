import {Component, input, InputSignal} from '@angular/core';

@Component({
  selector: 'app-title',
  imports: [],
  templateUrl: './title.html',
  styleUrl: './title.css',
})
export class Title {
  content: InputSignal<string> = input.required<string>();
}
