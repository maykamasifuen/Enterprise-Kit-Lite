import { Component, OnInit, signal, computed, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { DividerModule } from 'primeng/divider';
import { DatePickerModule } from 'primeng/datepicker';
import { MessageService } from 'primeng/api';

import { DashboardService, DashboardStats } from '../services/dashboard.service';
import { ShortNumberPipe } from '../pipes/short-number.pipe';
import { LocalizedNumberPipe } from '../pipes/localized-number.pipe';
import { AuthService } from '../services/auth.service';
import { CompanyService, SystemStats } from '../services/company.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ChartModule,
    ButtonModule,
    ProgressSpinnerModule,
    ToolbarModule,
    TooltipModule,
    DividerModule,
    DatePickerModule,
    TranslateModule,
    ShortNumberPipe,
    LocalizedNumberPipe
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly authService = inject(AuthService);
  private readonly companyService = inject(CompanyService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly stats = signal<DashboardStats | null>(null);
  readonly systemStats = signal<SystemStats | null>(null);
  readonly isAdmin = signal(false);
  readonly isSuperAdmin = signal(false);

  dateFrom: Date | null = null;
  dateTo: Date | null = null;

  readonly pieChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 1.8,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { usePointStyle: true, padding: 16, font: { size: 12 } }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const pct = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${value} (${pct}%)`;
          }
        }
      }
    }
  };

  readonly pieChartData = computed(() => {
    const s = this.stats();
    if (!s) {
      return { labels: [], datasets: [] };
    }

    // Translate status labels so they render correctly
    const paidLabel = this.translate.instant('STATUS.PAID');
    const pendingLabel = this.translate.instant('STATUS.PENDING');
    const overdueLabel = this.translate.instant('STATUS.OVERDUE');
    const cancelledLabel = this.translate.instant('STATUS.CANCELLED');

    return {
      labels: [paidLabel, pendingLabel, overdueLabel, cancelledLabel],
      datasets: [
        {
          data: [s.paidCount, s.pendingCount, s.overdueCount, s.cancelledCount],
          backgroundColor: ['#22c55e', '#f59e0b', '#ef4444', '#6b7280'],
          hoverBackgroundColor: ['#16a34a', '#d97706', '#dc2626', '#4b5563'],
          borderWidth: 2,
          borderColor: '#ffffff'
        }
      ]
    };
  });

  readonly hasInvoices = computed(() => {
    const s = this.stats();
    return s && s.totalInvoices > 0;
  });

  readonly paymentRate = computed(() => {
    const s = this.stats();
    if (!s || s.totalInvoices === 0) return 0;
    return ((s.paidCount / s.totalInvoices) * 100).toFixed(1);
  });

  readonly overdueRate = computed(() => {
    const s = this.stats();
    if (!s || s.totalInvoices === 0) return 0;
    return ((s.overdueCount / s.totalInvoices) * 100).toFixed(1);
  });

  readonly averageInvoice = computed(() => {
    const s = this.stats();
    if (!s || s.totalInvoices === 0) return 0;
    return s.totalAmount / s.totalInvoices;
  });



  constructor(
    private readonly dashboardService: DashboardService,
    private readonly router: Router,
    private readonly messageService: MessageService,
    private readonly translate: TranslateService
  ) {
    // Re-compute chart data when language changes
    // Re-compute chart data when language changes
    this.translate.onLangChange
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        const currentStats = this.stats();
        if (currentStats) {
          // Force chart to re-render by updating stats with a new object reference
          this.stats.set({ ...currentStats });
        }
        const currentSystemStats = this.systemStats();
        if (currentSystemStats) {
          this.systemStats.set({ ...currentSystemStats });
        }
      });

    // Automatically refresh dashboard when invoice data changes (import, create, update, delete)
    this.dashboardService.invoiceDataChanged$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.isSuperAdmin()) {
          this.loadSystemStats();
        } else if (this.isAdmin()) {
          this.loadStats();
        }
      });
  }

  ngOnInit(): void {
    this.checkRoleAndLoad();
  }

  private checkRoleAndLoad(): void {
    const user = this.authService.getCurrentUser();
    if (!user) {
      // Token may not be decoded yet — retry once after a microtask
      queueMicrotask(() => {
        const retryUser = this.authService.getCurrentUser();
        if (!retryUser) {
          this.isAdmin.set(false);
          this.isSuperAdmin.set(false);
          this.loading.set(false);
          return;
        }
        this._applyRoles(retryUser);
      });
      return;
    }
    this._applyRoles(user);
  }

  private _applyRoles(user: { roles?: string[] }): void {
    // Normalise roles — tolerate missing, empty, or ROLE_-prefixed values
    const roles: string[] = (user.roles ?? []).map(r => r.toUpperCase().replace(/^ROLE_/, ''));

    const hasSuperAdmin = roles.includes('SUPER_ADMIN');
    const hasAdmin = roles.includes('ADMIN');

    console.debug('[Dashboard] user roles:', user.roles, '→ normalised:', roles,
      '| superAdmin:', hasSuperAdmin, '| admin:', hasAdmin);

    if (hasSuperAdmin) {
      this.isSuperAdmin.set(true);
      this.isAdmin.set(false);
      this.loadSystemStats();
    } else if (hasAdmin) {
      this.isAdmin.set(true);
      this.isSuperAdmin.set(false);
      this.loadStats();
    } else {
      // Regular user — show quick-actions panel
      this.isAdmin.set(false);
      this.isSuperAdmin.set(false);
      this.loading.set(false);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadSystemStats(): void {
    this.loading.set(true);
    this.error.set(null);
    this.companyService.getSystemStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.systemStats.set(res);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Failed to load system stats', err);
          this.error.set(this.translate.instant('DASHBOARD.FAILED_TO_LOAD'));
          this.loading.set(false);
        }
      });
  }

  loadStats(): void {
    this.loading.set(true);
    this.error.set(null);

    this.dashboardService
      .getStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.stats.set(data);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Failed to load dashboard stats:', err);

          const msg = this.translate.instant('DASHBOARD.FAILED_TO_LOAD_TRY_AGAIN');
          this.error.set(msg);
          this.loading.set(false);

          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('COMMON.ERROR'),
            detail: this.translate.instant('DASHBOARD.FAILED_TO_LOAD')
          });
        }
      });
  }

  filterByDateRange(): void {
    if (!this.dateFrom || !this.dateTo) return;
    const from = this.dateFrom.toISOString().split('T')[0];
    const to = this.dateTo.toISOString().split('T')[0];
    this.loading.set(true);
    this.dashboardService.getStatsByDateRange(from, to)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: data => { this.stats.set(data); this.loading.set(false); },
        error: () => this.loading.set(false)
      });
  }

  clearDateFilter(): void {
    this.dateFrom = null;
    this.dateTo = null;
    this.loadStats();
  }

  navigateToInvoices(): void {
    this.router.navigate(['/invoices']);
  }

  navigateToReports(): void {
    this.router.navigate(['/reports']);
  }

  navigate(path: string): void {
    this.router.navigate([path]);
  }
}
