import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { UserManagementService, SystemStats } from '../../services/user-management.service';

@Component({
  selector: 'app-super-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterModule, TranslateModule,
    CardModule, ButtonModule, TagModule,
    ProgressSpinnerModule, ToastModule
  ],
  providers: [MessageService],
  template: `
    <p-toast />
    <div class="sa-container">
      <div class="page-header">
        <div class="header-left">
          <span class="header-icon">&#9889;</span>
          <div>
            <h1>{{ 'ADMIN.SUPER_DASHBOARD.TITLE' | translate }}</h1>
            <p class="subtitle">{{ 'ADMIN.SUPER_DASHBOARD.SUBTITLE' | translate }}</p>
          </div>
        </div>
        <p-button icon="pi pi-refresh" [rounded]="true" [text]="true"
          (onClick)="loadStats()" [loading]="loading()" />
      </div>

      @if (loading()) {
        <div class="loading-center"><p-progressSpinner strokeWidth="4" /></div>
      }

      @if (!loading() && stats()) {
        <div class="stats-grid">
          <div class="stat-card stat-blue">
            <div class="stat-icon">&#127970;</div>
            <div class="stat-body">
              <div class="stat-value">{{ stats()!.totalCompanies }}</div>
              <div class="stat-label">{{ 'ADMIN.SUPER_DASHBOARD.TOTAL_COMPANIES' | translate }}</div>
              <div class="stat-sub">{{ stats()!.activeCompanies }} {{ 'ADMIN.SUPER_DASHBOARD.ACTIVE' | translate }}</div>
            </div>
          </div>
          <div class="stat-card stat-green">
            <div class="stat-icon">&#128101;</div>
            <div class="stat-body">
              <div class="stat-value">{{ stats()!.totalUsers }}</div>
              <div class="stat-label">{{ 'ADMIN.SUPER_DASHBOARD.TOTAL_USERS' | translate }}</div>
              <div class="stat-sub">{{ stats()!.activeUsers }} {{ 'ADMIN.SUPER_DASHBOARD.ACTIVE' | translate }}</div>
            </div>
          </div>
          <div class="stat-card stat-purple">
            <div class="stat-icon">&#128196;</div>
            <div class="stat-body">
              <div class="stat-value">{{ stats()!.totalInvoices }}</div>
              <div class="stat-label">{{ 'ADMIN.SUPER_DASHBOARD.TOTAL_INVOICES' | translate }}</div>
            </div>
          </div>
          <div class="stat-card stat-orange">
            <div class="stat-icon">&#128273;</div>
            <div class="stat-body">
              <div class="stat-value">{{ stats()!.totalRoles }}</div>
              <div class="stat-label">{{ 'ADMIN.SUPER_DASHBOARD.TOTAL_ROLES' | translate }}</div>
            </div>
          </div>
        </div>

        <div class="lower-grid">
          <p-card>
            <ng-template pTemplate="header">
              <div class="card-header-row">
                <i class="pi pi-server"></i>
                <strong class="ml-2">{{ 'ADMIN.SUPER_DASHBOARD.SYSTEM_HEALTH' | translate }}</strong>
                <p-tag value="ONLINE" severity="success" styleClass="ml-auto" />
              </div>
            </ng-template>
            <div class="health-grid">
              <div class="health-item">
                <span class="health-label">{{ 'ADMIN.SUPER_DASHBOARD.LAST_CHECKED' | translate }}</span>
                <span class="health-value">{{ stats()!.systemTime | date:'medium' }}</span>
              </div>
              <div class="health-item">
                <span class="health-label">{{ 'ADMIN.SUPER_DASHBOARD.COMPANIES_RATIO' | translate }}</span>
                <span class="health-value">{{ stats()!.activeCompanies }} / {{ stats()!.totalCompanies }}</span>
              </div>
              <div class="health-item">
                <span class="health-label">{{ 'ADMIN.SUPER_DASHBOARD.USERS_RATIO' | translate }}</span>
                <span class="health-value">{{ stats()!.activeUsers }} / {{ stats()!.totalUsers }}</span>
              </div>
            </div>
          </p-card>

          <p-card>
            <ng-template pTemplate="header">
              <div class="card-header-row">
                <i class="pi pi-bolt"></i>
                <strong class="ml-2">{{ 'ADMIN.SUPER_DASHBOARD.QUICK_ACTIONS' | translate }}</strong>
              </div>
            </ng-template>
            <div class="actions-grid">
              <p-button label="{{ 'ADMIN.COMPANIES.TITLE' | translate }}" icon="pi pi-building" routerLink="/admin/companies" />
              <p-button label="{{ 'ADMIN.USERS.TITLE' | translate }}" icon="pi pi-users" routerLink="/admin/users" severity="secondary" />
              <p-button label="{{ 'ADMIN.PLANS.TITLE' | translate }}" icon="pi pi-list" routerLink="/admin/plans" severity="secondary" />
              <p-button label="{{ 'ADMIN.PAYMENTS.TITLE' | translate }}" icon="pi pi-wallet" routerLink="/admin/payments" severity="secondary" />
              <p-button label="{{ 'AUDIT.TITLE' | translate }}" icon="pi pi-history" routerLink="/audit-logs" severity="secondary" />
            </div>
          </p-card>
        </div>
      }
    </div>
  `,
  styles: [`
    .sa-container { padding: 1.5rem; max-width: 1400px; margin: 0 auto; }
    .page-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:2rem; }
    .header-left { display:flex; align-items:center; gap:1rem; }
    .header-icon { font-size:2.5rem; }
    h1 { margin:0; font-size:1.75rem; font-weight:700; color: var(--app-text-primary, var(--text-color)); }
    .subtitle { margin:.25rem 0 0; color: var(--app-text-secondary, var(--text-color-secondary)); font-size:.9rem; }
    .loading-center { display:flex; justify-content:center; padding:4rem; }
    .stats-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:1.25rem; }
    .stat-card {
      border-radius:12px; padding:1.5rem; display:flex; gap:1rem; align-items:flex-start;
      background: var(--app-card-bg, #ffffff);
      border-top: 1px solid var(--app-card-border, #e2e8f0);
      border-right: 1px solid var(--app-card-border, #e2e8f0);
      border-bottom: 1px solid var(--app-card-border, #e2e8f0);
      border-left: 4px solid transparent;
      box-shadow: var(--app-card-shadow, 0 1px 6px rgba(0,0,0,.08));
      transition: transform .2s, box-shadow .2s, background-color .2s, border-color .2s;
    }
    .stat-card:hover { transform:translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,.12); }
    .stat-blue  { border-left-color: #3b82f6; }
    .stat-green { border-left-color: #22c55e; }
    .stat-purple{ border-left-color: #a855f7; }
    .stat-orange{ border-left-color: #f97316; }
    .stat-icon  { font-size:2rem; margin-top:.25rem; }
    .stat-value { font-size:2.25rem; font-weight:700; line-height:1; color: var(--app-text-primary, #1e293b); }
    .stat-label { font-size:.85rem; color: var(--app-text-secondary, #64748b); margin-top:.25rem; }
    .stat-sub   { margin-top:.5rem; font-size:.8rem; color:#22c55e; font-weight:600; }
    .lower-grid { display:grid; grid-template-columns:1fr 1fr; gap:1.25rem; margin-top:1.25rem; }
    @media(max-width:768px) { .lower-grid { grid-template-columns:1fr; } }
    .card-header-row { display:flex; align-items:center; padding:1rem 1.25rem 0; }
    .ml-2 { margin-left:.5rem; } .ml-auto { margin-left:auto; }
    .health-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:1rem; }
    .health-item { display:flex; flex-direction:column; gap:.25rem; }
    .health-label { font-size:.75rem; color: var(--app-text-muted, #94a3b8); text-transform:uppercase; letter-spacing:.05em; }
    .health-value { font-weight:600; color: var(--app-text-primary, #1e293b); }
    .actions-grid { display:flex; flex-wrap:wrap; gap:.75rem; }
  `]
})
export class SuperAdminDashboardComponent implements OnInit {
  private readonly userMgmtService = inject(UserManagementService);
  private readonly messageService = inject(MessageService);

  readonly stats = signal<SystemStats | null>(null);
  readonly loading = signal(false);

  ngOnInit(): void { this.loadStats(); }

  loadStats(): void {
    this.loading.set(true);
    this.userMgmtService.getSystemStats().subscribe({
      next: (data) => { this.stats.set(data); this.loading.set(false); },
      error: () => {
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load system stats' });
      }
    });
  }
}

