import {Component, inject, input} from '@angular/core';
import {Location} from "@angular/common";

@Component({
  selector: 'app-auth',
  templateUrl: './auth.html',
  styleUrl: './auth.css',
})
export class Auth {
    private readonly location = inject(Location);
    title = input<string>("");

  onBack() {
    this.location.back();
  }
}
