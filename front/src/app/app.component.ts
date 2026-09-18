import {Component, inject} from '@angular/core';
import {RouterOutlet} from "@angular/router";
import {Toast} from "./shared/components/toast/toast";
import {ErrorToastService} from "./core/services/error-toast-service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [RouterOutlet, Toast]
})
export class AppComponent {
  readonly errorToastService = inject(ErrorToastService);
}
