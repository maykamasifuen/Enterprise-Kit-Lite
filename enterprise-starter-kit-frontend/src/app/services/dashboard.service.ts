import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';

import { environment } from '../../environments/environment';

export interface DashboardStats {
  totalInvoices: number;
  totalAmount: number;
  paidCount: number;
  pendingCount: number;
  overdueCount: number;
  cancelledCount: number;
  totalCustomers: number;
}

export interface MonthlyTrend {
  month: string;      // "2025-08"
  revenue: number;
  invoiceCount: number;
}

export interface DashboardTrends {
  trends: MonthlyTrend[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly baseUrl = `${environment.apiUrl}/dashboard`;

  /** Emits whenever invoice data changes (import, create, update, delete, bulk ops). */
  private readonly _invoiceDataChanged$ = new Subject<void>();
  readonly invoiceDataChanged$ = this._invoiceDataChanged$.asObservable();

  constructor(private readonly http: HttpClient) {}

  /** Call this after any invoice mutation to trigger a dashboard stats refresh. */
  notifyInvoiceDataChanged(): void {
    this._invoiceDataChanged$.next();
  }

  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.baseUrl}/stats`);
  }

  getStatsByDateRange(from: string, to: string): Observable<DashboardStats> {
    const params = new HttpParams().set('from', from).set('to', to);
    return this.http.get<DashboardStats>(`${this.baseUrl}/stats`, { params });
  }

  getTrends(months = 6): Observable<DashboardTrends> {
    const params = new HttpParams().set('months', months.toString());
    return this.http.get<DashboardTrends>(`${this.baseUrl}/trends`, { params });
  }
}
