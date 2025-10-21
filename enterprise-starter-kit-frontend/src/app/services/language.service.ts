import { Injectable, signal, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { PrimeNG } from 'primeng/config';

/**
 * Service for managing application language and RTL/LTR direction.
 * Handles language switching, RTL mode, and persistence.
 */
@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private readonly LANGUAGE_KEY = 'app_language';
  private readonly SUPPORTED_LANGUAGES = ['en', 'ar', 'fr'];
  private readonly DEFAULT_LANGUAGE = 'en';
  private isBrowser: boolean;

  // Signal for reactive current language
  readonly currentLanguage = signal<string>(this.DEFAULT_LANGUAGE);
  readonly isRTL = signal<boolean>(false);

  constructor(
    private readonly translate: TranslateService,
    private readonly primeng: PrimeNG,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.initializeLanguage();
  }

  /**
   * Initialize language from localStorage or use default
   */
  private initializeLanguage(): void {
    const savedLanguage = this.getStoredLanguage();
    const languageToUse = this.isLanguageSupported(savedLanguage)
      ? savedLanguage!
      : this.DEFAULT_LANGUAGE;

    this.switchLanguage(languageToUse);
  }

  /**
   * Switch application language and update RTL/LTR direction
   * @param lang - Language code ('en' or 'ar')
   */
  switchLanguage(lang: string): void {
    if (!this.isLanguageSupported(lang)) {
      console.warn(`Language "${lang}" is not supported. Using default: ${this.DEFAULT_LANGUAGE}`);
      lang = this.DEFAULT_LANGUAGE;
    }

    // Set the translation language
    this.translate.use(lang);

    // Update reactive signals
    this.currentLanguage.set(lang);
    this.isRTL.set(lang === 'ar');

    // Update PrimeNG RTL configuration
    this.primeng.setTranslation({
      // This is needed for PrimeNG components
    });

    // Update document direction
    this.updateDirection(lang);

    // Save to localStorage
    this.saveLanguage(lang);

    console.log(`Language switched to: ${lang}, RTL: ${lang === 'ar'}`);
  }

  /**
   * Update document direction and add/remove RTL class
   * @param lang - Language code
   */
  private updateDirection(lang: string): void {
    if (!this.isBrowser) return;

    const htmlElement = document.documentElement;
    const bodyElement = document.body;

    // Always update the lang attribute
    htmlElement.setAttribute('lang', lang);

    if (lang === 'ar') {
      // Set RTL direction on HTML element
      htmlElement.setAttribute('dir', 'rtl');
      htmlElement.classList.add('rtl');
      htmlElement.classList.remove('ltr');

      // Set RTL on body
      bodyElement.setAttribute('dir', 'rtl');
      bodyElement.classList.add('rtl-mode');
      bodyElement.classList.remove('ltr-mode');

      // Force style recalculation
      bodyElement.style.direction = 'rtl';
    } else {
      // Set LTR direction on HTML element
      htmlElement.setAttribute('dir', 'ltr');
      htmlElement.classList.add('ltr');
      htmlElement.classList.remove('rtl');

      // Set LTR on body
      bodyElement.setAttribute('dir', 'ltr');
      bodyElement.classList.add('ltr-mode');
      bodyElement.classList.remove('rtl-mode');

      // Force style recalculation
      bodyElement.style.direction = 'ltr';
    }
  }

  /**
   * Get current language
   */
  getCurrentLanguage(): string {
    return this.currentLanguage();
  }

  /**
   * Check if language is supported
   */
  private isLanguageSupported(lang: string | null): boolean {
    return lang !== null && this.SUPPORTED_LANGUAGES.includes(lang);
  }

  /**
   * Save language preference to localStorage
   */
  private saveLanguage(lang: string): void {
    try {
      localStorage.setItem(this.LANGUAGE_KEY, lang);
    } catch (error) {
      console.error('Failed to save language to localStorage:', error);
    }
  }

  /**
   * Get stored language from localStorage
   */
  private getStoredLanguage(): string | null {
    try {
      return localStorage.getItem(this.LANGUAGE_KEY);
    } catch (error) {
      console.error('Failed to get language from localStorage:', error);
      return null;
    }
  }

  /**
   * Get list of supported languages
   */
  getSupportedLanguages(): string[] {
    return [...this.SUPPORTED_LANGUAGES];
  }

  /**
   * Get language display name
   */
  getLanguageDisplayName(lang: string): string {
    const displayNames: Record<string, string> = {
      'en': 'English',
      'ar': 'العربية',
      'fr': 'Français'
    };
    return displayNames[lang] || lang;
  }

  /**
   * Toggle between supported languages (en -> ar -> fr -> en)
   */
  toggleLanguage(): void {
    const current = this.currentLanguage();
    const languages = this.SUPPORTED_LANGUAGES;
    const currentIndex = languages.indexOf(current);
    const nextIndex = (currentIndex + 1) % languages.length;
    this.switchLanguage(languages[nextIndex]);
  }

  /**
   * Get instant translation (synchronous)
   */
  instant(key: string, params?: any): string {
    return this.translate.instant(key, params);
  }

  /**
   * Clear stored language preference
   */
  clearStoredLanguage(): void {
    try {
      localStorage.removeItem(this.LANGUAGE_KEY);
    } catch (error) {
      console.error('Failed to clear language from localStorage:', error);
    }
  }
}
