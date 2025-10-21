import { Component, EventEmitter, Input, OnInit, OnChanges, SimpleChanges, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

// PrimeNG
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';

import { Customer, CustomerRequest } from '../services/customer.service';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    InputTextModule,
    TextareaModule,
    ButtonModule
  ],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <div class="form-grid">
        <!-- Name -->
        <div class="form-field full-width">
          <label for="name">{{ 'CUSTOMERS.NAME' | translate }} *</label>
          <input pInputText id="name" formControlName="name" class="w-full" />
          @if (form.get('name')?.touched && form.get('name')?.errors?.['required']) {
            <small class="error-text">{{ 'VALIDATION.REQUIRED' | translate }}</small>
          }
        </div>

        <!-- Email -->
        <div class="form-field">
          <label for="email">{{ 'CUSTOMERS.EMAIL' | translate }}</label>
          <input pInputText id="email" formControlName="email" type="email" class="w-full" />
          @if (form.get('email')?.touched && form.get('email')?.errors?.['email']) {
            <small class="error-text">{{ 'VALIDATION.INVALID_EMAIL' | translate }}</small>
          }
        </div>

        <!-- Phone -->
        <div class="form-field">
          <label for="phone">{{ 'CUSTOMERS.PHONE' | translate }}</label>
          <input pInputText id="phone" formControlName="phone" class="w-full" />
        </div>

        <!-- Contact Person -->
        <div class="form-field">
          <label for="contactPerson">{{ 'CUSTOMERS.CONTACT_PERSON' | translate }}</label>
          <input pInputText id="contactPerson" formControlName="contactPerson" class="w-full" />
        </div>

        <!-- Tax Number -->
        <div class="form-field">
          <label for="taxNumber">{{ 'CUSTOMERS.TAX_NUMBER' | translate }}</label>
          <input pInputText id="taxNumber" formControlName="taxNumber" class="w-full" />
        </div>

        <!-- Address -->
        <div class="form-field full-width">
          <label for="address">{{ 'CUSTOMERS.ADDRESS' | translate }}</label>
          <input pInputText id="address" formControlName="address" class="w-full" />
        </div>

        <!-- City -->
        <div class="form-field">
          <label for="city">{{ 'CUSTOMERS.CITY' | translate }}</label>
          <input pInputText id="city" formControlName="city" class="w-full" />
        </div>

        <!-- Country -->
        <div class="form-field">
          <label for="country">{{ 'CUSTOMERS.COUNTRY' | translate }}</label>
          <input pInputText id="country" formControlName="country" class="w-full" />
        </div>

        <!-- Notes -->
        <div class="form-field full-width">
          <label for="notes">{{ 'CUSTOMERS.NOTES' | translate }}</label>
          <textarea pTextarea id="notes" formControlName="notes" [rows]="3" class="w-full"></textarea>
        </div>
      </div>

      <div class="form-actions">
        <p-button
          type="button"
          [label]="'COMMON.CANCEL' | translate"
          severity="secondary"
          [outlined]="true"
          (onClick)="cancel.emit()" />
        <p-button
          type="submit"
          [label]="'COMMON.SAVE' | translate"
          [disabled]="form.invalid" />
      </div>
    </form>
  `,
  styles: [`
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
      font-size: 0.9rem;
      color: var(--app-text-secondary, #64748b);
    }

    .error-text {
      color: #ef4444;
      font-size: 0.8rem;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 1.5rem;
      padding-top: 1rem;
      border-top: 1px solid var(--app-surface-border, #e2e8f0);
    }

    @media (max-width: 600px) {
      .form-grid {
        grid-template-columns: 1fr;
      }

      .form-field.full-width {
        grid-column: span 1;
      }
    }
  `]
})
export class CustomerFormComponent implements OnInit, OnChanges {
  @Input() customer: Customer | null = null;
  @Output() save = new EventEmitter<CustomerRequest>();
  @Output() cancel = new EventEmitter<void>();

  private fb = inject(FormBuilder);

  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(255)]],
    email: ['', [Validators.email, Validators.maxLength(255)]],
    phone: ['', [Validators.maxLength(50)]],
    address: ['', [Validators.maxLength(500)]],
    city: ['', [Validators.maxLength(100)]],
    country: ['', [Validators.maxLength(100)]],
    taxNumber: ['', [Validators.maxLength(50)]],
    contactPerson: ['', [Validators.maxLength(255)]],
    notes: ['', [Validators.maxLength(1000)]]
  });

  ngOnInit(): void {
    this.populateForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['customer']) {
      this.populateForm();
    }
  }

  private populateForm(): void {
    if (this.customer) {
      this.form.patchValue({
        name: this.customer.name || '',
        email: this.customer.email || '',
        phone: this.customer.phone || '',
        address: this.customer.address || '',
        city: this.customer.city || '',
        country: this.customer.country || '',
        taxNumber: this.customer.taxNumber || '',
        contactPerson: this.customer.contactPerson || '',
        notes: this.customer.notes || ''
      });
    } else {
      this.form.reset();
    }
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.save.emit(this.form.value as CustomerRequest);
    }
  }
}
