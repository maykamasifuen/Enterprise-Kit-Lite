import { Component, OnInit, signal, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ChartModule } from 'primeng/chart';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { DashboardService, DashboardStats, DashboardTrends } from '../services/dashboard.service';

@Component({
  selector: 'app-dashboard-modern',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule, TranslateModule,
    CardModule, ButtonModule, TagModule, ChartModule,
    SkeletonModule, ToastModule, SelectModule
  ],
  providers: [MessageService],
  template: `
    <p-toast />
    <div class="dm-container">

      <!-- Header -->
      <div class="dm-header">
        <div>
          <h1>{{ 'DASHBOARD.TITLE' | translate }}</h1>
          <p class="dm-subtitle">{{ today | date:'EEEE, MMMM d, y' }}</p>
        </div>
        <div class="dm-header-actions">
          <p-select
            [(ngModel)]="trendMonths"
            [options]="monthOptions"
            optionLabel="label"
            optionValue="value"
            (onChange)="loadTrends()"
            styleClass="dm-month-select" />
          <p-button icon="pi pi-refresh" [rounded]="true" [text]="true"
            (onClick)="loadAll()" [loading]="loading()" />
        </div>
      </div>

      <!-- KPI Cards -->
      @if (loading()) {
        <div class="dm-kpi-grid">
          @for (_ of [1,2,3,4]; track $index) {
            <div class="dm-kpi-card"><p-skeleton height="100px" /></div>
          }
        </div>
      } @else if (stats()) {
        <div class="dm-kpi-grid">
          <div class="dm-kpi-card dm-kpi-blue">
            <div class="dm-kpi-icon"><i class="pi pi-receipt"></i></div>
            <div class="dm-kpi-body">
              <div class="dm-kpi-value">{{ stats()!.totalInvoices }}</div>
              <div class="dm-kpi-label">{{ 'DASHBOARD.TOTAL_INVOICES' | translate }}</div>
            </div>
          </div>
          <div class="dm-kpi-card dm-kpi-green">
            <div class="dm-kpi-icon"><i class="pi pi-check-circle"></i></div>
            <div class="dm-kpi-body">
              <div class="dm-kpi-value">{{ stats()!.paidCount }}</div>
              <div class="dm-kpi-label">{{ 'DASHBOARD.PAID' | translate }}</div>
            </div>
          </div>
          <div class="dm-kpi-card dm-kpi-orange">
            <div class="dm-kpi-icon"><i class="pi pi-clock"></i></div>
            <div class="dm-kpi-body">
              <div class="dm-kpi-value">{{ stats()!.pendingCount }}</div>
              <div class="dm-kpi-label">{{ 'DASHBOARD.PENDING' | translate }}</div>
            </div>
          </div>
          <div class="dm-kpi-card dm-kpi-red">
            <div class="dm-kpi-icon"><i class="pi pi-exclamation-circle"></i></div>
            <div class="dm-kpi-body">
              <div class="dm-kpi-value">{{ stats()!.overdueCount }}</div>
              <div class="dm-kpi-label">{{ 'DASHBOARD.OVERDUE' | translate }}</div>
            </div>
          </div>
        </div>
      }

      <!-- Charts Row -->
      <div class="dm-charts-grid">

        <!-- Revenue Trend Line Chart -->
        <p-card styleClass="dm-chart-card">
          <ng-template pTemplate="header">
            <div class="dm-card-header">
              <i class="pi pi-chart-line"></i>
              <strong class="ml-2">{{ 'DASHBOARD.REVENUE_CHART_TITLE' | translate }}</strong>
            </div>
          </ng-template>
          @if (loading()) {
            <p-skeleton height="260px" />
          } @else {
            <div class="chart-wrap">
              <p-chart type="line" [data]="trendChartData()" [options]="lineChartOptions" />
            </div>
          }
        </p-card>

        <!-- Status Distribution Donut -->
        <p-card styleClass="dm-chart-card">
          <ng-template pTemplate="header">
            <div class="dm-card-header">
              <i class="pi pi-chart-pie"></i>
              <strong class="ml-2">{{ 'DASHBOARD.STATUS_DISTRIBUTION' | translate }}</strong>
            </div>
          </ng-template>
          @if (loading()) {
            <p-skeleton height="260px" />
          } @else if (stats()) {
            <div class="chart-wrap">
              <p-chart type="doughnut" [data]="statusChartData()" [options]="donutOptions" />
            </div>
          }
        </p-card>

      </div>

      <!-- Quick Actions -->
      <p-card styleClass="dm-actions-card">
        <ng-template pTemplate="header">
          <div class="dm-card-header">
            <i class="pi pi-bolt"></i>
              <strong class="ml-2">{{ 'DASHBOARD.QUICK_ACTIONS.TITLE' | translate }}</strong>
          </div>
        </ng-template>
        <div class="dm-actions">
          <p-button label="{{ 'INVOICES.CREATE_INVOICE' | translate }}" icon="pi pi-plus" routerLink="/invoices" />
          <p-button label="{{ 'NAVBAR.CUSTOMERS' | translate }}" icon="pi pi-users" routerLink="/customers" severity="secondary" />
          <p-button label="{{ 'NAVBAR.REPORTS' | translate }}" icon="pi pi-chart-bar" routerLink="/reports" severity="secondary" />
          <p-button label="{{ 'EXPENSES.TITLE' | translate }}" icon="pi pi-wallet" routerLink="/expenses" severity="secondary" />
        </div>
      </p-card>

    </div>
  `,
  styles: [`
    .dm-container { padding: 1.5rem; max-width: 1400px; margin: 0 auto; }
    .dm-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:1.75rem; flex-wrap:wrap; gap:1rem; }
    h1 { margin:0; font-size:1.75rem; font-weight:700; }
    .dm-subtitle { margin:.25rem 0 0; opacity:.65; font-size:.9rem; }
    .dm-header-actions { display:flex; align-items:center; gap:.75rem; }

    .dm-kpi-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:1.25rem; margin-bottom:1.5rem; }
    .dm-kpi-card { border-radius:12px; padding:1.5rem; display:flex; align-items:center; gap:1.25rem;
      background:var(--app-card-bg, #ffffff); box-shadow:0 2px 8px rgba(0,0,0,.12);
      border-left:4px solid transparent; transition:transform .2s; }
    .dm-kpi-card:hover { transform:translateY(-2px); }
    .dm-kpi-blue   { border-left-color:#3b82f6; }
    .dm-kpi-green  { border-left-color:#22c55e; }
    .dm-kpi-orange { border-left-color:#f97316; }
    .dm-kpi-red    { border-left-color:#ef4444; }
    .dm-kpi-icon { font-size:2rem; opacity:.6; }
    .dm-kpi-value { font-size:2.25rem; font-weight:700; line-height:1; }
    .dm-kpi-label { font-size:.82rem; opacity:.65; margin-top:.3rem; }

    .dm-charts-grid { display:grid; grid-template-columns:2fr 1fr; gap:1.25rem; margin-bottom:1.25rem; }
    @media(max-width:900px) { .dm-charts-grid { grid-template-columns:1fr; } }

    .chart-wrap { position:relative; width:100%; height:260px; }
    .chart-wrap ::ng-deep canvas { width:100% !important; height:100% !important; }

    .dm-card-header { display:flex; align-items:center; padding:1rem 1.25rem 0; }
    .ml-2 { margin-left:.5rem; }

    .dm-actions-card { margin-top:0; }
    .dm-actions { display:flex; flex-wrap:wrap; gap:.75rem; }
  `]
})
export class DashboardModernComponent implements OnInit, OnDestroy {
  private readonly dashboardService = inject(DashboardService);
  private readonly messageService = inject(MessageService);
  private readonly destroy$ = new Subject<void>();

