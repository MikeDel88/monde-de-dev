import {Component, input} from '@angular/core';

@Component({
  selector: 'app-logo',
  imports: [],
  templateUrl: './logo.html',
  styleUrl: './logo.css',
})
export class Logo {
    width = input.required<number>()
    height = input.required<number>()
}
