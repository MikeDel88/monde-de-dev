import {Component, input, InputSignal} from '@angular/core';

@Component({
  selector: 'app-title',
  imports: [],
  templateUrl: './title.html',
  styleUrl: './title.css',
})
export class Title {
  content: InputSignal<string> = input.required<string>();
  level: InputSignal<1 | 2 | 3 | 4 | 5 | 6> = input<1 | 2 | 3 | 4 | 5 | 6>(2);
}
