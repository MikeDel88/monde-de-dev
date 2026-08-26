import { enableProdMode, provideZoneChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { environment } from './environments/environment';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import {AuthGuard} from "./app/core/guards/auth-guard";
import {authInterceptor} from "./app/core/interceptors/http-interceptor";
import {errorInterceptor} from "./app/core/interceptors/error-interceptor";

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    provideZoneChangeDetection(),
    provideRouter(routes),
    AuthGuard,
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor]))
  ]
})
  .catch(err => console.error(err));
