import {
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpRequest,
  HttpStatusCode
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { TokenStorageService } from '../services/token-storage.service';

const isAuthEndpoint = (req: HttpRequest<unknown>): boolean => {
  // Avoid redirect loops if /auth/login itself returns 401.
  return req.url.includes('/auth/login');
};

const isDownloadEndpoint = (req: HttpRequest<unknown>): boolean => {
  // Don't force a signOut on file downloads; some backends return 401 with an HTML body
  // (or CORS blocks headers) and users should be able to retry after re-login.
  return req.url.includes('/export/') || req.url.includes('/download') || req.responseType === 'blob';
};

export const unauthorizedInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const tokenStorage = inject(TokenStorageService);

  return next(req).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse && err.status === HttpStatusCode.Unauthorized) {
        if (!isAuthEndpoint(req)) {
          // Only clear token for non-download API calls.
          if (!isDownloadEndpoint(req)) {
            tokenStorage.signOut();
          }

          // Preserve the returnUrl so we can come back to the page after login.
          void router.navigate(['/login'], { queryParams: { returnUrl: router.url } });
        }
      }

      return throwError(() => err);
    })
  );
};
