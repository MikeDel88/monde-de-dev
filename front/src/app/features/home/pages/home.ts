import { Component } from '@angular/core';
import {RouterLink} from "@angular/router";
import {Logo} from "../../../shared/components/logo/logo";

@Component({
  selector: 'app-home',
  imports: [RouterLink, Logo],
  templateUrl: './home.html',
})
export class Home {
  login = "Se connecter";
  register = "S'inscrire";
}
