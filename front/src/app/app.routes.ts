import { Routes } from '@angular/router';
import { Register } from './pages/register/register';
import {Login} from "./pages/login/login";
import {Feed} from "./pages/feed/feed";
import {Home} from "./pages/home/home";

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'register', component: Register },
  { path: 'login', component: Login },
  { path: 'feed', component: Feed}
];
