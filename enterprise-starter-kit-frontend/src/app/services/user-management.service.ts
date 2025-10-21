import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface ManagedUser {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  preferredLanguage: string;
  tenantId: string;
  roles: string[];
  createdAt: string;
  updatedAt: string;
  isEnabled: boolean;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  phoneNumber?: string;
  preferredLanguage?: string;
  roles?: string[];
}

export interface UpdateUserRequest {
  fullName?: string;
  phoneNumber?: string;
  email?: string;
  preferredLanguage?: string;
  isActive?: boolean;
}

export interface SystemStats {
  totalCompanies: number;
  activeCompanies: number;
  totalUsers: number;
  activeUsers: number;
  totalInvoices: number;
  totalRoles: number;
  systemTime: string;
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
export class UserManagementService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/users`;

  /**
   * Get users for current tenant — backend returns a flat List<UserResponse>
   */
  getUsers(): Observable<ManagedUser[]> {
    return this.http.get<ManagedUser[]>(this.baseUrl);
  }

  /**
   * Get all users system-wide (SUPER_ADMIN only)
   */
  getAllUsers(page = 0, size = 10): Observable<Page<ManagedUser>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<ManagedUser>>(`${this.baseUrl}/all`, { params });
  }

  /**
   * Get users by tenant ID (SUPER_ADMIN only) — returns flat array for type compatibility
   */
  getUsersByTenant(tenantId: string, page = 0, size = 100): Observable<ManagedUser[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<ManagedUser>>(`${this.baseUrl}/tenant/${tenantId}`, { params })
      .pipe(map(p => p?.content ?? []));
  }

  /**
   * Get user by ID
   */
  getUserById(id: number): Observable<ManagedUser> {
    return this.http.get<ManagedUser>(`${this.baseUrl}/${id}`);
  }

  /**
   * Create a new user
   */
  createUser(request: CreateUserRequest): Observable<ManagedUser> {
    return this.http.post<ManagedUser>(this.baseUrl, request);
  }

  /**
   * Update user roles
   */
  updateUserRoles(userId: number, roles: string[]): Observable<ManagedUser> {
    return this.http.put<ManagedUser>(`${this.baseUrl}/${userId}/roles`, roles);
  }

  /**
   * Reset user password
   */
  resetUserPassword(userId: number, newPassword: string): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${userId}/reset-password`, { newPassword });
  }

  /**
   * Delete user
   */
  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${userId}`);
  }

  /**
   * Get available roles (excludes SUPER_ADMIN for tenant admins)
   */
  getAvailableRoles(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/roles`);
  }

  /**
   * Update user profile details
   */
  updateUser(userId: number, request: UpdateUserRequest): Observable<ManagedUser> {
    return this.http.put<ManagedUser>(`${this.baseUrl}/${userId}`, request);
  }

  /**
   * Toggle user active/inactive status
   */
  toggleStatus(userId: number): Observable<ManagedUser> {
    return this.http.patch<ManagedUser>(`${this.baseUrl}/${userId}/toggle-status`, {});
  }

  /**
   * Get current authenticated user's profile
   */
  getCurrentUserProfile(): Observable<ManagedUser> {
    return this.http.get<ManagedUser>(`${this.baseUrl}/me`);
  }

  /**
   * Get system-wide stats (SUPER_ADMIN only)
   */
  getSystemStats(): Observable<SystemStats> {
    return this.http.get<SystemStats>(`${environment.apiUrl}/admin/super/stats`);
  }

  /**
   * Get all roles including SUPER_ADMIN (SUPER_ADMIN only)
   */
  getAllRoles(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/roles/all`);
  }
}
