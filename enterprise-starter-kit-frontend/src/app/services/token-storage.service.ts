import { Injectable } from '@angular/core';
import { isTokenExpired } from '../auth/jwt.util';

const TOKEN_KEY = 'auth_token';

@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {
  private readonly authChangedEmitter = new EventTarget();

  /** Subscribe to token changes (login/logout). */
  onAuthChanged(listener: () => void): () => void {
    const handler = () => listener();
    this.authChangedEmitter.addEventListener('auth-changed', handler);
    return () => this.authChangedEmitter.removeEventListener('auth-changed', handler);
  }

  private emitAuthChanged(): void {
    this.authChangedEmitter.dispatchEvent(new Event('auth-changed'));
  }

  saveToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
    this.emitAuthChanged();
  }

  /**
   * Get the stored token. Returns null if no token exists or if the token is expired.
   * Automatically clears expired tokens from storage.
   */
  getToken(): string | null {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;

    // Check if token is expired and clear it if so
    if (isTokenExpired(token)) {
      console.log('[TokenStorage] Token expired, clearing...');
      this.signOut();
      return null;
    }

    return token;
  }

  /**
   * Check if there's a valid (non-expired) token.
   */
  hasValidToken(): boolean {
    return this.getToken() !== null;
  }

  signOut(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.emitAuthChanged();
  }
}
