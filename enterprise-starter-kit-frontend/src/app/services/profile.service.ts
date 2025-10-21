import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { environment } from '../../environments/environment';
import { TokenStorageService } from './token-storage.service';

/**
 * User profile data matching the backend ProfileResponse
 */
export interface UserProfile {
  id: number;
  username: string;
  email: string;
  fullName: string | null;
  phoneNumber: string | null;
  avatarUrl: string | null;
  preferredLanguage: string;
}

/**
 * Request for updating profile
 */
export interface ProfileUpdateRequest {
  fullName?: string;
  phoneNumber?: string;
  preferredLanguage?: string;
}

/**
 * Request for changing password
 */
export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

/**
 * Service for managing user profile operations
 */
@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private readonly baseUrl = `${environment.apiUrl}/profile`;
  private readonly LANGUAGE_KEY = 'preferred_language';

  constructor(
    private readonly http: HttpClient,
    private readonly tokenStorage: TokenStorageService
  ) {}

  /**
   * Gets the current user's profile
   */
  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(this.baseUrl);
  }

  /**
   * Updates the current user's profile
   */
  updateProfile(request: ProfileUpdateRequest): Observable<UserProfile> {
    return this.http.put<UserProfile>(this.baseUrl, request).pipe(
      tap((profile) => {
        // Store preferred language in localStorage
        if (profile.preferredLanguage) {
          this.savePreferredLanguage(profile.preferredLanguage);
        }
      })
    );
  }

  /**
   * Changes the current user's password
   */
  changePassword(request: ChangePasswordRequest): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.baseUrl}/password`, request);
  }

  /**
   * Saves the preferred language to localStorage
   */
  savePreferredLanguage(language: string): void {
    localStorage.setItem(this.LANGUAGE_KEY, language);
  }

  /**
   * Gets the preferred language from localStorage
   */
  getPreferredLanguage(): string {
    return localStorage.getItem(this.LANGUAGE_KEY) || 'en';
  }

  /**
   * Removes the preferred language from localStorage
   */
  clearPreferredLanguage(): void {
    localStorage.removeItem(this.LANGUAGE_KEY);
  }
}
