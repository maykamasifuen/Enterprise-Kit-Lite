import { ApplicationConfig, provideBrowserGlobalErrorListeners, importProvidersFrom, APP_INITIALIZER, ErrorHandler } from '@angular/core';
import { providePrimeNG } from 'primeng/config';
import Lara from '@primeng/themes/lara';
import { provideRouter } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { firstValueFrom } from 'rxjs';

import { routes } from './app.routes';
import { authInterceptor } from './auth/auth.interceptor';
import { unauthorizedInterceptor } from './auth/unauthorized.interceptor';
import { loadingInterceptor } from './auth/loading.interceptor';
import { GlobalErrorHandler } from './errors/global-error-handler';

// ── Apply saved theme immediately to prevent flash of wrong theme ──────────────
(function () {
  if (typeof document === 'undefined') return;
  const saved = localStorage.getItem('app_theme');
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  const dark = saved ? saved === 'dark' : prefersDark;
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
})();

// Factory function to initialize translations before app starts
function initializeTranslations(translate: TranslateService) {
  return () => {
    translate.setDefaultLang('en');
    translate.addLangs(['en', 'ar', 'fr']);

    const savedLang = localStorage.getItem('preferred_language')
      || localStorage.getItem('app_language')
      || 'en';

    const supportedLangs = ['en', 'ar', 'fr'];
    const langToUse = supportedLangs.includes(savedLang) ? savedLang : 'en';

    if (typeof document !== 'undefined') {
      const dir = langToUse === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.setAttribute('dir', dir);
      document.documentElement.setAttribute('lang', langToUse);
      document.body.setAttribute('dir', dir);
      document.body.style.direction = dir;
      if (langToUse === 'ar') {
        document.documentElement.classList.add('rtl');
        document.documentElement.classList.remove('ltr');
        document.body.classList.add('rtl-mode');
        document.body.classList.remove('ltr-mode');
      } else {
        document.documentElement.classList.add('ltr');
        document.documentElement.classList.remove('rtl');
        document.body.classList.add('ltr-mode');
        document.body.classList.remove('rtl-mode');
      }
    }

    return firstValueFrom(translate.use(langToUse));
  };
}

// ─── App config ───────────────────────────────────────────────────────────────
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, unauthorizedInterceptor, loadingInterceptor])),
    MessageService,
    ConfirmationService,
    providePrimeNG({
      theme: {
        preset: Lara,
        options: {
          darkModeSelector: '[data-theme="dark"]'
        }
      }
    }),
    importProvidersFrom(TranslateModule.forRoot()),
    provideTranslateHttpLoader({
      prefix: './assets/i18n/',
      suffix: '.json'
    }),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeTranslations,
      deps: [TranslateService],
      multi: true
    },
    { provide: ErrorHandler, useClass: GlobalErrorHandler }
  ]
};
