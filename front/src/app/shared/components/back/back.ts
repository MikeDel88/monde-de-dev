import {Component, output} from '@angular/core';

@Component({
  selector: 'app-back',
  imports: [],
  templateUrl: './back.html',
})
export class Back {
    nav = output();
    onBack() {
        this.nav.emit();
    }
}
