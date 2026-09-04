import { Routes } from '@angular/router';
import { Register } from './features/auth/pages/register/register';
import {Login} from "./features/auth/pages/login/login";
import {Feed} from "./features/feed/pages/feed";
import {Home} from "./features/home/pages/home";
import {Topic} from "./features/topic/pages/topic";
import {AuthGuard} from "./core/guards/auth-guard";
import {GuestGuard} from "./core/guards/guest-guard";
import {AuthLayout} from "./shared/layout/auth/auth-layout";
import {MainLayout} from "./shared/layout/main/main-layout";
import {Profile} from "./features/profile/pages/profile";
import {Post} from "./features/post/pages/create/post";
import {PostDetail} from "./features/post/pages/detail/post-detail";

export const routes: Routes = [
  {
    path: '',
    canActivate: [GuestGuard],
    children: [
      { path: '', component: Home, title: "Page d'accueil" },
      {
        path: '',
        component: AuthLayout,
        children: [
          { path: 'register', component: Register, title: "Inscription", data: { title: "Inscription" } },
          { path: 'login', component: Login, title: "Se connecter", data: { title: "Se connecter" } },
        ],
      },
    ],
  },
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: MainLayout,
        children: [
          { path: 'feed', component: Feed, title: "Fil d'actualité" },
          { path: 'topic', component: Topic, title: "Thèmes" },
          { path: 'profile', component: Profile, title: "Profil utilisateur" },
          { path: 'post', component: Post, title: "Créer un nouvel article" },
          { path: 'post/:id', component: PostDetail, title: "Voir un article" },
        ],
      },
    ],
  },
  { path: '**', component: Home },
];
