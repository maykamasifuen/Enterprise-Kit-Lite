import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

/**
 * Example Sidebar/Menu Component demonstrating translation pipe usage
 * This shows how to use the | translate pipe with ngx-translate
 */
@Component({
  selector: 'app-sidebar-example',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterModule, CardModule, ButtonModule],
  template: `
    <div class="sidebar">
      <p-card>
        <div class="sidebar-header">
          <h3>{{ 'COMMON.APP_NAME' | translate }}</h3>
        </div>

        <nav class="sidebar-nav">
          <!-- Dashboard -->
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
            <i class="pi pi-home"></i>
            <span>{{ 'SIDEBAR.DASHBOARD' | translate }}</span>
          </a>

          <!-- Invoices -->
          <a routerLink="/invoices" routerLinkActive="active" class="nav-item">
            <i class="pi pi-receipt"></i>
            <span>{{ 'SIDEBAR.INVOICES' | translate }}</span>
          </a>

          <!-- Reports -->
          <a routerLink="/reports" routerLinkActive="active" class="nav-item">
            <i class="pi pi-chart-bar"></i>
            <span>{{ 'SIDEBAR.REPORTS' | translate }}</span>
          </a>

          <!-- Settings -->
          <a routerLink="/settings" routerLinkActive="active" class="nav-item">
            <i class="pi pi-cog"></i>
            <span>{{ 'SIDEBAR.SETTINGS' | translate }}</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <button pButton type="button" class="p-button-text w-full">
            <i class="pi pi-sign-out"></i>
            <span>{{ 'NAVBAR.LOGOUT' | translate }}</span>
          </button>
        </div>
      </p-card>
    </div>
  `,
  styles: [`
    .sidebar {
      width: 250px;
      height: 100vh;
      background: var(--surface-card);
      border-right: 1px solid var(--surface-border);
    }

    .sidebar-header {
      padding: 1rem;
      border-bottom: 1px solid var(--surface-border);
    }

    .sidebar-header h3 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
    }

    .sidebar-nav {
      display: flex;
      flex-direction: column;
      padding: 0.5rem 0;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.875rem 1.25rem;
      color: var(--text-color);
      text-decoration: none;
      transition: all 0.2s;
      border-left: 3px solid transparent;
    }

    .nav-item:hover {
      background: var(--surface-hover);
      color: var(--primary-color);
    }

    .nav-item.active {
      background: var(--primary-color-text);
      color: var(--primary-color);
      border-left-color: var(--primary-color);
    }

    .nav-item i {
      font-size: 1.1rem;
    }

    .sidebar-footer {
      padding: 1rem;
      border-top: 1px solid var(--surface-border);
      margin-top: auto;
    }

    /* RTL Support */
    body.rtl-mode .sidebar {
      border-right: none;
      border-left: 1px solid var(--surface-border);
    }

    body.rtl-mode .nav-item {
      border-left: none;
      border-right: 3px solid transparent;
    }

    body.rtl-mode .nav-item.active {
      border-right-color: var(--primary-color);
    }
  `]
})
export class SidebarExampleComponent {}
