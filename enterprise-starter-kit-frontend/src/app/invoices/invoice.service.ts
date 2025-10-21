import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Invoice, InvoiceCreateRequest, InvoiceUpdateRequest, InvoiceStatus } from './invoice.model';

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface InvoiceSearchParams {
  q?: string;
  status?: InvoiceStatus;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
  sort?: string;
}

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private readonly baseUrl = `${environment.apiUrl}/invoices`;

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(this.baseUrl);
  }

  getPaged(page = 0, size = 20, sort = 'invoiceDate,desc'): Observable<PagedResponse<Invoice>> {
    const params = new HttpParams()
      .set('page', page).set('size', size).set('sort', sort);
    return this.http.get<PagedResponse<Invoice>>(`${this.baseUrl}/page`, { params });
  }

  search(filters: InvoiceSearchParams): Observable<PagedResponse<Invoice>> {
    let params = new HttpParams()
      .set('page', filters.page ?? 0)
      .set('size', filters.size ?? 20)
      .set('sort', filters.sort ?? 'invoiceDate,desc');
    if (filters.q)      params = params.set('q', filters.q);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.from)   params = params.set('from', filters.from);
    if (filters.to)     params = params.set('to', filters.to);
    return this.http.get<PagedResponse<Invoice>>(`${this.baseUrl}/search`, { params });
  }

  getById(id: number): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.baseUrl}/${id}`);
  }

  create(req: InvoiceCreateRequest): Observable<Invoice> {
    return this.http.post<Invoice>(this.baseUrl, req);
  }

  update(id: number, req: InvoiceUpdateRequest): Observable<Invoice> {
    return this.http.put<Invoice>(`${this.baseUrl}/${id}`, req);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  bulkDelete(ids: number[]): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/bulk`, { body: ids });
  }

  bulkUpdateStatus(ids: number[], status: InvoiceStatus): Observable<{ updated: number }> {
    return this.http.patch<{ updated: number }>(`${this.baseUrl}/bulk-status`, { ids, status });
  }
}
