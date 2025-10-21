import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';

type InvoiceStatus = 'PAID' | 'PENDING' | 'OVERDUE';

export interface InvoiceItem {
  id: number;
  name: string;
  price: number;
  category: string;
  status: InvoiceStatus;
}

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [CommonModule, TableModule, ToolbarModule, ButtonModule, ToastModule],
  providers: [MessageService],
  template: `
    <div class="page">
      <p-toolbar styleClass="mb-3">
        <ng-template pTemplate="start">
          <div class="toolbar-title">Manage Invoices</div>
        </ng-template>

        <ng-template pTemplate="end">
          <div class="toolbar-actions">
            <button
              pButton
              type="button"
              label="Export Excel ★ Pro"
              icon="pi pi-file-excel"
              class="p-button-success"
              (click)="onExportClick()"
            ></button>

            <button
              pButton
              type="button"
              label="Logout"
              icon="pi pi-sign-out"
              class="p-button-outlined p-button-secondary"
              (click)="logout()"
            ></button>
          </div>
        </ng-template>
      </p-toolbar>

      <p-table
        [value]="items"
        [paginator]="true"
        [rows]="5"
        [rowsPerPageOptions]="[5, 10, 20]"
      >
        <ng-template pTemplate="header">
          <tr>
            <th style="width: 6rem">ID</th>
            <th>Name</th>
            <th style="width: 10rem">Category</th>
            <th style="width: 10rem">Status</th>
            <th style="width: 10rem; text-align: right">Price</th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-item>
          <tr>
            <td>{{ item.id }}</td>
            <td>{{ item.name }}</td>
            <td>{{ item.category }}</td>
            <td>{{ item.status }}</td>
            <td style="text-align: right">{{ item.price | currency : 'USD' : 'symbol' : '1.2-2' }}</td>
          </tr>
        </ng-template>

        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="5">No invoices found.</td>
          </tr>
        </ng-template>
      </p-table>
    </div>
  `,
  styles: [
    `
      .page {
        padding: 1.25rem;
      }

      .toolbar-title {
        font-size: 1.125rem;
        font-weight: 600;
      }

      .toolbar-actions {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
      }
    `
  ]
})
export class InvoicesComponent implements OnInit {
  items: InvoiceItem[] = [];
  constructor(
    private readonly apiService: ApiService,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.items = [
      { id: 1001, name: 'Laptop', price: 1200, category: 'Electronics', status: 'PAID' },
      { id: 1002, name: 'Mouse', price: 25, category: 'Accessories', status: 'PENDING' },
      { id: 1003, name: 'Keyboard', price: 55, category: 'Accessories', status: 'PAID' },
      { id: 1004, name: 'Monitor', price: 320, category: 'Electronics', status: 'OVERDUE' },
      { id: 1005, name: 'Desk Chair', price: 180, category: 'Office', status: 'PENDING' }
    ];
  }

  onExportClick(): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Not Available',
      detail: 'Excel/CSV Export is not available in this edition.',
      life: 5000
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}
