import { Component, computed, signal, OnInit, OnDestroy, HostBinding, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { RippleModule } from 'primeng/ripple';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { MenuItem } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { filter, Subject, takeUntil } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { TokenStorageService } from '../services/token-storage.service';
import { AuthService } from '../services/auth.service';
import { LayoutService } from '../services/layout.service';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    MenubarModule, ButtonModule, BadgeModule, RippleModule,
    SelectModule, TooltipModule, TranslateModule
  ],
  template: `
    <div class="sidebar navbar topbar" *ngIf="showNavbar()" [class.mobile-open]="isMobileActive()">

      <!-- ── Brand / Logo ── -->
      <div class="sidebar-brand">
        <span class="brand-icon"><i class="pi pi-bolt"></i></span>
        <span class="brand-name">{{ 'COMMON.APP_NAME' | translate }}</span>
      </div>

      <!-- ── Navigation Menu ── -->
      <nav class="sidebar-nav">
        <ng-container *ngFor="let item of items()">
          <!-- Section label -->
          <div *ngIf="item.disabled && item.styleClass === 'menu-section-label'" class="nav-section-label">
            <i *ngIf="item.icon" [class]="item.icon"></i>
            <span>{{ item.label }}</span>
          </div>
          <!-- Separator -->
          <div *ngIf="item.separator" class="nav-separator"></div>
          <!-- Regular menu item -->
          <a *ngIf="!item.separator && !item.disabled"
             class="nav-item"
             [class.active]="isActiveRoute(item.routerLink)"
             [routerLink]="item.routerLink"
             (click)="closeOnMobile()">
            <i [class]="item.icon + ' nav-icon'"></i>
            <span class="nav-label">{{ item.label }}</span>
          </a>
        </ng-container>
      </nav>

      <!-- ── Bottom Controls ── -->
      <div class="sidebar-bottom">

        <!-- ROW 1: Language -->
        <div class="bottom-section lang-row">
          <div class="language-section">
            <p-select
              [options]="languageOptions()"
              [ngModel]="currentLanguage()"
              (ngModelChange)="setLanguage($event)"
              optionLabel="label"
              optionValue="value"
              styleClass="lang-select"
              [placeholder]="'NAVBAR.LANGUAGE' | translate">
            </p-select>
          </div>
        </div>

        <div class="bottom-divider"></div>

        <!-- ROW 2: Avatar + Username + Theme toggle + Logout -->
        <div class="bottom-section user-section">
          <div class="user-info" *ngIf="currentUsername()">
            <span class="user-avatar-circle">
              <i class="pi pi-user"></i>
            </span>
            <span class="username-text">{{ currentUsername() }}</span>
          </div>
          <div class="user-actions">
            <!-- Theme toggle -->
            <button class="bottom-btn theme-btn"
                    (click)="layoutService.toggleTheme()"
                    [pTooltip]="(layoutService.isDarkTheme() ? 'NAVBAR.LIGHT_MODE' : 'NAVBAR.DARK_MODE') | translate"
                    tooltipPosition="right">
              <i [class]="layoutService.isDarkTheme() ? 'pi pi-sun' : 'pi pi-moon'"></i>
            </button>
            <!-- Logout -->
            <button class="bottom-btn logout-btn"
                    (click)="logout()"
                    [pTooltip]="'NAVBAR.LOGOUT' | translate"
                    tooltipPosition="right">
              <i class="pi pi-sign-out"></i>
            </button>
          </div>
        </div>

      </div>
    </div>

    <!-- Mobile hamburger button (top-left when sidebar hidden) -->
    <button *ngIf="showNavbar() && isMobileVisible() && !isMobileActive()"
            class="mobile-hamburger"
            (click)="toggleSidebar()">
      <i class="pi pi-bars"></i>
    </button>

    <!-- Mobile overlay backdrop -->
    <div class="sidebar-backdrop" *ngIf="isMobileActive() && showNavbar()" (click)="closeMobileSidebar()"></div>
  `,
  styles: [`
    /* ═══════════════════════════════════════
       SIDEBAR SHELL
       ═══════════════════════════════════════ */
    :host {
      display: flex;
      flex-direction: column;
      align-self: stretch;
      overflow: hidden;
    }

    .sidebar {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 0;
      width: 260px;
      background: var(--app-sidebar-bg, #ffffff);
      border-right: 1px solid var(--app-sidebar-border, #e2e8f0);
      overflow: hidden;
      transition: background-color 0.2s ease, border-color 0.2s ease;
    }

    :host-context(html[dir="rtl"]) .sidebar {
      border-right: none;
      border-left: 1px solid var(--app-sidebar-border, #e2e8f0);
    }

    /* ═══════════════════════════════════════
       BRAND
       ═══════════════════════════════════════ */
    .sidebar-brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1.25rem 1.25rem 1rem;
      border-bottom: 1px solid var(--app-sidebar-border, #e2e8f0);
      flex-shrink: 0;
    }

    .brand-icon {
      width: 2rem;
      height: 2rem;
      background: var(--primary-color, #6366f1);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 1rem;
      flex-shrink: 0;
    }

    .brand-name {
      font-weight: 700;
      font-size: 1rem;
      color: var(--app-text-primary, #1e293b);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* ═══════════════════════════════════════
       NAV
       ═══════════════════════════════════════ */
    .sidebar-nav {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 0.5rem 0.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.1rem;
    }

    .nav-section-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 0.75rem 0.25rem;
      font-size: 0.68rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.09em;
      color: var(--app-text-muted, #94a3b8);
      pointer-events: none;
    }

    .nav-separator {
      height: 1px;
      background: var(--app-sidebar-border, #e2e8f0);
      margin: 0.35rem 0.5rem;
      transition: background-color 0.2s ease;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.65rem 0.75rem;
      border-radius: 8px;
      text-decoration: none;
      color: var(--app-text-primary, #1e293b);
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.15s ease, color 0.15s ease;
    }

    .nav-item:hover {
      background: var(--app-surface-hover, #f1f5f9);
      color: var(--primary-color, #6366f1);
    }

    .nav-item:hover .nav-icon {
      color: var(--primary-color, #6366f1);
    }

    .nav-item.active {
      background: color-mix(in srgb, var(--primary-color, #6366f1) 12%, transparent);
      color: var(--primary-color, #6366f1);
      font-weight: 600;
    }

    .nav-item.active .nav-icon {
      color: var(--primary-color, #6366f1);
    }

    .nav-icon {
      font-size: 1rem;
      width: 1rem;
      flex-shrink: 0;
      color: var(--app-text-secondary, #64748b);
      transition: color 0.15s ease;
    }

    .nav-label {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* ═══════════════════════════════════════
       BOTTOM CONTROLS
       ═══════════════════════════════════════ */
    .sidebar-bottom {
      flex-shrink: 0;
      border-top: 1px solid var(--app-sidebar-border, #e2e8f0);
      padding: 0.5rem 0;
      background: var(--app-sidebar-bg, #ffffff);
      transition: background-color 0.2s ease, border-color 0.2s ease;
    }

    .bottom-divider {
      height: 1px;
      background: var(--app-sidebar-border, #e2e8f0);
      margin: 0.25rem 0.75rem;
    }

    .bottom-section {
      padding: 0.4rem 0.75rem;
    }

    /* ── ROW 1: Language ── */
    .lang-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .language-section {
      flex: 1;
      min-width: 0;
    }

    .bottom-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2.25rem;
      height: 2.25rem;
      border: none;
      background: transparent;
      border-radius: 8px;
      cursor: pointer;
      color: var(--app-text-secondary, #64748b);
      font-size: 1rem;
      transition: background-color 0.15s ease, color 0.15s ease;
    }

    .bottom-btn:hover {
      background: var(--app-surface-hover, #f1f5f9);
      color: var(--primary-color, #6366f1);
    }

    /* ── Language ── */
    :host ::ng-deep .lang-select {
      width: 100%;
      font-size: 0.83rem;
    }
    :host ::ng-deep .lang-select .p-select-label { font-size: 0.83rem; padding: 0.4rem 0.6rem; }

    /* ── ROW 2: User section ── */
    .user-section {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      flex: 1;
      min-width: 0;
    }

    .user-avatar-circle {
      width: 1.9rem;
      height: 1.9rem;
      border-radius: 50%;
      background: color-mix(in srgb, var(--primary-color, #6366f1) 15%, transparent);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
      color: var(--primary-color, #6366f1);
      flex-shrink: 0;
    }

    .username-text {
      font-size: 0.83rem;
      font-weight: 600;
      color: var(--app-text-primary, #1e293b);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .user-actions {
      display: flex;
      gap: 0.25rem;
      align-items: center;
      flex-shrink: 0;
    }

    .theme-btn:hover { color: #f59e0b !important; }

    .logout-btn:hover {
      background: rgba(239,68,68,.1) !important;
      color: #ef4444 !important;
    }

    /* ═══════════════════════════════════════
       MOBILE
       ═══════════════════════════════════════ */
    .mobile-hamburger {
      position: fixed;
      top: 1rem;
      left: 1rem;
      z-index: 1100;
      width: 2.5rem;
      height: 2.5rem;
      border: 1px solid var(--app-card-border, #e2e8f0);
      background: var(--app-card-bg, #ffffff);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--app-text-primary, #1e293b);
      font-size: 1rem;
      box-shadow: 0 2px 8px rgba(0,0,0,.1);
      transition: background-color 0.2s;
    }

    :host-context(html[dir="rtl"]) .mobile-hamburger {
      left: auto;
      right: 1rem;
    }

    .sidebar-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,.35);
      z-index: 998;
    }

    @media (max-width: 991px) {
      .sidebar {
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        z-index: 999;
        transform: translateX(-100%);
        box-shadow: 4px 0 24px rgba(0,0,0,0.15);
        transition: transform 0.25s ease, background-color 0.2s ease;
      }

      .sidebar.mobile-open {
        transform: translateX(0);
      }

      :host-context(html[dir="rtl"]) .sidebar {
        left: auto;
        right: 0;
        transform: translateX(100%);
        border-right: none;
        border-left: 1px solid var(--app-sidebar-border, #e2e8f0);
      }

      :host-context(html[dir="rtl"]) .sidebar.mobile-open {
        transform: translateX(0);
      }
    }
  `]
})
export class NavbarComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly currentUrl = signal<string>('');
  private readonly authTick = signal(0);
  private readonly layoutService_ = inject(LayoutService);
  readonly layoutService = this.layoutService_;
  readonly languageService = inject(LanguageService);

  readonly isAuthed = computed(() => {
    this.authTick();
    return this.tokenStorage.hasValidToken();
  });
  readonly isLoginRoute = computed(() => this.currentUrl().startsWith('/login'));
  readonly showNavbar = computed(() => this.isAuthed() && !this.isLoginRoute());
  readonly isMobileActive = computed(() => this.layoutService.sidebarVisible());
  // Show hamburger on screens <= 991px (matches CSS breakpoint)
  readonly isMobileVisible = signal(typeof window !== 'undefined' && window.innerWidth <= 991);

  readonly currentUsername = computed(() => {
    this.authTick();
    return this.authService.getCurrentUser()?.username ?? null;
  });
  readonly currentLanguage = computed(() => this.languageService.currentLanguage());
  readonly languageOptions = computed(() =>
    this.languageService.getSupportedLanguages().map(lang => ({
      label: this.languageService.getLanguageDisplayName(lang),
      value: lang
    }))
  );

  readonly items = signal<MenuItem[]>([]);

  constructor(
    private readonly router: Router,
    private readonly tokenStorage: TokenStorageService,
    private readonly authService: AuthService,
    private readonly translateService: TranslateService
  ) {
    this.currentUrl.set(this.router.url);

    effect(() => { this.updateMenuItems(); });

    this.translateService.onLangChange
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.updateMenuItems());

    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd), takeUntil(this.destroy$))
      .subscribe((e) => {
        this.currentUrl.set(e.urlAfterRedirects);
        this.layoutService.setSidebarVisible(false);
      });

    this.tokenStorage.onAuthChanged(() => {
      this.authTick.update(v => v + 1);
      this.updateMenuItems();
    });
  }

  @HostBinding('class.is-hidden')
  get isHidden(): boolean { return !this.showNavbar(); }

  private readonly onResize = () => {
    this.isMobileVisible.set(window.innerWidth <= 991);
    if (window.innerWidth > 991) {
      this.layoutService.setSidebarVisible(false);
    }
  };

  ngOnInit(): void {
    this.updateMenuItems();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this.onResize);
    }
  }

  isActiveRoute(routerLink: string | undefined): boolean {
    if (!routerLink) return false;
    return this.currentUrl() === routerLink || this.currentUrl().startsWith(routerLink + '/');
  }

  closeOnMobile(): void { this.layoutService.setSidebarVisible(false); }
  toggleSidebar(): void { this.layoutService.toggleSidebar(); }
  closeMobileSidebar(): void { this.layoutService.setSidebarVisible(false); }

  setLanguage(lang: string): void { this.languageService.switchLanguage(lang); }

  logout(): void {
    this.authService.logout();
    void this.router.navigate(['/login']);
  }



  private updateMenuItems(): void {
    const isSuperAdmin = this.authService.isSuperAdmin();
    const isAdmin = this.authService.isAdmin();

    const items: MenuItem[] = [
      { label: this.translateService.instant('NAVBAR.DASHBOARD'), icon: 'pi pi-home', routerLink: '/dashboard' }
    ];

    if (isSuperAdmin) {
      items.push({ separator: true });
      items.push({ label: this.translateService.instant('NAVBAR.SUPER_ADMIN_SECTION'), icon: 'pi pi-bolt', disabled: true, styleClass: 'menu-section-label' });
      items.push(
        { label: this.translateService.instant('ADMIN.SUPER_DASHBOARD.TITLE'), icon: 'pi pi-server', routerLink: '/admin/super-dashboard' },
        { label: this.translateService.instant('ADMIN.COMPANIES.TITLE'), icon: 'pi pi-building', routerLink: '/admin/companies' },
        { label: this.translateService.instant('ADMIN.USERS.TITLE'), icon: 'pi pi-users', routerLink: '/admin/users' },
        { label: this.translateService.instant('ADMIN.PLANS.TITLE'), icon: 'pi pi-list', routerLink: '/admin/plans' },
        { label: this.translateService.instant('ADMIN.PAYMENTS.TITLE'), icon: 'pi pi-wallet', routerLink: '/admin/payments' },
        { label: this.translateService.instant('AUDIT.TITLE'), icon: 'pi pi-history', routerLink: '/audit-logs' }
      );
    } else {
      items.push({ separator: true });
      items.push({ label: this.translateService.instant('NAVBAR.MY_WORKSPACE'), icon: 'pi pi-briefcase', disabled: true, styleClass: 'menu-section-label' });
      items.push(
        { label: this.translateService.instant('NAVBAR.INVOICES'), icon: 'pi pi-receipt', routerLink: '/invoices' },
        { label: this.translateService.instant('NAVBAR.CUSTOMERS'), icon: 'pi pi-users', routerLink: '/customers' },
        { label: this.translateService.instant('NAVBAR.REPORTS'), icon: 'pi pi-chart-bar', routerLink: '/reports' }
      );
      if (isAdmin) {
        items.push({ separator: true });
        items.push({ label: this.translateService.instant('NAVBAR.ADMIN_SECTION'), icon: 'pi pi-shield', disabled: true, styleClass: 'menu-section-label' });
        items.push(
          { label: this.translateService.instant('ADMIN.ADMIN_DASHBOARD.TITLE'), icon: 'pi pi-desktop', routerLink: '/admin/dashboard' },
          { label: this.translateService.instant('ADMIN.USERS.TITLE'), icon: 'pi pi-user-edit', routerLink: '/admin/users' },
          { label: this.translateService.instant('AUDIT.TITLE'), icon: 'pi pi-history', routerLink: '/audit-logs' }
        );
      }
    }

    // New features available to all authenticated users
    items.push({ separator: true });
    items.push({ label: this.translateService.instant('NAVBAR.MY_WORKSPACE'), icon: 'pi pi-briefcase', disabled: true, styleClass: 'menu-section-label' });
    items.push(
      { label: this.translateService.instant('CATALOG.TITLE'), icon: 'pi pi-box', routerLink: '/catalog' },
      { label: this.translateService.instant('EXPENSES.TITLE'), icon: 'pi pi-wallet', routerLink: '/expenses' },
      { label: this.translateService.instant('TAX_REPORTS.TITLE'), icon: 'pi pi-percentage', routerLink: '/tax-reports' },
      { label: this.translateService.instant('CHATBOT.TITLE'), icon: 'pi pi-sparkles', routerLink: '/chatbot' }
    );

    items.push({ separator: true });
    items.push(
      { label: this.translateService.instant('BILLING.TITLE'), icon: 'pi pi-credit-card', routerLink: '/billing' },
      { label: this.translateService.instant('NAVBAR.SETTINGS'), icon: 'pi pi-cog', routerLink: '/settings' },
      { label: this.translateService.instant('NAVBAR.PROFILE'), icon: 'pi pi-user', routerLink: '/profile' }
    );

    this.items.set(items);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.onResize);
    }
  }
}
