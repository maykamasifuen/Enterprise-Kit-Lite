import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';

import { TokenStorageService } from './token-storage.service';

export interface CompanySettings {
  companyName: string;
  taxNumber: string;
  address: string;
  phone: string;
  email: string;
  website: string;
}

export interface InvoiceSettings {
  invoicePrefix: string;
  nextInvoiceNumber: number;
  currency: string;
  defaultTaxRate: number;
  paymentTerms: number;
  defaultNotes: string;
}

export interface RegionalSettings {
  dateFormat: string;
  timezone: string;
}

export interface AppSettings {
  company: CompanySettings;
  invoice: InvoiceSettings;
  regional: RegionalSettings;
}

const DEFAULT_SETTINGS: AppSettings = {
  company: { companyName: '', taxNumber: '', address: '', phone: '', email: '', website: '' },
  invoice: { invoicePrefix: 'INV-', nextInvoiceNumber: 1, currency: 'USD', defaultTaxRate: 0, paymentTerms: 30, defaultNotes: '' },
  regional: { dateFormat: 'yyyy-MM-dd', timezone: 'UTC' }
};

/** Maps the flat backend DTO to the nested AppSettings structure. */
function fromBackend(dto: any): AppSettings {
  return {
    company: {
      companyName: dto.companyName ?? '',
      taxNumber: dto.taxNumber ?? '',
      address: dto.address ?? '',
      phone: dto.phone ?? '',
      email: dto.email ?? '',
      website: dto.website ?? '',
    },
    invoice: {
      invoicePrefix: dto.invoicePrefix ?? 'INV-',
      nextInvoiceNumber: dto.nextInvoiceNumber ?? 1,
      currency: dto.currency ?? 'USD',
      defaultTaxRate: dto.defaultTaxRate ?? 0,
      paymentTerms: dto.paymentTerms ?? 30,
      defaultNotes: dto.defaultNotes ?? '',
    },
    regional: {
      dateFormat: dto.dateFormat ?? 'yyyy-MM-dd',
      timezone: dto.timezone ?? 'UTC',
    },
  };
}

/** Maps the nested AppSettings to the flat backend DTO. */
function toBackend(s: AppSettings): object {
  return {
    companyName: s.company.companyName,
    taxNumber: s.company.taxNumber,
    address: s.company.address,
    phone: s.company.phone,
    email: s.company.email,
    website: s.company.website,
    invoicePrefix: s.invoice.invoicePrefix,
    nextInvoiceNumber: s.invoice.nextInvoiceNumber,
    currency: s.invoice.currency,
    defaultTaxRate: s.invoice.defaultTaxRate,
    paymentTerms: s.invoice.paymentTerms,
    defaultNotes: s.invoice.defaultNotes,
    dateFormat: s.regional.dateFormat,
    timezone: s.regional.timezone,
  };
}

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly SETTINGS_KEY = 'app_settings';
  private readonly apiUrl = `${environment.apiUrl}/settings`;
  private readonly http = inject(HttpClient);
  private readonly tokenStorage = inject(TokenStorageService);

  private readonly _settings = signal<AppSettings>(DEFAULT_SETTINGS);
  readonly settings = this._settings.asReadonly();
  readonly company = computed(() => this._settings().company);
  readonly invoice = computed(() => this._settings().invoice);
  readonly regional = computed(() => this._settings().regional);
  readonly currency = computed(() => this._settings().invoice.currency);
  readonly dateFormat = computed(() => this._settings().regional.dateFormat);
  readonly invoicePrefix = computed(() => this._settings().invoice.invoicePrefix);

  constructor() {
    // Only load settings if there's a valid token
    // Otherwise, wait for loadSettings() to be called after login
    if (this.tokenStorage.hasValidToken()) {
      this.loadSettings();
    }
  }

  /** Loads settings from the backend API, falling back to localStorage cache. */
  loadSettings(): void {
    this.http.get<any>(this.apiUrl).pipe(
      tap(dto => {
        const settings = fromBackend(dto);
        this._settings.set(settings);
        localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
      }),
      catchError(() => {
        // Network unavailable – use localStorage cache
        try {
          const saved = localStorage.getItem(this.SETTINGS_KEY);
          if (saved) {
            const parsed = JSON.parse(saved);
            this._settings.set({
              company: { ...DEFAULT_SETTINGS.company, ...parsed.company },
              invoice: { ...DEFAULT_SETTINGS.invoice, ...parsed.invoice },
              regional: { ...DEFAULT_SETTINGS.regional, ...parsed.regional },
            });
          }
        } catch { /* ignore */ }
        return of(null);
      })
    ).subscribe();
  }

  /** Persists settings to the backend and updates local cache. */
  saveSettings(settings: Partial<AppSettings>): Observable<any> {
    const current = this._settings();
    const updated: AppSettings = {
      company: { ...current.company, ...settings.company },
      invoice: { ...current.invoice, ...settings.invoice },
      regional: { ...current.regional, ...settings.regional },
    };

    return this.http.put<any>(this.apiUrl, toBackend(updated)).pipe(
      tap(dto => {
        const saved = fromBackend(dto);
        this._settings.set(saved);
        localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(saved));
      }),
      catchError(err => {
        console.error('Failed to save settings to server:', err);
        // Still update local state so the UI isn't blocked
        this._settings.set(updated);
        localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(updated));
        throw err;
      })
    );
  }

  updateCompany(company: Partial<CompanySettings>): Observable<any> {
    return this.saveSettings({ company: { ...this._settings().company, ...company } });
  }

  updateInvoice(invoice: Partial<InvoiceSettings>): Observable<any> {
    return this.saveSettings({ invoice: { ...this._settings().invoice, ...invoice } });
  }

  updateRegional(regional: Partial<RegionalSettings>): Observable<any> {
    return this.saveSettings({ regional: { ...this._settings().regional, ...regional } });
  }

  formatCurrency(amount: number): string {
    const currencyCode = this.currency();
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode }).format(amount);
    } catch {
      return `${currencyCode} ${amount.toFixed(2)}`;
    }
  }

  getCurrencySymbol(): string {
    const lang = typeof window !== 'undefined' ? localStorage.getItem('app_language') : 'en';
    const isAr = lang === 'ar';
    const symbols: Record<string, string> = {
      'USD': '$', 'EUR': '€', 'GBP': '£',
      'SAR': isAr ? 'ر.س' : 'SAR',
      'AED': isAr ? 'د.إ' : 'AED',
      'EGP': isAr ? 'ج.م' : 'EGP',
      'KWD': isAr ? 'د.ك' : 'KWD',
      'QAR': isAr ? 'ر.ق' : 'QAR'
    };
    const code = this.currency();
    const symbol = symbols[code] || code;
    return isAr ? symbol : symbol + ' ';
  }

  resetSettings(): void {
    this._settings.set(DEFAULT_SETTINGS);
    localStorage.removeItem(this.SETTINGS_KEY);
  }
}
