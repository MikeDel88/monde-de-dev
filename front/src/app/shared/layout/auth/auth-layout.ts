import {Component, inject} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router, RouterOutlet} from "@angular/router";
import {filter, map, startWith} from "rxjs";
import {toSignal} from "@angular/core/rxjs-interop";

@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.css',
})
export class AuthLayout {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly currentTitle = (): string => this.activatedRoute.snapshot.firstChild?.data['title'] ?? '';

  title = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      startWith(null),
      map(() => this.currentTitle()),
    ),
    {initialValue: this.currentTitle()},
  );

  onBack() {
    this.router.navigate(['/']);
  }
}
