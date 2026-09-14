import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Logo } from '../../../shared/components/logo/logo';

@Component({
  selector: 'app-error-page',
  imports: [RouterLink, Logo],
  templateUrl: './error.html',
})
export class Error {

}
