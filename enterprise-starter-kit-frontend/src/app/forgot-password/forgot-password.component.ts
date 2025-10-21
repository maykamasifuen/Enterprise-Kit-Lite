import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

// PrimeNG
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    TranslateModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    ToastModule,
    IconFieldModule,
    InputIconModule
  ],
  providers: [MessageService],
  template: `
    <p-toast />
    <div class="forgot-container">
      <div class="forgot-card">
        @if (!emailSent) {
          <!-- Request Reset Form -->
          <div class="logo-section">
            <i class="pi pi-lock logo-icon"></i>
            <h1>{{ 'AUTH.FORGOT_PASSWORD' | translate }}</h1>
            <p class="subtitle">{{ 'AUTH.FORGOT_PASSWORD_SUBTITLE' | translate }}</p>
          </div>

          <form [formGroup]="forgotForm" (ngSubmit)="onSubmit()">
            <div class="form-field">
              <label for="email">{{ 'AUTH.EMAIL' | translate }}</label>
              <p-iconfield iconPosition="left">
                <p-inputicon styleClass="pi pi-envelope"></p-inputicon>
                <input
                  pInputText
                  id="email"
                  type="email"
                  formControlName="email"
                  [placeholder]="'AUTH.EMAIL_PLACEHOLDER' | translate"
                  class="w-full" />
              </p-iconfield>
              @if (forgotForm.get('email')?.touched && forgotForm.get('email')?.errors?.['required']) {
                <small class="error-text">{{ 'VALIDATION.REQUIRED' | translate }}</small>
              }
              @if (forgotForm.get('email')?.touched && forgotForm.get('email')?.errors?.['email']) {
                <small class="error-text">{{ 'VALIDATION.INVALID_EMAIL' | translate }}</small>
              }
            </div>

            <button
              pButton
              type="submit"
              [label]="'AUTH.SEND_RESET_LINK' | translate"
              [loading]="isLoading"
              [disabled]="forgotForm.invalid || isLoading"
              >
            </button>
          </form>
        } @else {
          <!-- Success Message -->
          <div class="success-section">
            <i class="pi pi-check-circle success-icon"></i>
            <h1>{{ 'AUTH.CHECK_EMAIL' | translate }}</h1>
            <p class="subtitle">{{ 'AUTH.RESET_EMAIL_SENT' | translate }}</p>
            <p class="email-sent">{{ forgotForm.get('email')?.value }}</p>

            <div class="resend-section">
              <span>{{ 'AUTH.DIDNT_RECEIVE' | translate }}</span>
              <a (click)="resendEmail()" class="resend-link">{{ 'AUTH.RESEND' | translate }}</a>
            </div>
          </div>
        }

        <div class="back-link">
          <i class="pi pi-arrow-left"></i>
          <a routerLink="/login">{{ 'AUTH.BACK_TO_LOGIN' | translate }}</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .forgot-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #16213e 100%);
      padding: 2rem;
    }

    .forgot-card {
      background: rgba(30, 30, 30, 0.95);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 2.5rem;
      width: 100%;
      max-width: 420px;
      backdrop-filter: blur(10px);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    }

    .logo-section, .success-section {
      text-align: center;
      margin-bottom: 2rem;
    }

    .logo-icon {
      font-size: 3rem;
      color: var(--primary-color);
      margin-bottom: 1rem;
    }

    .success-icon {
      font-size: 4rem;
      color: #22c55e;
      margin-bottom: 1rem;
    }

    .logo-section h1, .success-section h1 {
      color: #ffffff;
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0;
    }

    .subtitle {
      color: rgba(255, 255, 255, 0.6);
      margin-top: 0.5rem;
      font-size: 0.9rem;
      line-height: 1.5;
    }

    .email-sent {
      color: var(--primary-color);
      font-weight: 500;
      margin-top: 0.5rem;
    }

    .form-field {
      margin-bottom: 1.5rem;
    }

    .form-field label {
      display: block;
      color: rgba(255, 255, 255, 0.8);
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
    }

    .error-text {
      color: #ef4444;
      font-size: 0.8rem;
      margin-top: 0.25rem;
      display: block;
    }

    .submit-button {
      margin-top: 0.5rem;
      width: 100%;
      height: 48px;
      font-size: 1rem;
      font-weight: 600;
      background: linear-gradient(135deg, var(--primary-color), #2563eb) !important;
      border: none !important;
      border-radius: 8px;
      cursor: pointer;
      display: flex !important;
      align-items: center;
      justify-content: center;
    }

    .submit-button:hover:not(:disabled) {
      opacity: 0.9;
    }

    .submit-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .resend-section {
      margin-top: 2rem;
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.9rem;
    }

    .resend-link {
      color: var(--primary-color);
      cursor: pointer;
      margin-inline-start: 0.5rem;
    }

    .resend-link:hover {
      text-decoration: underline;
    }

    .back-link {
      text-align: center;
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .back-link i {
      color: rgba(255, 255, 255, 0.5);
      margin-inline-end: 0.5rem;
    }

    .back-link a {
      color: rgba(255, 255, 255, 0.7);
      text-decoration: none;
    }

    .back-link a:hover {
      color: var(--primary-color);
    }

    :host ::ng-deep {
      .p-inputtext {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: #ffffff;
        padding-inline-start: 2.5rem;
      }

      .p-inputtext:focus {
        border-color: var(--primary-color);
        box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.2);
      }
    }
  `]
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  private translate = inject(TranslateService);

  isLoading = false;
  emailSent = false;

  forgotForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  onSubmit(): void {
    if (this.forgotForm.invalid) {
      return;
    }

    this.isLoading = true;
    const email = this.forgotForm.get('email')?.value;

    this.authService.forgotPassword(email).subscribe({
      next: () => {
        this.isLoading = false;
        this.emailSent = true;
      },
      error: (err) => {
        this.isLoading = false;
        // Still show success to prevent email enumeration
        this.emailSent = true;
      }
    });
  }

  resendEmail(): void {
    this.emailSent = false;
    this.onSubmit();
  }
}
