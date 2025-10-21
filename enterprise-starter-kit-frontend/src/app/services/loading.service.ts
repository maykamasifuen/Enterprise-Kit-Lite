import { Injectable, signal, computed } from '@angular/core';
@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private _count = signal(0);
  private _message = signal<string | null>(null);
  /** True whenever at least one request is in-flight */
  readonly isLoading = computed(() => this._count() > 0);
  readonly message = this._message.asReadonly();
  show(message?: string): void {
    this._count.update(n => n + 1);
    if (message)
      this._message.set(message);
  }
  hide(): void {
    this._count.update(n => Math.max(0, n - 1));
    if (this._count() === 0)
      this._message.set(null);
  }
}
