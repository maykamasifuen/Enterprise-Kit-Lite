import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Company {
  id: number;
  tenantId: string;
  name: string;
  description?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  taxNumber?: string;
  website?: string;
  logoUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  userCount?: number;
  invoiceCount?: number;
}

export interface CreateCompanyRequest {
  company: {
    name: string;
    description?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
    taxNumber?: string;
    website?: string;
  };
  adminEmail?: string;
  adminPassword?: string;
}

export interface SystemStats {
  totalCompanies: number;
  activeCompanies: number;
  totalUsers: number;
  totalInvoices: number;
  totalRevenue: number;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/admin/companies`;

  getCompanies(page = 0, size = 10): Observable<Page<Company>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<Company>>(this.baseUrl, { params });
  }

  searchCompanies(query: string, page = 0, size = 10): Observable<Page<Company>> {
    const params = new HttpParams()
      .set('query', query)
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<Company>>(`${this.baseUrl}/search`, { params });
  }

  getCompanyById(id: number): Observable<Company> {
    return this.http.get<Company>(`${this.baseUrl}/${id}`);
  }

  createCompany(request: CreateCompanyRequest): Observable<Company> {
    return this.http.post<Company>(this.baseUrl, request);
  }

  updateCompany(id: number, company: CreateCompanyRequest['company']): Observable<Company> {
    return this.http.put<Company>(`${this.baseUrl}/${id}`, company);
  }

  toggleCompanyStatus(id: number): Observable<Company> {
    return this.http.patch<Company>(`${this.baseUrl}/${id}/toggle-status`, {});
  }

  deleteCompany(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getSystemStats(): Observable<SystemStats> {
    return this.http.get<SystemStats>(`${this.baseUrl}/stats`);
  }
}
