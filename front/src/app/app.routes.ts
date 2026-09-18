import { Routes } from '@angular/router';
import { Register } from './features/auth/pages/register/register';
import {Login} from "./features/auth/pages/login/login";
import {Feed} from "./features/feed/pages/feed";
import {Home} from "./features/home/pages/home";
import {Topic} from "./features/topic/pages/topic";
import {authGuard} from "./core/guards/auth-guard";
import {guestGuard} from "./core/guards/guest-guard";
import {AuthLayout} from "./shared/layout/auth/auth-layout";
import {MainLayout} from "./shared/layout/main/main-layout";
import {Profile} from "./features/profile/pages/profile";
import {Post} from "./features/post/pages/create/post";
import {PostDetail} from "./features/post/pages/detail/post-detail";
import {Error as ErrorPage} from "./features/error/pages/error";

export const routes: Routes = [
  {
    path: '',
    canActivate: [guestGuard],
    loadChildren: () => [
      { path: '', loadComponent:() => Home, title: "Page d'accueil" },
      {
        path: '',
        loadComponent:() => AuthLayout,
        loadChildren: () => [
          { path: 'register', loadComponent:() => Register, title: "Inscription", data: { title: "Inscription" } },
          { path: 'login', loadComponent:() => Login, title: "Se connecter", data: { title: "Se connecter" } },
        ],
      },
    ],
  },
  {
    path: '',
    canActivate: [authGuard],
    loadChildren: () => [
      {
        path: '',
        loadComponent: () => MainLayout,
        loadChildren: () => [
          { path: 'feed', loadComponent:() => Feed, title: "Fil d'actualité" },
          { path: 'topics', loadComponent:() => Topic, title: "Thèmes" },
          { path: 'profile', loadComponent:() => Profile, title: "Profil utilisateur" },
          { path: 'post', loadComponent:() => Post, title: "Créer un nouvel article" },
          { path: 'post/:id', loadComponent:() => PostDetail, title: "Voir un article" },
        ],
      },
    ],
  },
  { path: '**', loadComponent:() => ErrorPage, title: "Page introuvable" },
];
