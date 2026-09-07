import {Component, input} from '@angular/core';

@Component({
  selector: 'app-logo',
  imports: [],
  templateUrl: './logo.html',
})
export class Logo {
    width = input.required<number>();
    height = input.required<number>();
}
