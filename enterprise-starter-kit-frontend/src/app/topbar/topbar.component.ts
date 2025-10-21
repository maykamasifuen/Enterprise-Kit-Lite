import { Component, HostBinding, HostListener, computed, signal, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { SelectModule } from 'primeng/select';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';

import { TokenStorageService } from '../services/token-storage.service';
import { AuthService } from '../services/auth.service';
import { LanguageService } from '../services/language.service';
import { LayoutService } from '../services/layout.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, RippleModule, SelectModule, TranslateModule],
  template: `
    <header class="topbar" *ngIf="showTopbar()">
      <div class="topbar-left">
        <button
          pButton
          type="button"
          icon="pi pi-bars"
          class="p-button-text p-button-rounded menu-button mobile-menu-btn"
          (click)="toggleSidebar()">
        </button>
        <span class="brand">
          <i class="pi pi-building"></i>
          {{ 'COMMON.APP_NAME' | translate }}
        </span>
      </div>

      <div class="topbar-actions">
        <div class="language-switcher language-slot">
          <p-select
            [options]="languageOptions()"
            [ngModel]="currentLanguage()"
            (ngModelChange)="setLanguage($event)"
            optionLabel="label"
            optionValue="value"
            styleClass="language-dropdown"
          ></p-select>
        </div>

        <div class="user-section user-slot">
          <!-- Theme toggle button -->
          <button
            pButton
            pRipple
            type="button"
            [icon]="layoutService.isDarkTheme() ? 'pi pi-sun' : 'pi pi-moon'"
            class="p-button-rounded p-button-text theme-toggle-btn"
            [title]="layoutService.isDarkTheme() ? ('NAVBAR.LIGHT_MODE' | translate) : ('NAVBAR.DARK_MODE' | translate)"
            (click)="layoutService.toggleTheme()"
          ></button>
          <span class="username" *ngIf="currentUsername()">
            <i class="pi pi-user"></i>
            {{ currentUsername() }}
          </span>
          <button
            pButton
            pRipple
            type="button"
            [label]="'NAVBAR.LOGOUT' | translate"
            icon="pi pi-sign-out"
            class="p-button-outlined p-button-danger logout-btn"
            (click)="logout()"
          ></button>
        </div>
      </div>
    </header>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
      }

      .topbar {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 1.25rem;
        background: var(--app-topbar-bg, #ffffff);
        border-bottom: 1px solid var(--app-topbar-border, #e2e8f0);
        color: var(--app-topbar-text, #1e293b);
        position: relative;
        z-index: 1000;
        gap: 1rem;
      }

      .topbar-left {
        display: flex;
        align-items: center;
        flex: 0 0 auto;
        gap: 1rem;
      }

      .mobile-menu-btn {
        display: none;
      }

      /* When sidebar should be collapsible on mobile */
      @media (max-width: 991px) {
        .mobile-menu-btn {
          display: inline-flex;
        }
      }

      .brand {
        font-weight: 700;
        font-size: 1.1rem;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
      }

      .topbar-actions {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex: 0 0 auto;
      }

      .language-switcher {
        display: flex;
        align-items: center;
        padding-left: 0.75rem;
        border-left: 1px solid var(--app-topbar-border, #e2e8f0);
      }

      .language-dropdown {
        min-width: 160px;
      }

      .user-section {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding-left: 0.75rem;
        border-left: 1px solid var(--app-topbar-border, #e2e8f0);
        margin-left: auto;
      }

      .username {
        font-size: 0.875rem;
        color: var(--app-text-secondary, #64748b);
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .logout-btn {
        font-size: 0.875rem !important;
      }

      :host-context(html[dir="rtl"]) .topbar {
        direction: rtl;
      }

      :host-context(html[dir="rtl"]) .topbar-actions {
        direction: rtl;
      }

      :host-context(html[dir="rtl"]) .brand {
        margin: 0;
        flex-direction: row-reverse;
      }

      :host-context(html[dir="rtl"]) .username {
        flex-direction: row-reverse;
      }

      :host-context(html[dir="rtl"]) .topbar-left {
        order: 1;
      }

      :host-context(html[dir="rtl"]) .topbar-actions {
        order: 3;
      }

      :host-context(html[dir="rtl"]) .language-switcher,
      :host-context(html[dir="rtl"]) .user-section {
        padding-left: 0;
        padding-right: 0.75rem;
        border-left: none;
        border-right: 1px solid var(--app-topbar-border, #e2e8f0);
      }

      :host-context(html[dir="rtl"]) .user-section {
        margin-left: 0;
        margin-right: auto;
      }

      @media (max-width: 900px) {
        .topbar {
          padding: 0 1rem;
        }

        .language-switcher {
          padding-left: 0.5rem;
        }

        .user-section {
          padding-left: 0.5rem;
        }
      }

      @media (max-width: 768px) {
        .username {
          display: none;
        }

        .logout-btn {
          padding: 0.5rem !important;
        }

        .logout-btn .p-button-label {
          display: none;
        }
      }
    `
  ]
})
export class TopbarComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly authTick = signal(0);
  readonly layoutService = inject(LayoutService);

  readonly currentTitle = signal<string>('');
  readonly currentTitleIcon = signal<string>('');

  private readonly routeTitleMap: { path: string; key: string; icon?: string }[] = [
    { path: '/dashboard', key: 'NAVBAR.DASHBOARD', icon: 'pi pi-home' },
    { path: '/invoices', key: 'NAVBAR.INVOICES', icon: 'pi pi-receipt' },
    { path: '/customers', key: 'NAVBAR.CUSTOMERS', icon: 'pi pi-users' },
    { path: '/reports', key: 'NAVBAR.REPORTS', icon: 'pi pi-chart-bar' },
    { path: '/admin/companies', key: 'ADMIN.COMPANIES.TITLE', icon: 'pi pi-building' },
    { path: '/admin/users', key: 'ADMIN.USERS.TITLE', icon: 'pi pi-users' },
    { path: '/settings', key: 'NAVBAR.SETTINGS', icon: 'pi pi-cog' },
    { path: '/profile', key: 'NAVBAR.PROFILE', icon: 'pi pi-user' }
  ];

  readonly currentUsername = computed(() => {
    this.authTick();
    return this.authService.getCurrentUser()?.username ?? null;
  });
  readonly isAuthed = computed(() => {
    this.authTick();
    return this.tokenStorage.hasValidToken();
  });
  readonly showTopbar = computed(() => this.isAuthed() && !this.isLoginRoute());
  readonly currentLanguage = computed(() => this.languageService.currentLanguage());
  readonly languageOptions = computed(() =>
    this.languageService.getSupportedLanguages().map((lang) => ({
      label: this.languageService.getLanguageDisplayName(lang),
      value: lang
    }))
  );
  readonly isLoginRoute = computed(() => this.router.url.startsWith('/login'));

  constructor(
    private readonly router: Router,
    private readonly tokenStorage: TokenStorageService,
    private readonly authService: AuthService,
    readonly languageService: LanguageService,
    private readonly translateService: TranslateService
  ) {
    this.router.events.pipe(takeUntil(this.destroy$)).subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.authTick.update((v) => v + 1);
        this.updateTitle(event.urlAfterRedirects);
      }
    });

    this.tokenStorage.onAuthChanged(() => {
      this.authTick.update((v) => v + 1);
    });

    this.translateService.onLangChange.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.updateTitle(this.router.url);
    });
  }

  @HostBinding('class.is-hidden')
  get isHidden(): boolean {
    return !this.showTopbar();
  }

  ngOnInit(): void {
    this.updateTitle(this.router.url);
  }

  toggleSidebar(): void {
    this.layoutService.toggleSidebar();
  }

  setLanguage(lang: string): void {
    this.languageService.switchLanguage(lang);
  }

  logout(): void {
    this.authService.logout();
    void this.router.navigate(['/login']);
  }

  private updateTitle(url: string): void {
    const match = this.routeTitleMap.find(m => url.startsWith(m.path));
    if (match) {
      this.currentTitle.set(this.translateService.instant(match.key));
      this.currentTitleIcon.set(match.icon || '');
    } else {
      this.currentTitle.set('');
      this.currentTitleIcon.set('');
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
