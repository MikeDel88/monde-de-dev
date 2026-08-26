import {Component, inject} from '@angular/core';
import {NgTemplateOutlet} from "@angular/common";
import {Router, RouterLink, RouterLinkActive, RouterOutlet} from "@angular/router";
import {SessionService} from "../../../core/services/session-service";
import {MenuBehavior} from "../../directives/menu-behavior";

@Component({
  selector: 'app-main-layout',
  hostDirectives: [
    {
      directive: MenuBehavior,
      outputs: ['menuClosed'],
    },
  ],
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgTemplateOutlet],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {

  readonly logoutText = "Se déconnecter";
  readonly postsText = "Articles";
  readonly topicsText = "Thèmes";

  private readonly sessionService = inject(SessionService);
  private readonly router = inject(Router);

  readonly menu = inject(MenuBehavior, {self: true});

  onLogout(): void {
    this.menu.close();
    this.sessionService.logOut();
    this.router.navigateByUrl('/login');
  }
}
