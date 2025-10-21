import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, tap } from 'rxjs';

import { TokenStorageService } from './token-storage.service';
import { environment } from '../../environments/environment';
import { decodeUserFromJwt } from '../auth/jwt.util';
import type { User } from '../auth/user.model';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  username: string;
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
}

interface RegisterResponse {
  token: string;
  message?: string;
}

export interface TenantRegistrationRequest {
  companyName: string;
  adminEmail: string;
  adminPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly authBaseUrl = `${environment.apiUrl}/auth`;
  private readonly LANGUAGE_KEY = 'preferred_language';
  private readonly APP_LANGUAGE_KEY = 'app_language';

  constructor(
    private readonly http: HttpClient,
    private readonly tokenStorage: TokenStorageService
  ) { }

  login(credentials: LoginRequest): Observable<void> {
    return this.http.post<LoginResponse>(`${this.authBaseUrl}/login`, credentials).pipe(
      tap((res) => this.handleSuccessLogin(res)),
      map(() => void 0)
    );
  }

  private handleSuccessLogin(res: LoginResponse): void {
    this.tokenStorage.saveToken(res.token);
    // Extract and store preferred language from JWT
    const user = decodeUserFromJwt(res.token);
    console.log('[AuthService] Decoded user from JWT:', user);
    console.log('[AuthService] User preferred language:', user?.preferredLanguage);

    if (user?.preferredLanguage) {
      // Save both keys for compatibility
      localStorage.setItem(this.LANGUAGE_KEY, user.preferredLanguage);
      localStorage.setItem(this.APP_LANGUAGE_KEY, user.preferredLanguage);
      console.log('[AuthService] Saved language to localStorage:', user.preferredLanguage);
    }
  }

  register(data: RegisterRequest): Observable<void> {
    return this.http.post<RegisterResponse>(`${this.authBaseUrl}/register`, data).pipe(
      map(() => void 0)
    );
  }

  registerTenant(data: TenantRegistrationRequest): Observable<void> {
    return this.http.post<RegisterResponse>(`${this.authBaseUrl}/register-tenant`, data).pipe(
      map(() => void 0)
    );
  }

  forgotPassword(email: string): Observable<void> {
    return this.http.post<void>(`${this.authBaseUrl}/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${this.authBaseUrl}/reset-password`, { token, newPassword });
  }

  logout(): void {
    this.tokenStorage.signOut();
    localStorage.removeItem(this.LANGUAGE_KEY);
  }

  getCurrentUser(): User | null {
    const token = this.getToken();
    if (!token) return null;
    return decodeUserFromJwt(token);
  }

  getToken(): string | null {
    return this.tokenStorage.getToken();
  }

  getPreferredLanguage(): string {
    return localStorage.getItem(this.LANGUAGE_KEY) || localStorage.getItem(this.APP_LANGUAGE_KEY) || 'en';
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  isSuperAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.roles?.some(r => r === 'SUPER_ADMIN' || r === 'ROLE_SUPER_ADMIN') ?? false;
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.roles?.some(r => r === 'ADMIN' || r === 'ROLE_ADMIN'
      || r === 'SUPER_ADMIN' || r === 'ROLE_SUPER_ADMIN') ?? false;
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.roles?.some(r => r === role || r === `ROLE_${role}`) ?? false;
  }
}
