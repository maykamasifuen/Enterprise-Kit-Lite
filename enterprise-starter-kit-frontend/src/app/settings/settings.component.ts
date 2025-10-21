import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TextareaModule } from 'primeng/textarea';
import { SettingsService } from '../services/settings.service';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    TranslateModule,
    CardModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    ButtonModule,
    DividerModule,
    ToastModule,
    TextareaModule
  ],
  providers: [MessageService],
  template: `
    <p-toast />
    <div class="settings-container">
      <div class="page-header">
        <h1><i class="pi pi-cog"></i> {{ 'SETTINGS.TITLE' | translate }}</h1>
        <p class="subtitle">{{ 'SETTINGS.SUBTITLE' | translate }}</p>
      </div>

      <div class="settings-grid">
        <!-- Company Information -->
        <p-card [header]="'SETTINGS.COMPANY_INFO' | translate" styleClass="settings-card">
          <form [formGroup]="companyForm">
            <div class="form-grid">
              <div class="form-field">
                <label>{{ 'SETTINGS.COMPANY_NAME' | translate }}</label>
                <input pInputText formControlName="companyName" class="w-full" />
              </div>

              <div class="form-field">
                <label>{{ 'SETTINGS.TAX_NUMBER' | translate }}</label>
                <input pInputText formControlName="taxNumber" class="w-full" />
              </div>

              <div class="form-field full-width">
                <label>{{ 'SETTINGS.ADDRESS' | translate }}</label>
                <textarea pTextarea formControlName="address" [rows]="2" class="w-full"></textarea>
              </div>

              <div class="form-field">
                <label>{{ 'SETTINGS.PHONE' | translate }}</label>
                <input pInputText formControlName="phone" class="w-full" />
              </div>

              <div class="form-field">
                <label>{{ 'SETTINGS.EMAIL' | translate }}</label>
                <input pInputText formControlName="email" type="email" class="w-full" />
              </div>

              <div class="form-field">
                <label>{{ 'SETTINGS.WEBSITE' | translate }}</label>
                <input pInputText formControlName="website" class="w-full" />
              </div>
            </div>
          </form>
        </p-card>

        <!-- Invoice Settings -->
        <p-card [header]="'SETTINGS.INVOICE_SETTINGS' | translate" styleClass="settings-card">
          <form [formGroup]="invoiceForm">
            <div class="form-grid">
              <div class="form-field">
                <label>{{ 'SETTINGS.INVOICE_PREFIX' | translate }}</label>
                <input pInputText formControlName="invoicePrefix" class="w-full" placeholder="INV-" />
              </div>

              <div class="form-field">
                <label>{{ 'SETTINGS.NEXT_NUMBER' | translate }}</label>
                <p-inputNumber formControlName="nextInvoiceNumber" [min]="1" class="w-full" />
              </div>

              <div class="form-field">
                <label>{{ 'SETTINGS.DEFAULT_CURRENCY' | translate }}</label>
                <p-select
                  formControlName="currency"
                  [options]="currencies"
                  optionLabel="label"
                  optionValue="value"
                  class="w-full" />
              </div>

              <div class="form-field">
                <label>{{ 'SETTINGS.DEFAULT_TAX_RATE' | translate }}</label>
                <p-inputNumber
                  formControlName="defaultTaxRate"
                  [min]="0"
                  [max]="100"
                  suffix="%"
                  class="w-full" />
              </div>

              <div class="form-field">
                <label>{{ 'SETTINGS.PAYMENT_TERMS' | translate }}</label>
                <p-select
                  formControlName="paymentTerms"
                  [options]="paymentTermsOptions"
                  optionLabel="label"
                  optionValue="value"
                  class="w-full" />
              </div>

              <div class="form-field full-width">
                <label>{{ 'SETTINGS.INVOICE_NOTES' | translate }}</label>
                <textarea pTextarea formControlName="defaultNotes" [rows]="3" class="w-full"></textarea>
              </div>
            </div>
          </form>
        </p-card>

        <!-- Regional Settings -->
        <p-card [header]="'SETTINGS.REGIONAL_SETTINGS' | translate" styleClass="settings-card">
          <form [formGroup]="regionalForm">
            <div class="form-grid">
              <div class="form-field">
                <label>{{ 'SETTINGS.DATE_FORMAT' | translate }}</label>
                <p-select
                  formControlName="dateFormat"
                  [options]="dateFormats"
                  optionLabel="label"
                  optionValue="value"
                  class="w-full" />
              </div>

              <div class="form-field">
                <label>{{ 'SETTINGS.TIMEZONE' | translate }}</label>
                <p-select
                  formControlName="timezone"
                  [options]="timezones"
                  optionLabel="label"
                  optionValue="value"
                  class="w-full" />
              </div>
            </div>
          </form>
        </p-card>
      </div>

      <!-- Save Button -->
      <div class="save-section">
        <p-button
          [label]="'COMMON.SAVE' | translate"
          icon="pi pi-check"
          [loading]="saving()"
          (onClick)="saveSettings()" />
      </div>
    </div>
  `,
  styles: [`
    .settings-container {
      padding: 1.5rem;
      max-width: 1200px;
      margin: 0 auto;
      box-sizing: border-box;
    }

    @media (max-width: 768px) {
      .settings-container { padding: 1rem 0.75rem; }
    }

    @media (max-width: 480px) {
      .settings-container { padding: 0.75rem 0.5rem; }
    }

    .page-header {
      margin-bottom: 2rem;
    }

    .page-header h1 {
      margin: 0;
      font-size: 1.75rem;
      color: var(--app-text-primary, #1e293b);
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    @media (max-width: 576px) {
      .page-header h1 { font-size: 1.2rem; }
    }

    .page-header h1 i {
      color: var(--primary-color);
    }

    .subtitle {
      color: var(--app-text-secondary, #64748b);
      margin: 0.5rem 0 0 0;
    }

    .settings-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(400px, 100%), 1fr));
      gap: 1.5rem;
    }

    :host ::ng-deep .settings-card {
      background: var(--app-card-bg, #ffffff);
      border: 1px solid var(--app-card-border, #e2e8f0);
      border-radius: 12px;

      .p-card-header {
        padding: 1.25rem 1.5rem 0;
        font-weight: 600;
        color: var(--app-text-primary, #1e293b);
      }

      .p-card-body {
        padding: 1.5rem;
      }
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }

    .form-field {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-field.full-width {
      grid-column: span 2;
    }

    .form-field label {
      font-size: 0.875rem;
      color: var(--app-text-secondary, #64748b);
    }

    .save-section {
      margin-top: 2rem;
      display: flex;
      justify-content: flex-end;
    }

    @media (max-width: 600px) {
      .settings-grid {
        grid-template-columns: 1fr;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .form-field.full-width {
        grid-column: span 1;
      }
    }

    .pro-badge {
      display: inline-block;
      margin-top: 0.5rem;
      padding: 0.2rem 0.6rem;
      border-radius: 999px;
      background: rgba(99, 102, 241, 0.12);
      color: #6366f1;
      font-weight: 600;
      font-size: 0.75rem;
    }
  `]
})
export class SettingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private translate = inject(TranslateService);
  private settingsService = inject(SettingsService);

  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  saving = signal(false);

  companyForm: FormGroup = this.fb.group({
    companyName: [''],
    taxNumber: [''],
    address: [''],
    phone: [''],
    email: ['', Validators.email],
    website: ['']
  });

  invoiceForm: FormGroup = this.fb.group({
    invoicePrefix: ['INV-'],
    nextInvoiceNumber: [1],
    currency: ['USD'],
    defaultTaxRate: [0],
    paymentTerms: [30],
    defaultNotes: ['']
  });

  regionalForm: FormGroup = this.fb.group({
    dateFormat: ['yyyy-MM-dd'],
    timezone: ['UTC']
  });

  currencies = [
    { label: 'USD - US Dollar', value: 'USD' },
    { label: 'EUR - Euro', value: 'EUR' },
    { label: 'GBP - British Pound', value: 'GBP' },
  ];

  paymentTermsOptions = [
    { label: 'Due on Receipt', value: 0 },
    { label: 'Net 7', value: 7 },
    { label: 'Net 15', value: 15 },
    { label: 'Net 30', value: 30 },
    { label: 'Net 45', value: 45 },
    { label: 'Net 60', value: 60 },
    { label: 'Net 90', value: 90 }
  ];

  dateFormats = [
    { label: 'YYYY-MM-DD', value: 'yyyy-MM-dd' },
    { label: 'DD/MM/YYYY', value: 'dd/MM/yyyy' },
    { label: 'MM/DD/YYYY', value: 'MM/dd/yyyy' },
    { label: 'DD-MM-YYYY', value: 'dd-MM-yyyy' }
  ];

  timezones = [
    { label: 'UTC', value: 'UTC' },
    { label: 'Asia/Riyadh (GMT+3)', value: 'Asia/Riyadh' },
    { label: 'Asia/Dubai (GMT+4)', value: 'Asia/Dubai' },
    { label: 'Africa/Cairo (GMT+2)', value: 'Africa/Cairo' },
    { label: 'Europe/London (GMT)', value: 'Europe/London' },
    { label: 'America/New_York (GMT-5)', value: 'America/New_York' }
  ];

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.settingsService.loadSettings();
    const settings = this.settingsService.settings();
    this.companyForm.patchValue(settings.company);
    this.invoiceForm.patchValue(settings.invoice);
    this.regionalForm.patchValue(settings.regional);
    setTimeout(() => {
      const s = this.settingsService.settings();
      this.companyForm.patchValue(s.company);
      this.invoiceForm.patchValue(s.invoice);
      this.regionalForm.patchValue(s.regional);
    }, 500);
  }

  saveSettings(): void {
    this.saving.set(true);

    const settings = {
      company: this.companyForm.value,
      invoice: this.invoiceForm.value,
      regional: this.regionalForm.value
    };

    this.settingsService.saveSettings(settings).subscribe({
      next: () => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'success',
          summary: this.translate.instant('COMMON.SUCCESS'),
          detail: this.translate.instant('SETTINGS.SAVE_SUCCESS')
        });
      },
      error: () => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('COMMON.ERROR'),
          detail: this.translate.instant('SETTINGS.SAVE_ERROR')
        });
      }
    });
  }
}
