import { Routes } from '@angular/router';
import { Register } from './pages/register/register';
import {AppComponent} from "./app.component";

export const routes: Routes = [
  { path: '', component: AppComponent },
  { path: 'register', component: Register },
];
