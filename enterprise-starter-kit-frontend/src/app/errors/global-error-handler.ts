import { ErrorHandler, inject, Injectable, NgZone } from '@angular/core';
import { MessageService } from 'primeng/api';
import { environment } from '../../environments/environment';

/**
 * Global Angular error handler.
 * Catches all unhandled errors and shows a user-friendly toast instead of a blank screen.
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly zone = inject(NgZone);

  handleError(error: unknown): void {
    const err = error as Error;

    if (!environment.production) {
      console.error('[GlobalErrorHandler]', err);
    }

    // Reload on chunk-load errors (stale cached bundles after deploy)
    if (err?.message?.includes('Loading chunk')) {
      window.location.reload();
      return;
    }

    // Show toast via globally registered MessageService
    this.zone.run(() => {
      try {
        const ms = (window as any).__primengMessageService as MessageService | undefined;
        ms?.add({
          severity: 'error',
          summary: 'Unexpected Error',
          detail: 'Something went wrong. Please try again.',
          life: 5000
        });
      } catch {
        // MessageService not available — silently ignore
      }
    });
  }
}
