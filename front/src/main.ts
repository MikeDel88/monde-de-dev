import { enableProdMode, provideZoneChangeDetection, provideAppInitializer } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import {provideHttpClient, withInterceptors, withXsrfConfiguration} from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { environment } from './environments/environment';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import {authInterceptor} from "./app/core/interceptors/http-interceptor";
import {errorInterceptor} from "./app/core/interceptors/error-interceptor";
import {initSession} from "./app/core/services/session-initializer";

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    provideZoneChangeDetection(),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor, errorInterceptor]),
      withXsrfConfiguration({cookieName: 'XSRF-TOKEN', headerName: 'X-XSRF-TOKEN'}),
    ),
    provideAppInitializer(() => initSession()),
  ]
})
  .catch(err => console.error(err));
