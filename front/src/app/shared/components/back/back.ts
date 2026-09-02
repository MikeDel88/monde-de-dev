import {Component, output} from '@angular/core';

@Component({
  selector: 'app-back',
  imports: [],
  templateUrl: './back.html',
  styleUrl: './back.css',
})
export class Back {
    nav = output();
    onBack() {
        this.nav.emit();
    }
}
