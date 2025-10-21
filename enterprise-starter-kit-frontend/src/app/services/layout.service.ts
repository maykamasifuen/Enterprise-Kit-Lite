import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LayoutService {
  private readonly THEME_KEY = 'app_theme';

  /**
   * Signal to track if the sidebar is visible (mainly for mobile usage or collapsing)
   */
  readonly sidebarVisible = signal<boolean>(false);

  /**
   * Signal to track if the current theme is dark
   */
  readonly isDarkTheme = signal<boolean>(this._loadTheme());

  constructor() {
    // Apply persisted theme on startup
    this._apply(this.isDarkTheme());
  }

  /**
   * Toggle the sidebar visibility
   */
  toggleSidebar(): void {
    this.sidebarVisible.update((v) => !v);
  }

  /**
   * Explicitly set sidebar visibility
   */
  setSidebarVisible(visible: boolean): void {
    this.sidebarVisible.set(visible);
  }

  /**
   * Toggle between dark and light theme and persist user preference
   */
  toggleTheme(): void {
    const dark = !this.isDarkTheme();
    this.isDarkTheme.set(dark);
    this._apply(dark);
    localStorage.setItem(this.THEME_KEY, dark ? 'dark' : 'light');
  }


  private _apply(dark: boolean): void {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    // keep legacy class for any CSS that still uses them
    document.documentElement.classList.toggle('app-dark', dark);
    document.documentElement.classList.toggle('app-light', !dark);
  }

  private _loadTheme(): boolean {
    const saved = localStorage.getItem(this.THEME_KEY);
    if (saved) return saved === 'dark';
    // Default: respect OS preference
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  }
}
