import {Component, effect, ElementRef, inject, viewChild} from '@angular/core';
import {NgTemplateOutlet} from "@angular/common";
import {Router, RouterLink, RouterLinkActive, RouterOutlet} from "@angular/router";
import {AuthService} from "../../../features/auth/services/auth-service";
import {MenuBehavior} from "../../directives/menu-behavior";
import {Logo} from "../../components/logo/logo";

@Component({
  selector: 'app-main-layout',
  hostDirectives: [
    {
      directive: MenuBehavior,
      outputs: ['menuClosed'],
    },
  ],
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgTemplateOutlet, Logo],
  templateUrl: './main-layout.html',
})
export class MainLayout {

  readonly logoutText = "Se déconnecter";
  readonly postsText = "Articles";
  readonly topicsText = "Thèmes";

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly menu = inject(MenuBehavior, {self: true});

  private readonly mobileMenuDialogRef = viewChild<ElementRef<HTMLDialogElement>>('mobileMenuDialog');

  constructor() {
    effect(() => {
      const dialog = this.mobileMenuDialogRef()?.nativeElement;
      if (!dialog) return;
      if (this.menu.open() && !dialog.open) dialog.showModal();
      if (!this.menu.open() && dialog.open) dialog.close();
    });
  }

  onLogout(): void {
    this.menu.close();
    this.authService.logout$().subscribe({
      complete: () => this.router.navigateByUrl('/login'),
      error: () => this.router.navigateByUrl('/login'),
    });
  }

  onMobileMenuDialogClick(event: MouseEvent): void {
    if (event.target === this.mobileMenuDialogRef()?.nativeElement) {
      this.menu.close();
    }
  }
}
