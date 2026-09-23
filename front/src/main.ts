import { provideZoneChangeDetection, provideAppInitializer } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import {authInterceptor} from "./app/core/interceptors/http-interceptor";
import {errorInterceptor} from "./app/core/interceptors/error-interceptor";
import {xsrfInterceptor} from "./app/core/interceptors/xsrf-interceptor";
import {initSession} from "./app/core/services/session-initializer";

bootstrapApplication(AppComponent, {
  providers: [
    provideZoneChangeDetection(),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor, xsrfInterceptor, errorInterceptor]),
    ),
    provideAppInitializer(() => initSession()),
  ]
})
  .catch(err => console.error(err));
