import { Component, OnInit, ViewChild, signal, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { FileUploadModule, FileUpload, FileSelectEvent } from 'primeng/fileupload';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';

import { Subject, finalize, take } from 'rxjs';
import { Router } from '@angular/router';

import { ApiService } from '../services/api.service';
import { Invoice, InvoiceCreateRequest, InvoiceUpdateRequest, InvoiceStatus } from './invoice.model';
import { InvoiceService } from './invoice.service';
import { CustomerService, Customer } from '../services/customer.service';
import { DashboardService } from '../services/dashboard.service';
import { StatusTranslatePipe } from '../pipes/status-translate.pipe';
import { LocalizedNumberPipe } from '../pipes/localized-number.pipe';

type UiTagSeverity = 'success' | 'warn' | 'danger' | 'info' | 'secondary' | 'contrast';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    TableModule,
    ToolbarModule,
    ButtonModule,
    TagModule,
    DialogModule,
    FileUploadModule,
    ConfirmDialogModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    DatePickerModule,
    CheckboxModule,
    ToastModule,
    StatusTranslatePipe,
    LocalizedNumberPipe
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast />
    <div class="page">
      <p-toolbar styleClass="mb-3">
        <ng-template pTemplate="start">
          <div class="toolbar-title">{{ 'INVOICES.TITLE' | translate }}</div>
        </ng-template>

        <ng-template pTemplate="end">
          <div class="toolbar-actions">
            <button
              pButton
              type="button"
              [label]="'INVOICES.CREATE_INVOICE' | translate"
              icon="pi pi-plus"
              class="p-button-primary"
              (click)="openCreateDialog()"
              [disabled]="tableLoading() || exportInProgress() || importUploading()"
            ></button>

            <button
              *ngIf="selectedInvoices.length > 0"
              pButton
              type="button"
              [label]="('INVOICES.BULK_DELETE' | translate) + ' (' + selectedInvoices.length + ')'"
              icon="pi pi-trash"
              class="p-button-danger"
              [loading]="bulkDeleteInProgress()"
              (click)="bulkDeleteInvoices()"
            ></button>

            <button
              *ngIf="selectedInvoices.length > 0"
              pButton
              type="button"
              [label]="'INVOICES.BULK_STATUS' | translate"
              icon="pi pi-sync"
              class="p-button-warning"
              (click)="openBulkStatusDialog()"
            ></button>

            <button
              pButton
              type="button"
              [label]="'COMMON.REFRESH' | translate"
              icon="pi pi-refresh"
              class="p-button-text"
              (click)="refresh()"
              [disabled]="tableLoading() || exportInProgress() || importUploading()"
            ></button>

            <button
              pButton
              type="button"
              [label]="'INVOICES.IMPORT' | translate"
              icon="pi pi-upload"
              class="p-button-outlined"
              (click)="openImportDialog()"
              [disabled]="tableLoading() || exportInProgress() || importUploading()"
            ></button>

            <button
              pButton
              type="button"
              [label]="'INVOICES.EXPORT' | translate"
              icon="pi pi-file-excel"
              class="p-button-success"
              [loading]="exportLoadingEn()"
              [disabled]="exportInProgress() || importUploading()"
              (click)="onExportClick()"
            ></button>
          </div>
        </ng-template>
      </p-toolbar>

      <!-- ── Server-side Filter Bar ─────────────────────────────────── -->
      <div class="filter-bar" [class.filter-bar--open]="filterExpanded">
        <div class="filter-bar__toggle" (click)="filterExpanded = !filterExpanded">
          <i class="pi" [class.pi-filter]="!filterExpanded" [class.pi-filter-slash]="filterExpanded"></i>
          <span>{{ 'INVOICES.SEARCH_PLACEHOLDER' | translate }}</span>
          @if (hasActiveFilters()) {
            <span class="filter-badge">{{ 'INVOICES.STATUS' | translate }}: {{ filterStatus }}</span>
          }
          <i class="pi pi-chevron-down filter-chevron" [class.rotated]="filterExpanded"></i>
        </div>
        @if (filterExpanded) {
          <div class="filter-body">
            <div class="filter-field">
              <label>{{ 'INVOICES.CLIENT_NAME' | translate }}</label>
              <input pInputText [(ngModel)]="filterQ" (input)="onFilterChange()"
                [placeholder]="'INVOICES.SEARCH_PLACEHOLDER' | translate" />
            </div>
            <div class="filter-field">
              <label>{{ 'INVOICES.STATUS' | translate }}</label>
              <p-select [(ngModel)]="filterStatus" [options]="statusFilterOptions"
                optionLabel="label" optionValue="value" [showClear]="true"
                [placeholder]="'INVOICES.STATUS' | translate"
                (onChange)="onFilterChange()" />
            </div>
            <div class="filter-field">
              <label>{{ 'DASHBOARD.DATE_FROM' | translate }}</label>
              <p-datePicker [(ngModel)]="filterFrom" (ngModelChange)="onFilterChange()"
                dateFormat="yy-mm-dd" [showIcon]="true" />
            </div>
            <div class="filter-field">
              <label>{{ 'DASHBOARD.DATE_TO' | translate }}</label>
              <p-datePicker [(ngModel)]="filterTo" (ngModelChange)="onFilterChange()"
                dateFormat="yy-mm-dd" [showIcon]="true" />
            </div>
            <div class="filter-actions">
              <p-button label="{{ 'COMMON.SEARCH' | translate }}" icon="pi pi-search" (onClick)="applyServerFilter()" />
              <p-button label="{{ 'DASHBOARD.CLEAR_FILTER' | translate }}" icon="pi pi-times"
                severity="secondary" (onClick)="clearFilters()" />
            </div>
          </div>
        }
      </div>

      <p-table
        [value]="invoices()"
        [loading]="tableLoading()"
        [paginator]="true"
        [rows]="10"
        [rowsPerPageOptions]="[10, 20, 50]"
        selectionMode="multiple"
        [(selection)]="selectedInvoices"
        dataKey="id"
      >
        <ng-template pTemplate="header">
          <tr>
            <th style="width: 3rem"><p-tableHeaderCheckbox /></th>
            <th style="width: 6rem">{{ 'INVOICES.ID' | translate }}</th>
            <th>{{ 'INVOICES.CLIENT_NAME' | translate }}</th>
            <th style="width: 12rem; text-align: right">{{ 'INVOICES.AMOUNT' | translate }}</th>
            <th style="width: 14rem">{{ 'INVOICES.DUE_DATE' | translate }}</th>
            <th style="width: 10rem">{{ 'INVOICES.STATUS' | translate }}</th>
            <th style="width: 10rem">{{ 'COMMON.ACTIONS' | translate }}</th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-invoice>
          <tr>
            <td><p-tableCheckbox [value]="invoice" /></td>
            <td>{{ invoice.id | localizedNumber }}</td>
            <td>{{ invoice.clientName }}</td>
            <td style="text-align: right">{{ invoice.amount | currency }}</td>
            <td>{{ invoice.dueDate | date : 'mediumDate' }}</td>
            <td>
              <p-tag [value]="invoice.status | statusTranslate" [severity]="statusSeverity(invoice.status)"></p-tag>
            </td>
            <td>
              <div class="action-buttons">
                <button
                  pButton
                  type="button"
                  icon="pi pi-eye"
                  class="p-button-text p-button-info"
                  (click)="viewInvoice(invoice)"
                  [disabled]="tableLoading()"
                  [title]="'INVOICES.VIEW' | translate"
                ></button>
                <button
                  pButton
                  type="button"
                  icon="pi pi-pencil"
                  class="p-button-text p-button-warning"
                  (click)="editInvoice(invoice)"
                  [disabled]="tableLoading()"
                  [title]="'COMMON.EDIT' | translate"
                ></button>
                <button
                  pButton
                  type="button"
                  icon="pi pi-trash"
                  class="p-button-text p-button-danger"
                  (click)="confirmDelete(invoice)"
                  [disabled]="tableLoading()"
                  [title]="'COMMON.DELETE' | translate"
                ></button>
              </div>
            </td>
          </tr>
        </ng-template>

        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="6">{{ 'INVOICES.NO_INVOICES' | translate }}</td>
          </tr>
        </ng-template>
      </p-table>

      <p-dialog
        [header]="'INVOICES.CREATE_INVOICE' | translate"
        [(visible)]="createDialogVisible"
        [modal]="true"
        [draggable]="false"
        [resizable]="false"
        [dismissableMask]="true"
        [style]="{ width: 'min(560px, 95vw)' }"
      >
        <ng-template pTemplate="content">
          <div class="form-grid">
          <label>{{ 'INVOICES.CLIENT_NAME' | translate }}</label>
          <p-select
            [options]="customers()"
            optionLabel="name"
            [filter]="true"
            filterBy="name"
            [showClear]="true"
            [placeholder]="'INVOICES.SELECT_CUSTOMER' | translate"
            [(ngModel)]="selectedCustomerForCreate"
            (ngModelChange)="onCustomerSelect($event)"
            appendTo="body"
          ></p-select>

          <label>{{ 'INVOICES.AMOUNT' | translate }}</label>
          <p-inputNumber
            [(ngModel)]="createModel().amount"
            (ngModelChange)="onCreateModelChange('amount', $event)"
            mode="decimal"
            [minFractionDigits]="2"
            [maxFractionDigits]="2"
          ></p-inputNumber>

          <label>{{ 'INVOICES.STATUS' | translate }}</label>
          <p-select
            [options]="statusOptions"
            optionLabel="label"
            optionValue="value"
            [(ngModel)]="createModel().status"
            (ngModelChange)="onCreateModelChange('status', $event)"
            appendTo="body"
          ></p-select>

          <label>{{ 'INVOICES.DUE_DATE' | translate }}</label>
          <p-datePicker
            [(ngModel)]="createDueDate"
            (ngModelChange)="onCreateDueDateChange($event)"
            [showIcon]="true"
            dateFormat="yy-mm-dd"
          ></p-datePicker>

          <button pButton type="button" [label]="'COMMON.CANCEL' | translate" class="p-button-text" (click)="closeCreateDialog()"></button>
          <button
            pButton
            type="button"
            [label]="'COMMON.CREATE' | translate"
            icon="pi pi-check"
            (click)="createInvoice()"
            [disabled]="createInFlight()"
            [loading]="createInFlight()"
          ></button>
          </div>
        </ng-template>
      </p-dialog>

      <!-- View Invoice Dialog -->
      <p-dialog
        [header]="'INVOICES.INVOICE_DETAILS' | translate"
        [(visible)]="viewDialogVisible"
        [modal]="true"
        [draggable]="false"
        [resizable]="false"
        [dismissableMask]="true"
        [style]="{ width: 'min(600px, 95vw)' }"
      >
        <div class="view-grid" *ngIf="selectedInvoice()">
          <div class="view-row">
            <span class="view-label">{{ 'INVOICES.ID' | translate }}</span>
            <span class="view-value">#{{ selectedInvoice()!.id | localizedNumber }}</span>
          </div>
          <div class="view-row">
            <span class="view-label">{{ 'INVOICES.CLIENT_NAME' | translate }}</span>
            <span class="view-value">{{ selectedInvoice()!.clientName }}</span>
          </div>
          <div class="view-row">
            <span class="view-label">{{ 'INVOICES.AMOUNT' | translate }}</span>
            <span class="view-value amount">{{ selectedInvoice()!.amount | currency }}</span>
          </div>
          <div class="view-row">
            <span class="view-label">{{ 'INVOICES.STATUS' | translate }}</span>
            <span class="view-value">
              <p-tag [value]="selectedInvoice()!.status | statusTranslate" [severity]="statusSeverity(selectedInvoice()!.status)"></p-tag>
            </span>
          </div>
          <div class="view-row">
            <span class="view-label">{{ 'INVOICES.INVOICE_DATE' | translate }}</span>
            <span class="view-value">{{ selectedInvoice()!.invoiceDate | date : 'mediumDate' }}</span>
          </div>
          <div class="view-row">
            <span class="view-label">{{ 'INVOICES.DUE_DATE' | translate }}</span>
            <span class="view-value">{{ selectedInvoice()!.dueDate | date : 'mediumDate' }}</span>
          </div>
          <div class="view-row" *ngIf="selectedInvoice()!.createdAt">
            <span class="view-label">{{ 'INVOICES.CREATED_AT' | translate }}</span>
            <span class="view-value">{{ selectedInvoice()!.createdAt | date : 'medium' }}</span>
          </div>
          <div class="view-row" *ngIf="selectedInvoice()!.updatedAt">
            <span class="view-label">{{ 'INVOICES.UPDATED_AT' | translate }}</span>
            <span class="view-value">{{ selectedInvoice()!.updatedAt | date : 'medium' }}</span>
          </div>

          <!-- Attachments — Pro/Agency upsell -->
          <div style="margin-top:1rem">
            <div style="font-weight:600;margin-bottom:.5rem">{{ 'INVOICES.ATTACHMENTS' | translate }}</div>
            <button pButton type="button" icon="pi pi-lock"
              label="Unlock Cloud File Storage & Attachments in the Pro Version 🚀"
              class="p-button-outlined p-button-sm" style="width:100%"
              (click)="openAttachmentPaywall()"></button>
          </div>
        </div>

        <ng-template pTemplate="footer">
          <button pButton type="button" [label]="'COMMON.EDIT' | translate" icon="pi pi-pencil" class="p-button-warning" (click)="editFromView()"></button>
          <button pButton type="button" [label]="'COMMON.CLOSE' | translate" class="p-button-text" (click)="closeViewDialog()"></button>
        </ng-template>
      </p-dialog>

      <!-- Edit Invoice Dialog -->
      <p-dialog
        [header]="'INVOICES.EDIT_INVOICE' | translate"
        [(visible)]="editDialogVisible"
        [modal]="true"
        [draggable]="false"
        [resizable]="false"
        [dismissableMask]="true"
        [style]="{ width: 'min(560px, 95vw)' }"
      >
        <ng-template pTemplate="content">
          <div class="form-grid">
          <label>{{ 'INVOICES.ID' | translate }}</label>
          <span class="readonly-field">#{{ editModel().id | localizedNumber }}</span>

          <label>{{ 'INVOICES.CLIENT_NAME' | translate }}</label>
          <p-select
            [options]="customers()"
            optionLabel="name"
            [filter]="true"
            filterBy="name"
            [showClear]="true"
            [placeholder]="'INVOICES.SELECT_CUSTOMER' | translate"
            [(ngModel)]="selectedCustomerForEdit"
            (ngModelChange)="onEditCustomerSelect($event)"
            appendTo="body"
          ></p-select>

          <label>{{ 'INVOICES.AMOUNT' | translate }}</label>
          <p-inputNumber
            [(ngModel)]="editModel().amount"
            (ngModelChange)="onEditModelChange('amount', $event)"
            mode="decimal"
            [minFractionDigits]="2"
            [maxFractionDigits]="2"
          ></p-inputNumber>

          <label>{{ 'INVOICES.STATUS' | translate }}</label>
          <p-select
            [options]="statusOptions"
            optionLabel="label"
            optionValue="value"
            [(ngModel)]="editModel().status"
            (ngModelChange)="onEditModelChange('status', $event)"
            appendTo="body"
          ></p-select>

          <label>{{ 'INVOICES.DUE_DATE' | translate }}</label>
          <p-datePicker
            [(ngModel)]="editDueDate"
            (ngModelChange)="onEditDueDateChange($event)"
            [showIcon]="true"
            dateFormat="yy-mm-dd"
            appendTo="body"
          ></p-datePicker>

          <button pButton type="button" [label]="'COMMON.CANCEL' | translate" class="p-button-text" (click)="closeEditDialog()"></button>
          <button
            pButton
            type="button"
            [label]="'COMMON.SAVE' | translate"
            icon="pi pi-check"
            (click)="saveInvoice()"
            [disabled]="editInFlight()"
            [loading]="editInFlight()"
          ></button>
          </div>
        </ng-template>
      </p-dialog>

      <p-dialog
        [header]="'INVOICES.IMPORT_DIALOG.TITLE' | translate"
        [(visible)]="importDialogVisible"
        [modal]="true"
        [draggable]="false"
        [resizable]="false"
        [dismissableMask]="true"
        [style]="{ width: 'min(560px, 95vw)' }"
      >
        <div class="import-surface">
          <div class="import-title">{{ 'INVOICES.IMPORT_DIALOG.SUBTITLE' | translate }}</div>
          <div class="import-subtitle">
            {{ 'INVOICES.IMPORT_DIALOG.INSTRUCTIONS' | translate }}
          </div>

          <p-fileUpload
            mode="basic"
            name="file"
            accept=".xlsx"
            [chooseLabel]="'INVOICES.IMPORT_DIALOG.CHOOSE_FILE' | translate"
            chooseIcon="pi pi-file-excel"
            [auto]="false"
            [customUpload]="true"
            [disabled]="importUploading()"
            [styleClass]="'p-button p-button-rounded p-button-secondary'"
            (onSelect)="onImportFileSelect($event)"
            (onClear)="clearSelectedImportFile()"
            (onRemove)="clearSelectedImportFile()"
          ></p-fileUpload>

          <div *ngIf="selectedImportFileName()" class="import-selected">
            <i class="pi pi-file-excel"></i>
            <span>{{ selectedImportFileName() }}</span>
            <button
              pButton
              type="button"
              class="p-button-text p-button-sm"
              icon="pi pi-times"
              (click)="clearSelectedImportFile()"
              [disabled]="importUploading()"
            ></button>
          </div>

          <div *ngIf="importUploading()" class="import-progress">
            <i class="pi pi-spin pi-spinner"></i>
            <span>{{ 'INVOICES.IMPORT_DIALOG.UPLOADING' | translate }}</span>
          </div>
        </div>

        <ng-template pTemplate="footer">
          <button
            pButton
            type="button"
            [label]="'COMMON.CANCEL' | translate"
            class="p-button-text"
            (click)="closeImportDialog()"
            [disabled]="importUploading()"
          ></button>

          <button
            pButton
            type="button"
            [label]="'INVOICES.IMPORT' | translate"
            icon="pi pi-cloud-upload"
            class="p-button-primary"
            (click)="confirmImport()"
            [disabled]="!selectedImportFile() || importUploading()"
            [loading]="importUploading()"
          ></button>
        </ng-template>
      </p-dialog>

      <!-- Bulk Status Dialog -->
      <p-dialog
        [header]="'INVOICES.BULK_STATUS' | translate"
        [(visible)]="bulkStatusDialogVisible"
        [modal]="true"
        [draggable]="false"
        [resizable]="false"
        [style]="{ width: 'min(400px, 95vw)' }"
      >
        <div class="form-grid" style="margin-top:.5rem">
          <label>{{ 'INVOICES.STATUS' | translate }}</label>
          <p-select
            [options]="statusOptions"
            optionLabel="label"
            optionValue="value"
            [(ngModel)]="bulkStatusValue"
            appendTo="body"
          ></p-select>
        </div>
        <ng-template pTemplate="footer">
          <button pButton type="button" [label]="'COMMON.CANCEL' | translate" class="p-button-text" (click)="bulkStatusDialogVisible = false"></button>
          <button pButton type="button" [label]="'COMMON.CONFIRM' | translate" icon="pi pi-check"
            [loading]="bulkStatusInProgress()" (click)="applyBulkStatus()"></button>
        </ng-template>
      </p-dialog>

      <p-confirmDialog></p-confirmDialog>
    </div>
  `,
  styles: [
    `
      .page {
        padding: 1.25rem;
        width: 100%;
        box-sizing: border-box;
      }

      @media (max-width: 768px) {
        .page { padding: 1rem 0.75rem; }
      }

      @media (max-width: 480px) {
        .page { padding: 0.75rem 0.5rem; }
      }

      .toolbar-title {
        font-size: 1.125rem;
        font-weight: 600;
      }

      .toolbar-actions {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
        align-items: center;
      }

      .form-grid {
        display: grid;
        grid-template-columns: 130px 1fr;
        gap: 0.75rem;
        align-items: center;
        padding: 0.25rem 0;
      }

      .import-surface {
        display: grid;
        gap: 0.75rem;
        padding: 0.25rem 0;
      }

      .import-title {
        font-size: 1rem;
        font-weight: 700;
      }

      .import-subtitle {
        opacity: 0.85;
        line-height: 1.4;
      }

      .import-progress {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        opacity: 0.9;
      }

      .import-selected {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem;
        border: 1px solid var(--app-surface-border, #e2e8f0);
        border-radius: 10px;
        background: var(--app-card-bg, #ffffff);
      }

      .import-selected span {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .action-buttons {
        display: flex;
        gap: 0.25rem;
        justify-content: center;
      }

      .view-grid {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 0.5rem 0;
      }

      .view-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem 1rem;
        background: var(--surface-ground);
        border-radius: 8px;
      }

      .view-label {
        font-weight: 600;
        color: var(--app-text-secondary, #64748b);
      }

      .view-value {
        font-weight: 500;
      }

      .view-value.amount {
        font-size: 1.1rem;
        color: var(--primary-color);
        font-weight: 700;
      }

      .readonly-field {
        font-weight: 600;
        color: var(--app-text-secondary, #64748b);
      }



      /* ── Filter Bar ─────────────────────────── */
      .filter-bar {
        border: 1px solid var(--app-surface-border, #e2e8f0);
        border-radius: 8px;
        margin-bottom: 1rem;
        overflow: hidden;
        background: var(--app-card-bg, #ffffff);
      }
      .filter-bar__toggle {
        display: flex;
        align-items: center;
        gap: .6rem;
        padding: .75rem 1rem;
        cursor: pointer;
        font-weight: 500;
        user-select: none;
      }
      .filter-bar__toggle:hover { background: var(--app-surface-hover, #f1f5f9); }
      .filter-chevron { margin-left: auto; transition: transform .2s; }
      .filter-chevron.rotated { transform: rotate(180deg); }
      .filter-badge {
        font-size: .75rem;
        background: var(--primary-color);
        color: #fff;
        border-radius: 99px;
        padding: .1rem .55rem;
      }
      .filter-body {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        padding: 1rem;
        border-top: 1px solid var(--app-surface-border, #e2e8f0);
      }
      .filter-field {
        display: flex;
        flex-direction: column;
        gap: .35rem;
        min-width: 180px;
        flex: 1;
      }
      .filter-field label { font-size: .85rem; font-weight: 500; }
      .filter-actions {
        display: flex;
        align-items: flex-end;
        gap: .5rem;
      }
    `
  ]
})
export class InvoiceListComponent implements OnInit, OnDestroy {
  readonly invoices = signal<Invoice[]>([]);
  readonly customers = signal<Customer[]>([]);
  readonly tableLoading = signal(false);
  selectedInvoices: Invoice[] = [];
  readonly bulkDeleteInProgress = signal(false);

  readonly exportLoadingEn = signal(false);
  readonly importDialogVisible = signal(false);
  readonly importUploading = signal(false);

  readonly selectedImportFile = signal<File | null>(null);
  readonly selectedImportFileName = signal<string | null>(null);
  private beforeImportCount: number | null = null;

  readonly createDialogVisible = signal(false);
  readonly createInFlight = signal(false);

  readonly viewDialogVisible = signal(false);
  readonly selectedInvoice = signal<Invoice | null>(null);

  readonly editDialogVisible = signal(false);
  readonly editInFlight = signal(false);

  // ── Server-side filter bar ────────────────────────────────────────────────
  filterExpanded = false;
  filterQ = '';
  filterStatus: InvoiceStatus | null = null;
  filterFrom: Date | null = null;
  filterTo: Date | null = null;

  readonly statusFilterOptions: { label: string; value: InvoiceStatus | null }[] = [
    { label: 'All', value: null },
    { label: 'Paid', value: 'PAID' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Overdue', value: 'OVERDUE' },
    { label: 'Cancelled', value: 'CANCELLED' }
  ];

  hasActiveFilters = computed(() =>
    !!this.filterQ || !!this.filterStatus || !!this.filterFrom || !!this.filterTo
  );

  private readonly destroy$ = new Subject<void>();




  // ── Bulk status ──────────────────────────────────────────────────────────
  bulkStatusDialogVisible = false;
  bulkStatusValue: InvoiceStatus = 'PAID';
  readonly bulkStatusInProgress = signal(false);

  // Recurring options (kept for template compatibility, but not used in Lite)
  readonly recurrenceOptions: { label: string; value: string }[] = [
    { label: 'Weekly', value: 'WEEKLY' },
    { label: 'Monthly', value: 'MONTHLY' },
    { label: 'Quarterly', value: 'QUARTERLY' },
    { label: 'Yearly', value: 'YEARLY' }
  ];

  readonly statusOptions: { label: string; value: InvoiceStatus }[] = [
    { label: 'PAID', value: 'PAID' },
    { label: 'PENDING', value: 'PENDING' },
    { label: 'CANCELLED', value: 'CANCELLED' },
    { label: 'OVERDUE', value: 'OVERDUE' }
  ];

  readonly createModel = signal<InvoiceCreateRequest>({
    clientName: '',
    amount: 0,
    status: 'PENDING',
    dueDate: ''
  });

  // PrimeNG Calendar works best with Date for the picker
  createDueDate: Date | null = null;
  editDueDate: Date | null = null;
  selectedCustomerForCreate: Customer | null = null;

  readonly editModel = signal<{ id: number; clientName: string; customerId?: number; amount: number; status: InvoiceStatus; dueDate: string }>({
    id: 0,
    clientName: '',
    customerId: undefined,
    amount: 0,
    status: 'PENDING',
    dueDate: ''
  });

  @ViewChild(FileUpload) private fileUpload?: FileUpload;

  readonly exportInProgress = computed(() => this.exportLoadingEn());

  selectedCustomerForEdit: Customer | null = null;

  constructor(
    private readonly apiService: ApiService,
    private readonly invoiceService: InvoiceService,
    private readonly customerService: CustomerService,
    private readonly messageService: MessageService,
    private readonly confirmationService: ConfirmationService,
    private readonly dashboardService: DashboardService,
    private readonly router: Router
  ) { }

  ngOnInit(): void {
    queueMicrotask(() => {
      this.loadInvoices();
      this.loadCustomers();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Filter methods ────────────────────────────────────────────────────────

  onFilterChange(): void {
    // debounce is handled by applyServerFilter — auto-apply only when user clicks Search
  }

  applyServerFilter(): void {
    if (!this.filterQ && !this.filterStatus && !this.filterFrom && !this.filterTo) {
      this.loadInvoices();
      return;
    }
    this.tableLoading.set(true);
    const toIso = (d: Date | null) => d ? d.toISOString().split('T')[0] : undefined;
    this.invoiceService.search({
      q: this.filterQ || undefined,
      status: this.filterStatus ?? undefined,
      from: toIso(this.filterFrom),
      to: toIso(this.filterTo),
      page: 0, size: 200
    }).pipe(finalize(() => this.tableLoading.set(false)))
      .subscribe({
        next: (page) => this.invoices.set(page.content ?? []),
        error: () => this.messageService.add({ severity: 'error', summary: 'Search', detail: 'Search failed.' })
      });
  }

  clearFilters(): void {
    this.filterQ = '';
    this.filterStatus = null;
    this.filterFrom = null;
    this.filterTo = null;
    this.loadInvoices();
  }

  refresh(): void {
    this.apiService.refreshInvoices();
    this.loadInvoices();
  }

  loadInvoices(): void {
    this.tableLoading.set(true);

    this.invoiceService
      .getAll()
      .pipe(
        take(1),
        finalize(() => this.tableLoading.set(false))
      )
      .subscribe({
        next: (data) => this.invoices.set(data ?? []),
        error: () => {
          this.invoices.set([]);
          this.messageService.add({ severity: 'error', summary: 'Invoices', detail: 'Failed to load invoices.' });
        }
      });
  }

  loadCustomers(): void {
    this.customerService
      .getActiveCustomers()
      .pipe(take(1))
      .subscribe({
        next: (data) => {
          this.customers.set(data ?? []);
          this.syncEditCustomerSelection();
        },
        error: () => {
          this.customers.set([]);
          console.error('Failed to load customers for invoice selection.');
        }
      });
  }

  openCreateDialog(): void {
    this.createModel.set({ clientName: '', amount: 0, status: 'PENDING', dueDate: '' });
    this.createDueDate = null;
    this.selectedCustomerForCreate = null;
    this.createDialogVisible.set(true);
  }

  closeCreateDialog(): void {
    if (this.createInFlight()) return;
    this.createDialogVisible.set(false);
  }

  onCreateModelChange<K extends keyof InvoiceCreateRequest>(key: K, value: InvoiceCreateRequest[K]): void {
    this.createModel.update((m) => ({ ...m, [key]: value }));
  }

  onCreateDueDateChange(d: Date | null): void {
    this.createDueDate = d;
    const iso = d ? d.toISOString().slice(0, 10) : '';
    this.createModel.update((m) => ({ ...m, dueDate: iso }));
  }

  onCustomerSelect(customer: Customer | null): void {
    if (customer) {
      this.createModel.update((m) => ({
        ...m,
        clientName: customer.name,
        customerId: customer.id
      }));
    } else {
      this.createModel.update((m) => ({
        ...m,
        clientName: '',
        customerId: undefined
      }));
    }
  }

  createInvoice(): void {
    const model = this.createModel();

    if (!model.clientName.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Invoices', detail: 'Client Name is required.' });
      return;
    }

    if (!model.amount || model.amount <= 0) {
      this.messageService.add({ severity: 'warn', summary: 'Invoices', detail: 'Amount must be positive.' });
      return;
    }

    if (!model.dueDate) {
      this.messageService.add({ severity: 'warn', summary: 'Invoices', detail: 'Due Date is required.' });
      return;
    }

    this.createInFlight.set(true);

    const req: InvoiceCreateRequest = {
      ...this.createModel(),
      // Recurring fields removed - Premium feature only
      isRecurring: undefined,
      recurrenceInterval: undefined,
      nextRecurrenceDate: undefined,
      recurrenceEndDate: undefined
    };

    this.invoiceService
      .create(req)
      .pipe(
        take(1),
        finalize(() => this.createInFlight.set(false))
      )
      .subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Invoices', detail: 'Invoice created.' });
          this.createDialogVisible.set(false);
          this.loadInvoices();
          this.dashboardService.notifyInvoiceDataChanged();
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Invoices', detail: 'Failed to create invoice.' });
        }
      });
  }

  confirmDelete(invoice: Invoice): void {
    this.confirmationService.confirm({
      header: 'Confirm Delete',
      message: `Delete invoice #${invoice.id}?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      accept: () => this.deleteInvoice(invoice.id)
    });
  }

  private deleteInvoice(id: number): void {
    this.invoiceService
      .delete(id)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Invoices', detail: 'Invoice deleted.' });
          this.loadInvoices();
          this.dashboardService.notifyInvoiceDataChanged();
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Invoices', detail: 'Failed to delete invoice.' });
        }
      });
  }

  openImportDialog(): void {
    this.beforeImportCount = this.invoices()?.length ?? 0;
    this.importDialogVisible.set(true);
    this.clearSelectedImportFile();
    queueMicrotask(() => this.fileUpload?.clear());
  }

  closeImportDialog(): void {
    if (this.importUploading()) return;
    this.importDialogVisible.set(false);
    this.clearSelectedImportFile();
    this.fileUpload?.clear();
  }

  clearSelectedImportFile(): void {
    this.selectedImportFile.set(null);
    this.selectedImportFileName.set(null);
  }

  onImportFileSelect(event: FileSelectEvent): void {
    const file = event.files?.[0];
    if (!file) {
      this.clearSelectedImportFile();
      return;
    }

    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      this.messageService.add({ severity: 'warn', summary: 'Invoices', detail: 'Please select a .xlsx file.' });
      this.fileUpload?.clear();
      this.clearSelectedImportFile();
      return;
    }

    this.selectedImportFile.set(file);
    this.selectedImportFileName.set(file.name);
  }

  confirmImport(): void {
    const file = this.selectedImportFile();
    if (!file || this.importUploading()) return;

    this.confirmationService.confirm({
      header: 'Confirm Import',
      message: `Import invoices from "${this.selectedImportFileName()}"?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Import',
      rejectLabel: 'Cancel',
      accept: () => this.doImport()
    });
  }

  private doImport(): void {
    const file = this.selectedImportFile();
    if (!file || this.importUploading()) return;

    this.importUploading.set(true);
    this.messageService.add({ severity: 'info', summary: 'Invoices', detail: 'Import started...' });

    this.apiService
      .uploadInvoices(file)
      .pipe(
        take(1),
        finalize(() => {
          this.importUploading.set(false);
          this.fileUpload?.clear();
          this.clearSelectedImportFile();
        })
      )
      .subscribe({
        next: () => {
          this.importDialogVisible.set(false);
          this.apiService.refreshInvoices();
          this.loadInvoices();
          this.dashboardService.notifyInvoiceDataChanged();
          this.messageService.add({ severity: 'success', summary: 'Invoices', detail: 'Imported successfully.' });
          this.beforeImportCount = null;
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Invoices', detail: 'Failed to import invoices.' });
        }
      });
  }

  onExportClick(): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Not Available',
      detail: 'Excel/CSV Export is not available in this edition.',
      life: 5000
    });
  }

  statusSeverity(status: InvoiceStatus): UiTagSeverity {
    switch (status) {
      case 'PAID':
        return 'success';
      case 'PENDING':
        return 'info';
      case 'CANCELLED':
        return 'secondary';
      case 'OVERDUE':
        return 'danger';
      default:
        return 'info';
    }
  }

  onEditCustomerSelect(customer: Customer | null): void {
    if (customer) {
      this.editModel.update((m) => ({
        ...m,
        clientName: customer.name,
        customerId: customer.id
      }));
    } else {
      this.editModel.update((m) => ({
        ...m,
        clientName: '',
        customerId: undefined
      }));
    }
  }

  // ========== View Invoice Methods ==========
  viewInvoice(invoice: Invoice): void {
    this.selectedInvoice.set(invoice);
    this.viewDialogVisible.set(true);
  }

  openAttachmentPaywall(): void {
    this.viewDialogVisible.set(false);
    this.router.navigate(['/billing'], { queryParams: { feature: 'cloud-attachments' } });
  }

  closeViewDialog(): void {
    this.viewDialogVisible.set(false);
    this.selectedInvoice.set(null);
  }

  editFromView(): void {
    const invoice = this.selectedInvoice();
    if (invoice) {
      this.closeViewDialog();
      this.editInvoice(invoice);
    }
  }

  // ========== Edit Invoice Methods ==========
  editInvoice(invoice: Invoice): void {
    this.editModel.set({
      id: invoice.id,
      clientName: invoice.clientName,
      customerId: invoice.customerId,
      amount: invoice.amount,
      status: invoice.status,
      dueDate: invoice.dueDate
    });

    // Populate basic fields (recurring removed - Premium feature only)
    this.selectedCustomerForEdit = this.findCustomerMatch(invoice.customerId, invoice.clientName, invoice.customerName);
    if (this.selectedCustomerForEdit) {
      this.editModel.update((m) => ({
        ...m,
        customerId: this.selectedCustomerForEdit!.id,
        clientName: this.selectedCustomerForEdit!.name
      }));
    }

    this.editDueDate = invoice.dueDate ? new Date(invoice.dueDate + 'T00:00:00') : null;
    this.editDialogVisible.set(true);
  }

  closeEditDialog(): void {
    if (this.editInFlight()) return;
    this.editDialogVisible.set(false);
  }

  onEditModelChange<K extends keyof InvoiceUpdateRequest>(key: K, value: InvoiceUpdateRequest[K]): void {
    this.editModel.update((m) => ({ ...m, [key]: value }));
  }

  onEditDueDateChange(d: Date | null): void {
    this.editDueDate = d;
    const iso = d ? d.toISOString().slice(0, 10) : '';
    this.editModel.update((m) => ({ ...m, dueDate: iso }));
  }

  saveInvoice(): void {
    const model = this.editModel();

    if (!model.clientName.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Invoices', detail: 'Client Name is required.' });
      return;
    }

    if (!model.amount || model.amount <= 0) {
      this.messageService.add({ severity: 'warn', summary: 'Invoices', detail: 'Amount must be positive.' });
      return;
    }

    if (!model.dueDate) {
      this.messageService.add({ severity: 'warn', summary: 'Invoices', detail: 'Due Date is required.' });
      return;
    }

    this.editInFlight.set(true);

    const updateRequest: InvoiceUpdateRequest = {
      clientName: model.clientName,
      customerId: model.customerId,
      amount: model.amount,
      status: model.status,
      dueDate: model.dueDate,
      // Recurring fields removed - Premium feature only
      isRecurring: undefined,
      recurrenceInterval: undefined,
      nextRecurrenceDate: undefined,
      recurrenceEndDate: undefined
    };

    this.invoiceService
      .update(model.id, updateRequest)
      .pipe(
        take(1),
        finalize(() => this.editInFlight.set(false))
      )
      .subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Invoices', detail: 'Invoice updated.' });
          this.editDialogVisible.set(false);
          this.loadInvoices();
          this.dashboardService.notifyInvoiceDataChanged();
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Invoices', detail: 'Failed to update invoice.' });
        }
      });
  }

  private syncEditCustomerSelection(): void {
    if (!this.editDialogVisible() || this.selectedCustomerForEdit) {
      return;
    }

    const model = this.editModel();
    const matched = this.findCustomerMatch(model.customerId, model.clientName);
    if (matched) {
      this.selectedCustomerForEdit = matched;
      this.editModel.update((m) => ({
        ...m,
        customerId: matched.id,
        clientName: matched.name
      }));
    }
  }

  private findCustomerMatch(
    customerId?: number,
    clientName?: string,
    customerName?: string
  ): Customer | null {
    const list = this.customers();
    if (!list.length) return null;

    if (customerId) {
      const found = list.find((c) => c.id === customerId);
      if (found) return found;
    }

    const nameToMatch = (customerName || clientName || '').trim().toLowerCase();
    if (!nameToMatch) return null;

    return list.find((c) => c.name.trim().toLowerCase() === nameToMatch) ?? null;
  }

  openBulkStatusDialog(): void {
    if (!this.selectedInvoices.length) return;
    this.bulkStatusValue = 'PAID';
    this.bulkStatusDialogVisible = true;
  }

  applyBulkStatus(): void {
    const ids = this.selectedInvoices.map(i => i.id);
    if (!ids.length) return;
    this.bulkStatusInProgress.set(true);
    this.invoiceService.bulkUpdateStatus(ids, this.bulkStatusValue)
      .pipe(take(1), finalize(() => this.bulkStatusInProgress.set(false)))
      .subscribe({
        next: (res) => {
          this.bulkStatusDialogVisible = false;
          this.selectedInvoices = [];
          this.messageService.add({ severity: 'success', summary: 'Invoices', detail: `${res.updated} invoice(s) updated.` });
          this.loadInvoices();
          this.dashboardService.notifyInvoiceDataChanged();
        },
        error: () => this.messageService.add({ severity: 'error', summary: 'Invoices', detail: 'Bulk status update failed.' })
      });
  }

  bulkDeleteInvoices(): void {
    const selected = this.selectedInvoices;
    if (!selected.length) return;

    this.confirmationService.confirm({
      header: 'Confirm Bulk Delete',
      message: `Delete ${selected.length} selected invoice(s)? This cannot be undone.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Delete All',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.bulkDeleteInProgress.set(true);
        const ids = selected.map(i => i.id);
        this.invoiceService.bulkDelete(ids).pipe(take(1)).subscribe({
          next: () => {
            this.selectedInvoices = [];
            this.bulkDeleteInProgress.set(false);
            this.messageService.add({ severity: 'success', summary: 'Invoices', detail: `${ids.length} invoice(s) deleted.` });
            this.loadInvoices();
            this.dashboardService.notifyInvoiceDataChanged();
          },
          error: () => {
            this.bulkDeleteInProgress.set(false);
            this.messageService.add({ severity: 'error', summary: 'Invoices', detail: 'Bulk delete failed.' });
          }
        });
      }
    });
  }
}
