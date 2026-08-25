import { Routes } from '@angular/router';
import { Register } from './pages/register/register';
import {Login} from "./pages/login/login";
import {Feed} from "./pages/feed/feed";
import {Home} from "./pages/home/home";
import {AuthGuard} from "./core/guards/auth-guard";
import {GuestGuard} from "./core/guards/guest-guard";

export const routes: Routes = [
  {
    path: '',
    canActivate: [GuestGuard],
    children: [
      { path: '', component: Home },
      { path: 'register', component: Register },
      { path: 'login', component: Login },
    ],
  },
  { path: 'feed', component: Feed, canActivate: [AuthGuard] },
];