  readonly stats = signal<DashboardStats | null>(null);
  readonly trends = signal<DashboardTrends | null>(null);
  readonly loading = signal(false);

  trendMonths = 6;
  readonly today = new Date();
  readonly monthOptions = [
    { label: '3 months', value: 3 },
    { label: '6 months', value: 6 },
    { label: '12 months', value: 12 }
  ];

  readonly lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, ticks: { maxTicksLimit: 5 } }
    }
  };

  readonly donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
    cutout: '65%'
  };

  readonly trendChartData = () => {
    const t = this.trends();
    if (!t) return { labels: [], datasets: [] };
    return {
      labels: t.trends.map(r => r.month),
      datasets: [{
        label: 'Revenue',
        data: t.trends.map(r => r.revenue),
        fill: true,
        tension: 0.4,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59,130,246,0.12)',
        pointBackgroundColor: '#3b82f6'
      }]
    };
  };

  readonly statusChartData = () => {
    const s = this.stats();
    if (!s) return { labels: [], datasets: [] };
    return {
      labels: ['Paid', 'Pending', 'Overdue', 'Cancelled'],
      datasets: [{
        data: [s.paidCount, s.pendingCount, s.overdueCount, s.cancelledCount],
        backgroundColor: ['#22c55e', '#f97316', '#ef4444', '#6b7280'],
        hoverOffset: 6
      }]
    };
  };

  ngOnInit(): void { this.loadAll(); }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  loadAll(): void {
    this.loading.set(true);
    forkJoin({
      stats: this.dashboardService.getStats(),
      trends: this.dashboardService.getTrends(this.trendMonths)
    }).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ stats, trends }) => {
          this.stats.set(stats);
          this.trends.set(trends);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load dashboard' });
        }
      });
  }

  loadTrends(): void {
    this.dashboardService.getTrends(this.trendMonths)
      .pipe(takeUntil(this.destroy$))
      .subscribe(trends => this.trends.set(trends));
  }
}

