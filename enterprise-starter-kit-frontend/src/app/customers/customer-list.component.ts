import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

// PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

import { CustomerService, Customer, CustomerRequest } from '../services/customer.service';
import { CustomerFormComponent } from './customer-form.component';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    TagModule,
    TooltipModule,
    IconFieldModule,
    InputIconModule,
    CustomerFormComponent
  ],
  providers: [MessageService, ConfirmationService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p-toast />
    <p-confirmDialog />

    <div class="customers-container">
      <div class="page-header">
        <div class="header-content">
          <h1><i class="pi pi-users"></i> {{ 'CUSTOMERS.TITLE' | translate }}</h1>
          <p class="subtitle">{{ 'CUSTOMERS.SUBTITLE' | translate }}</p>
        </div>
        <p-button
          [label]="'CUSTOMERS.ADD_CUSTOMER' | translate"
          icon="pi pi-plus"
          (onClick)="openNewCustomerDialog()" />
      </div>

      <div class="table-card">
        <div class="table-toolbar">
          <p-iconField iconPosition="left">
            <p-inputIcon styleClass="pi pi-search" />
            <input
              pInputText
              [(ngModel)]="searchQuery"
              [placeholder]="'COMMON.SEARCH' | translate"
              (input)="onSearch()"
              class="search-input" />
          </p-iconField>
        </div>

        <p-table
          [value]="customers"
          [loading]="loading"
          [paginator]="true"
          [rows]="10"
          [totalRecords]="totalRecords"
          [lazy]="true"
          (onLazyLoad)="loadCustomers($event)"
          [rowHover]="true"
          styleClass="p-datatable-sm">

          <ng-template pTemplate="header">
            <tr>
              <th>{{ 'CUSTOMERS.NAME' | translate }}</th>
              <th>{{ 'CUSTOMERS.EMAIL' | translate }}</th>
              <th>{{ 'CUSTOMERS.PHONE' | translate }}</th>
              <th>{{ 'CUSTOMERS.CITY' | translate }}</th>
              <th>{{ 'CUSTOMERS.STATUS' | translate }}</th>
              <th style="width: 150px">{{ 'COMMON.ACTIONS' | translate }}</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-customer>
            <tr>
              <td>
                <div class="customer-name">
                  <strong>{{ customer.name }}</strong>
                  @if (customer.contactPerson) {
                    <small class="contact-person">{{ customer.contactPerson }}</small>
                  }
                </div>
              </td>
              <td>{{ customer.email || '-' }}</td>
              <td>{{ customer.phone || '-' }}</td>
              <td>{{ customer.city || '-' }}</td>
              <td>
                <p-tag
                  [value]="customer.isActive ? ('CUSTOMERS.ACTIVE' | translate) : ('CUSTOMERS.INACTIVE' | translate)"
                  [severity]="customer.isActive ? 'success' : 'danger'" />
              </td>
              <td>
                <div class="action-buttons">
                  <p-button
                    icon="pi pi-pencil"
                    [rounded]="true"
                    [text]="true"
                    pTooltip="{{ 'COMMON.EDIT' | translate }}"
                    (onClick)="editCustomer(customer)" />
                  <p-button
                    icon="pi pi-trash"
                    [rounded]="true"
                    [text]="true"
                    severity="danger"
                    pTooltip="{{ 'COMMON.DELETE' | translate }}"
                    (onClick)="confirmDelete(customer)" />
                </div>
              </td>
            </tr>
          </ng-template>

          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="6" class="text-center">
                {{ 'CUSTOMERS.NO_CUSTOMERS' | translate }}
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <!-- Customer Form Dialog -->
    <p-dialog
      [(visible)]="showDialog"
      [modal]="true"
      [header]="editingCustomer ? ('CUSTOMERS.EDIT_CUSTOMER' | translate) : ('CUSTOMERS.ADD_CUSTOMER' | translate)"
      [style]="{ width: '550px' }"
      [draggable]="false"
      [resizable]="false">
      <app-customer-form
        [customer]="editingCustomer"
        (save)="onSaveCustomer($event)"
        (cancel)="closeDialog()" />
    </p-dialog>
  `,
  styles: [`
    .customers-container {
      padding: 1.5rem;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
    }

    .header-content h1 {
      margin: 0;
      font-size: 1.75rem;
      color: var(--app-text-primary, #1e293b);
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .header-content h1 i {
      color: var(--primary-color);
    }

    .subtitle {
      color: var(--app-text-secondary, #64748b);
      margin: 0.5rem 0 0 0;
    }

    .table-card {
      background: var(--app-card-bg, #ffffff);
      border: 1px solid var(--app-card-border, #e2e8f0);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: var(--app-card-shadow, 0 1px 6px rgba(0,0,0,.08));
    }

    .table-toolbar {
      padding: 1rem;
      border-bottom: 1px solid var(--app-surface-border, #e2e8f0);
    }

    .search-input {
      width: 300px;
    }

    .customer-name {
      display: flex;
      flex-direction: column;
    }

    .contact-person {
      color: var(--app-text-muted, #64748b);
      font-size: 0.8rem;
    }

    .action-buttons {
      display: flex;
      gap: 0.25rem;
    }

    :host ::ng-deep {
      .p-datatable {
        .p-datatable-thead > tr > th {
          background: var(--app-surface-hover, #f1f5f9);
          color: var(--app-text-primary, #1e293b);
          border-color: var(--app-surface-border, #e2e8f0);
        }

        .p-datatable-tbody > tr {
          background: transparent;

          > td {
            border-color: var(--app-surface-border, #e2e8f0);
            color: var(--app-text-primary, #1e293b);
          }

          &:hover {
            background: var(--app-surface-hover, #f1f5f9);
          }
        }
      }
    }
  `]
})
export class CustomerListComponent implements OnInit {
  private customerService = inject(CustomerService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private translate = inject(TranslateService);
  private cd = inject(ChangeDetectorRef);

  customers: Customer[] = [];
  loading = false;
  totalRecords = 0;
  searchQuery = '';
  showDialog = false;
  editingCustomer: Customer | null = null;

  private currentPage = 0;
  private pageSize = 10;

  ngOnInit(): void {
    // Initial load is handled by p-table (lazy) event
  }

  loadCustomers(event: any): void {
    this.currentPage = event.first / event.rows;
    this.pageSize = event.rows;
    this.scheduleLoad();
  }

  loadCustomersData(): void {
    this.loading = true;
    this.cd.markForCheck(); // Update loading state

    const observable = this.searchQuery
      ? this.customerService.searchCustomers(this.searchQuery, this.currentPage, this.pageSize)
      : this.customerService.getCustomers(this.currentPage, this.pageSize);

    observable.subscribe({
      next: (response) => {
        this.customers = response.content;
        this.totalRecords = response.totalElements;
        this.loading = false;
        this.cd.markForCheck(); // Update data
      },
      error: () => {
        this.loading = false;
        this.cd.markForCheck(); // Update error state
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('COMMON.ERROR'),
          detail: this.translate.instant('CUSTOMERS.LOAD_ERROR')
        });
      }
    });
  }

  onSearch(): void {
    this.currentPage = 0;
    this.scheduleLoad();
  }

  openNewCustomerDialog(): void {
    this.editingCustomer = null;
    this.showDialog = true;
  }

  editCustomer(customer: Customer): void {
    this.editingCustomer = { ...customer };
    this.showDialog = true;
  }

  closeDialog(): void {
    this.showDialog = false;
    this.editingCustomer = null;
  }

  onSaveCustomer(request: CustomerRequest): void {
    if (this.editingCustomer) {
      this.customerService.updateCustomer(this.editingCustomer.id, request).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: this.translate.instant('COMMON.SUCCESS'),
            detail: this.translate.instant('CUSTOMERS.UPDATE_SUCCESS')
          });
          this.closeDialog();
          this.loadCustomersData();
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('COMMON.ERROR'),
            detail: err.error?.message || this.translate.instant('CUSTOMERS.UPDATE_ERROR')
          });
        }
      });
    } else {
      this.customerService.createCustomer(request).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: this.translate.instant('COMMON.SUCCESS'),
            detail: this.translate.instant('CUSTOMERS.CREATE_SUCCESS')
          });
          this.closeDialog();
          this.loadCustomersData();
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('COMMON.ERROR'),
            detail: err.error?.message || this.translate.instant('CUSTOMERS.CREATE_ERROR')
          });
        }
      });
    }
  }

  confirmDelete(customer: Customer): void {
    this.confirmationService.confirm({
      message: this.translate.instant('CUSTOMERS.DELETE_CONFIRM', { name: customer.name }),
      header: this.translate.instant('COMMON.CONFIRM'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.customerService.deleteCustomer(customer.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: this.translate.instant('COMMON.SUCCESS'),
              detail: this.translate.instant('CUSTOMERS.DELETE_SUCCESS')
            });
            this.loadCustomersData();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: this.translate.instant('COMMON.ERROR'),
              detail: this.translate.instant('CUSTOMERS.DELETE_ERROR')
            });
          }
        });
      }
    });
  }

  private scheduleLoad(): void {
    setTimeout(() => this.loadCustomersData(), 0);
  }
}
