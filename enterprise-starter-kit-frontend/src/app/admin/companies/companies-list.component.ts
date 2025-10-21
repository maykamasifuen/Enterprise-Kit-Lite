import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToolbarModule } from 'primeng/toolbar';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { MessageService, ConfirmationService } from 'primeng/api';
import { LocalizedNumberPipe } from '../../pipes/localized-number.pipe';

import { CompanyService, Company, SystemStats } from '../../services/company.service';

@Component({
  selector: 'app-companies-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    TableModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    DialogModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule,
    ToolbarModule,
    InputNumberModule,
    SelectModule,
    LocalizedNumberPipe
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast />
    <p-confirmDialog />

    <div class="admin-container">
      <!-- Companies Table -->
      <p-card>
        <ng-template pTemplate="header">
          <p-toolbar>
            <ng-template pTemplate="start">
              <h2>{{ 'ADMIN.COMPANIES.TITLE' | translate }}</h2>
            </ng-template>
            <ng-template pTemplate="end">
              <p-button
                [label]="'ADMIN.COMPANIES.ADD_COMPANY' | translate"
                icon="pi pi-plus"
                (onClick)="openCreateDialog()" />
            </ng-template>
          </p-toolbar>
        </ng-template>

        <p-table
          [value]="companies()"
          [paginator]="true"
          [rows]="10"
          [loading]="loading()"
          [rowsPerPageOptions]="[5, 10, 25]"
          styleClass="p-datatable-striped">
          <ng-template pTemplate="header">
            <tr>
              <th>{{ 'ADMIN.COMPANIES.NAME' | translate }}</th>
              <th>{{ 'ADMIN.COMPANIES.TENANT_ID' | translate }}</th>
              <th>{{ 'ADMIN.COMPANIES.EMAIL' | translate }}</th>
              <th>{{ 'ADMIN.COMPANIES.USER_COUNT' | translate }}</th>
              <th>{{ 'ADMIN.COMPANIES.INVOICE_COUNT' | translate }}</th>
              <th>{{ 'ADMIN.COMPANIES.STATUS' | translate }}</th>
              <th>{{ 'COMMON.ACTIONS' | translate }}</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-company>
            <tr>
              <td>{{ company.name }}</td>
              <td><code>{{ company.tenantId }}</code></td>
              <td>{{ company.email || '-' }}</td>
              <td>{{ company.userCount || 0 | localizedNumber }}</td>
              <td>{{ company.invoiceCount || 0 | localizedNumber }}</td>
              <td>
                <p-tag
                  [value]="company.isActive ? ('ADMIN.COMPANIES.ACTIVE' | translate) : ('ADMIN.COMPANIES.INACTIVE' | translate)"
                  [severity]="company.isActive ? 'success' : 'danger'" />
              </td>
              <td>
                <div class="action-buttons">
                  <p-button icon="pi pi-pencil" [rounded]="true" [text]="true" (onClick)="editCompany(company)" />
                  <p-button icon="pi pi-power-off" [rounded]="true" [text]="true" (onClick)="toggleStatus(company)" />
                  <p-button icon="pi pi-users" [rounded]="true" [text]="true" (onClick)="viewUsers(company)" />
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="8" class="text-center">{{ 'ADMIN.COMPANIES.NO_COMPANIES' | translate }}</td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>
    </div>

    <!-- Create/Edit Dialog -->
    <p-dialog
      [header]="editMode ? ('ADMIN.COMPANIES.EDIT_COMPANY' | translate) : ('ADMIN.COMPANIES.ADD_COMPANY' | translate)"
      [(visible)]="dialogVisible"
      [modal]="true"
      [style]="{ width: '600px' }">
      <form [formGroup]="companyForm" (ngSubmit)="saveCompany()">
        <div class="form-grid">
          <div class="form-field">
            <label>{{ 'ADMIN.COMPANIES.NAME' | translate }} *</label>
            <input pInputText formControlName="name" class="w-full" />
          </div>
          <div class="form-field">
            <label>{{ 'ADMIN.COMPANIES.EMAIL' | translate }}</label>
            <input pInputText formControlName="email" type="email" class="w-full" />
          </div>
          <div class="form-field">
            <label>{{ 'ADMIN.COMPANIES.PHONE' | translate }}</label>
            <input pInputText formControlName="phone" class="w-full" />
          </div>
          <div class="form-field">
            <label>{{ 'ADMIN.COMPANIES.ADDRESS' | translate }}</label>
            <input pInputText formControlName="address" class="w-full" />
          </div>
          <div class="form-field">
            <label>{{ 'ADMIN.COMPANIES.CITY' | translate }}</label>
            <input pInputText formControlName="city" class="w-full" />
          </div>
          <div class="form-field">
            <label>{{ 'ADMIN.COMPANIES.COUNTRY' | translate }}</label>
            <input pInputText formControlName="country" class="w-full" />
          </div>
          <div class="form-field">
            <label>{{ 'ADMIN.COMPANIES.TAX_NUMBER' | translate }}</label>
            <input pInputText formControlName="taxNumber" class="w-full" />
          </div>
          <div class="form-field">
            <label>{{ 'ADMIN.COMPANIES.WEBSITE' | translate }}</label>
            <input pInputText formControlName="website" class="w-full" />
          </div>


          @if (!editMode) {
            <div class="form-field full-width">
              <h4>{{ 'ADMIN.COMPANIES.ADMIN_EMAIL' | translate }}</h4>
            </div>
            <div class="form-field">
              <label>{{ 'ADMIN.COMPANIES.ADMIN_EMAIL' | translate }}</label>
              <input pInputText formControlName="adminEmail" type="email" class="w-full" />
            </div>
            <div class="form-field">
              <label>{{ 'ADMIN.COMPANIES.ADMIN_PASSWORD' | translate }}</label>
              <input pInputText formControlName="adminPassword" type="password" class="w-full" />
            </div>
          }
        </div>
      </form>
      <ng-template pTemplate="footer">
        <p-button [label]="'COMMON.CANCEL' | translate" severity="secondary" (onClick)="dialogVisible = false" />
        <p-button [label]="'COMMON.SAVE' | translate" (onClick)="saveCompany()" [disabled]="companyForm.invalid" />
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .admin-container { padding: 1.5rem; max-width: 1400px; margin: 0 auto; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
    :host ::ng-deep .stat-card { background: rgba(30, 30, 30, 0.6); border: 1px solid rgba(255,255,255,0.1); }
    .stat-content { display: flex; align-items: center; gap: 1rem; }
    .stat-icon { font-size: 2rem; color: var(--primary-color); }
    .stat-icon.success { color: var(--green-500); }
    .stat-info { display: flex; flex-direction: column; }
    .stat-value { font-size: 1.5rem; font-weight: bold; }
    .stat-label { font-size: 0.875rem; color: var(--text-color-secondary); }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .form-field { display: flex; flex-direction: column; gap: 0.5rem; }
    .form-field.full-width { grid-column: span 2; }
    .action-buttons { display: flex; gap: 0.25rem; }
    code { background: rgba(255,255,255,0.1); padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.85rem; }
  `]
})
export class CompaniesListComponent implements OnInit {
  private companyService = inject(CompanyService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private fb = inject(FormBuilder);
  private translate = inject(TranslateService);
  private router = inject(Router);

  companies = signal<Company[]>([]);
  loading = signal(false);
  dialogVisible = false;
  editMode = false;
  selectedCompany: Company | null = null;
  // ... maps



  companyForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    email: ['', Validators.email],
    phone: [''],
    address: [''],
    city: [''],
    country: [''],
    taxNumber: [''],
    website: [''],
    adminEmail: [''],
    adminPassword: ['']
  });

  ngOnInit(): void {
    this.loadCompanies();
  }

  loadCompanies(): void {
    this.loading.set(true);
    this.companyService.getCompanies().subscribe({
      next: (response) => {
        this.companies.set(response.content);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load companies' });
      }
    });
  }

  openCreateDialog(): void {
    this.editMode = false;
    this.selectedCompany = null;
    this.companyForm.reset();
    this.dialogVisible = true;
  }

  editCompany(company: Company): void {
    this.editMode = true;
    this.selectedCompany = company;
    this.companyForm.patchValue(company);
    this.dialogVisible = true;
  }

  saveCompany(): void {
    if (this.companyForm.invalid) return;

    const formValue = this.companyForm.value;

    if (this.editMode && this.selectedCompany) {
      this.companyService.updateCompany(this.selectedCompany.id, formValue).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: this.translate.instant('ADMIN.COMPANIES.UPDATE_SUCCESS') });
          this.dialogVisible = false;
          this.loadCompanies();
        },
        error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update company' })
      });
    } else {
      const request = {
        company: formValue,
        adminEmail: formValue.adminEmail,
        adminPassword: formValue.adminPassword
      };
      this.companyService.createCompany(request).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: this.translate.instant('ADMIN.COMPANIES.CREATE_SUCCESS') });
          this.dialogVisible = false;
          this.loadCompanies();

        },
        error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create company' })
      });
    }
  }

  toggleStatus(company: Company): void {
    this.companyService.toggleCompanyStatus(company.id).subscribe({
      next: () => {
        this.loadCompanies();
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to toggle status' })
    });
  }

  viewUsers(company: Company): void {
    this.router.navigate(['/admin/users'], { queryParams: { tenant: company.tenantId } });
  }
}
