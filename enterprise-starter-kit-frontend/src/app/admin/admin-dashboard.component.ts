import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { UserManagementService, ManagedUser } from '../services/user-management.service';
import { DashboardService, DashboardStats } from '../services/dashboard.service';
import { RoleBadgeComponent } from '../components/role-badge/role-badge.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterModule, TranslateModule,
    CardModule, ButtonModule, TagModule, TableModule,
    ProgressSpinnerModule, ToastModule, RoleBadgeComponent
  ],
  providers: [MessageService],
  template: `
    <p-toast />
    <div class="admin-dash-container">
      <div class="page-header">
        <div class="header-left">
          <span class="header-icon">&#128737;</span>
          <div>
            <h1>{{ 'ADMIN.ADMIN_DASHBOARD.TITLE' | translate }}</h1>
            <p class="subtitle">{{ 'ADMIN.ADMIN_DASHBOARD.SUBTITLE' | translate }}</p>
          </div>
        </div>
        <p-button icon="pi pi-refresh" [rounded]="true" [text]="true" (onClick)="loadAll()" [loading]="loading()" />
      </div>

      @if (loading()) {
        <div class="loading-center"><p-progressSpinner strokeWidth="4" /></div>
      }

      @if (!loading()) {
        <!-- Stats Row -->
        <div class="stats-row">
          <div class="stat-card stat-blue">
            <i class="pi pi-users stat-ico"></i>
            <div>
              <div class="stat-value">{{ tenantUsers().length }}</div>
              <div class="stat-label">{{ 'ADMIN.ADMIN_DASHBOARD.TENANT_USERS' | translate }}</div>
            </div>
          </div>
          <div class="stat-card stat-green">
            <i class="pi pi-receipt stat-ico"></i>
            <div>
              <div class="stat-value">{{ dashStats()?.totalInvoices ?? 0 }}</div>
              <div class="stat-label">{{ 'ADMIN.ADMIN_DASHBOARD.TOTAL_INVOICES' | translate }}</div>
            </div>
          </div>
          <div class="stat-card stat-purple">
            <i class="pi pi-check-circle stat-ico"></i>
            <div>
              <div class="stat-value">{{ dashStats()?.paidCount ?? 0 }}</div>
              <div class="stat-label">{{ 'ADMIN.ADMIN_DASHBOARD.PAID_INVOICES' | translate }}</div>
            </div>
          </div>
          <div class="stat-card stat-orange">
            <i class="pi pi-exclamation-circle stat-ico"></i>
            <div>
              <div class="stat-value">{{ dashStats()?.overdueCount ?? 0 }}</div>
              <div class="stat-label">{{ 'ADMIN.ADMIN_DASHBOARD.OVERDUE_INVOICES' | translate }}</div>
            </div>
          </div>
        </div>

        <!-- Users + Quick Actions -->
        <div class="lower-grid">
          <p-card>
            <ng-template pTemplate="header">
              <div class="card-header-row">
                <i class="pi pi-users"></i>
                <strong class="ml-2">{{ 'ADMIN.ADMIN_DASHBOARD.RECENT_USERS' | translate }}</strong>
                <p-button [label]="'ADMIN.USERS.TITLE' | translate" icon="pi pi-arrow-right"
                  routerLink="/admin/users" [text]="true" size="small" styleClass="ml-auto" />
              </div>
            </ng-template>
            <p-table [value]="tenantUsers().slice(0, 5)" styleClass="p-datatable-sm">
              <ng-template pTemplate="header">
                <tr>
                  <th>{{ 'ADMIN.USERS.USERNAME' | translate }}</th>
                  <th>{{ 'ADMIN.USERS.EMAIL' | translate }}</th>
                  <th>{{ 'ADMIN.USERS.ROLES' | translate }}</th>
                  <th>{{ 'ADMIN.USERS.STATUS' | translate }}</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-user>
                <tr>
                  <td><strong>{{ user.username }}</strong></td>
                  <td>{{ user.email }}</td>
                  <td>
                    @for (role of user.roles; track role) {
                      <app-role-badge [role]="role" class="mr-1" />
                    }
                  </td>
                  <td>
                    <p-tag
                      [value]="user.isEnabled ? ('ADMIN.USERS.ENABLED' | translate) : ('ADMIN.USERS.DISABLED' | translate)"
                      [severity]="user.isEnabled ? 'success' : 'danger'" />
                  </td>
                </tr>
              </ng-template>
              <ng-template pTemplate="emptymessage">
                <tr><td colspan="4" class="text-center">{{ 'ADMIN.USERS.NO_USERS' | translate }}</td></tr>
              </ng-template>
            </p-table>
          </p-card>

          <p-card>
            <ng-template pTemplate="header">
              <div class="card-header-row">
                <i class="pi pi-bolt"></i>
                <strong class="ml-2">{{ 'ADMIN.ADMIN_DASHBOARD.QUICK_ACTIONS' | translate }}</strong>
              </div>
            </ng-template>
            <div class="actions-grid">
              <p-button [label]="'ADMIN.USERS.ADD_USER' | translate" icon="pi pi-user-plus" routerLink="/admin/users" />
              <p-button [label]="'INVOICES.CREATE_INVOICE' | translate" icon="pi pi-plus" routerLink="/invoices" severity="secondary" />
              <p-button [label]="'NAVBAR.CUSTOMERS' | translate" icon="pi pi-users" routerLink="/customers" severity="secondary" />
              <p-button [label]="'AUDIT.TITLE' | translate" icon="pi pi-history" routerLink="/audit-logs" severity="secondary" />
              <p-button [label]="'NAVBAR.REPORTS' | translate" icon="pi pi-chart-bar" routerLink="/reports" severity="secondary" />
              <p-button [label]="'SETTINGS.TITLE' | translate" icon="pi pi-cog" routerLink="/settings" severity="secondary" />
            </div>
          </p-card>
        </div>
      }
    </div>
  `,
  styles: [`
    .admin-dash-container { padding: 1.5rem; max-width: 1400px; margin: 0 auto; box-sizing:border-box; width:100%; }
    @media(max-width:768px) { .admin-dash-container { padding:1rem 0.75rem; } }
    @media(max-width:480px) { .admin-dash-container { padding:0.75rem 0.5rem; } }
    .page-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:2rem; flex-wrap:wrap; gap:.75rem; }
    .header-left { display:flex; align-items:center; gap:1rem; }
    .header-icon { font-size:2.5rem; }
    h1 { margin:0; font-size:1.75rem; font-weight:700; color: var(--text-color); }
    @media(max-width:576px) { h1 { font-size:1.3rem; } .header-icon { font-size:1.75rem; } }
    .subtitle { margin:.25rem 0 0; opacity:.7; font-size:.9rem; color: var(--text-color-secondary); }
    .loading-center { display:flex; justify-content:center; padding:4rem; }
    .stats-row { display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:1rem; margin-bottom:1.25rem; }
    @media(max-width:480px) { .stats-row { grid-template-columns:1fr 1fr; gap:.75rem; } }
    .stat-card {
      border-radius:12px; padding:1.25rem 1.5rem; display:flex; gap:1rem; align-items:center;
      border-left:4px solid transparent; background:var(--surface-card);
      box-shadow:0 2px 8px rgba(0,0,0,.15);
      color: var(--text-color);
    }
    .stat-blue { border-left-color:#3b82f6; }
    .stat-green { border-left-color:#22c55e; }
    .stat-purple { border-left-color:#a855f7; }
    .stat-orange { border-left-color:#f97316; }
    .stat-ico { font-size:2rem; opacity:.5; }
    .stat-value { font-size:2rem; font-weight:700; line-height:1; color: var(--text-color); }
    @media(max-width:480px) { .stat-value { font-size:1.5rem; } }
    .stat-label { font-size:.8rem; opacity:.75; margin-top:.2rem; color: var(--text-color-secondary); }
    .lower-grid { display:grid; grid-template-columns:3fr 2fr; gap:1.25rem; }
    @media(max-width:900px) { .lower-grid { grid-template-columns:1fr; } }
    .card-header-row { display:flex; align-items:center; padding:1rem 1.25rem 0; }
    .ml-2 { margin-left:.5rem; } .ml-auto { margin-left:auto; } .mr-1 { margin-right:.25rem; }
    .actions-grid { display:flex; flex-direction:column; gap:.75rem; }
    .text-center { text-align:center; }
  `]
})
export class AdminDashboardComponent implements OnInit {
  private readonly userMgmtService = inject(UserManagementService);
  private readonly dashboardService = inject(DashboardService);
  private readonly messageService = inject(MessageService);

  readonly tenantUsers = signal<ManagedUser[]>([]);
  readonly dashStats = signal<DashboardStats | null>(null);
  readonly loading = signal(true);

  ngOnInit(): void { this.loadAll(); }

  loadAll(): void {
    this.loading.set(true);
    let pending = 2;
    const done = () => { if (--pending === 0) this.loading.set(false); };

    this.userMgmtService.getUsers().subscribe({
      next: (users) => { this.tenantUsers.set(users ?? []); done(); },
      error: () => {
        this.tenantUsers.set([]);
        done();
        this.messageService.add({ severity: 'warn', summary: 'Users', detail: 'Could not load users' });
      }
    });

    this.dashboardService.getStats().subscribe({
      next: (s) => { this.dashStats.set(s); done(); },
      error: () => { this.dashStats.set(null); done(); }
    });
  }
}


