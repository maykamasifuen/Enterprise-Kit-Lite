import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { timeout } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { Invoice } from '../invoices/invoice.model';
import { TokenStorageService } from './token-storage.service';

/**
 * Recommended response contract for `/invoices/import`.
 *
 * For production reliability, the backend should return a JSON object that includes a numeric
 * `importedCount` so the UI can display accurate feedback.
 *
 * Example:
 * `{ "importedCount": 50 }`
 */
export interface ImportInvoicesResult {
  importedCount: number;
}

/**
 * Backwards-compatible union to tolerate older backend responses.
 *
 * NOTE: The UI will treat missing/invalid counts as "Imported successfully".
 */
export type ImportInvoicesResponse = ImportInvoicesResult | Record<string, unknown> | number | string | null;

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = environment.apiUrl;

  // Small in-memory cache to avoid refetching invoices on every navigation.
  // Call `refreshInvoices()` after mutations (import) to force a refetch.
  private invoices$?: Observable<Invoice[]>;

  constructor(
    private readonly http: HttpClient,
    private readonly tokenStorage: TokenStorageService
  ) {}

  /**
   * Fetches all invoices.
   *
   * Uses a small in-memory cache (`shareReplay(1)`) to improve perceived performance.
   * Call {@link refreshInvoices} to trigger a re-fetch.
   */
  getInvoices(): Observable<Invoice[]> {
    if (!this.invoices$) {
      this.invoices$ = this.http
        .get<Invoice[]>(`${this.baseUrl}/invoices`)
        // Fail fast rather than leaving the user waiting forever.
        .pipe(timeout(30000), shareReplay({ bufferSize: 1, refCount: true }));
    }

    return this.invoices$;
  }

  /** Clears the cached invoice list so the next `getInvoices()` call refetches from the backend. */
  refreshInvoices(): void {
    this.invoices$ = undefined;
  }

  /**
   * Downloads the Invoices Excel export as a {@link Blob}.
   *
   * IMPORTANT: You must set `responseType: 'blob'` (instead of the default JSON) for file downloads.
   * Angular's HttpClient assumes JSON by default and will try to parse the response as text/JSON,
   * which corrupts binary content (Excel/PDF/images). `blob` keeps the response as raw bytes.
   */
  downloadInvoicesExcel(lang: 'en' | 'ar' = 'en'): Observable<HttpResponse<Blob>> {
    // Assumption: backend endpoint is GET /api/invoices/export/excel?lang=en|ar
    const url = `${this.baseUrl}/invoices/export/excel?lang=${encodeURIComponent(lang)}`;

    // Defensive: ensure Authorization header is present for downloads even if an intermediary
    // or a misconfiguration causes interceptor-added headers to be dropped.
    const token = this.tokenStorage.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;

    // Observe full response so we can read status/headers (Content-Disposition) and
    // detect if the server returned an HTML/JSON error page instead of an XLSX.
    return this.http.get(url, {
      headers,
      responseType: 'blob',
      observe: 'response'
    });
  }

  /**
   * Generic helper for downloading binary files (Excel/PDF/etc.) as a Blob.
   *
   * IMPORTANT: `responseType: 'blob'` is required for binary downloads.
   */
  downloadBlob(endpoint: string): Observable<Blob> {
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${this.baseUrl}${normalizedEndpoint}`;

    return this.http.get(url, { responseType: 'blob' });
  }

  /**
   * Uploads an Excel file (.xlsx) to import invoices.
   *
   * Uses multipart/form-data with field name `file`.
   *
   * Production recommendation:
   * - Backend should return: `{ importedCount: number }`
   */
  uploadInvoices(file: File): Observable<ImportInvoicesResponse> {
    // Assumption: backend endpoint is POST /api/invoices/import (multipart/form-data)
    const form = new FormData();
    form.append('file', file);

    return this.http.post<ImportInvoicesResponse>(`${this.baseUrl}/invoices/import`, form);
  }

  // ── Generic REST helpers ──────────────────────────────────────────────────

  get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${endpoint}`);
  }

  post<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, body);
  }

  put<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${endpoint}`, body);
  }

  patch<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}${endpoint}`, body);
  }

  delete<T = void>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${endpoint}`);
  }
}
