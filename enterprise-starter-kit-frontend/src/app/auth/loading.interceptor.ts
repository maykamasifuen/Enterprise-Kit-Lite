import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '../services/loading.service';

/** Shows/hides global loading indicator for every HTTP request. Uses a counter so parallel requests work. */
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);
  const skip = req.url.includes('/actuator/') || req.url.includes('/api/notifications/unread-count');
  if (skip) return next(req);
  loadingService.show();
  return next(req).pipe(finalize(() => loadingService.hide()));
};

