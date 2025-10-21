import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DividerModule } from 'primeng/divider';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '../services/auth.service';
import { LanguageService } from '../services/language.service';
import { LayoutService } from '../services/layout.service';

@Component({
  selector: 'app-register-tenant',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule, RouterLink, TranslateModule,
    CardModule, InputTextModule, PasswordModule, ButtonModule, CheckboxModule,
    ToastModule, DividerModule, SelectModule, TooltipModule
  ],
  providers: [MessageService],
  template: `
    <p-toast />

    <div class="tenant-page" [attr.data-theme]="isDark() ? 'dark' : 'light'">

      <!-- Orbs -->
      <div class="background-effects">
        <div class="gradient-orb orb-1"></div>
        <div class="gradient-orb orb-2"></div>
        <div class="gradient-orb orb-3"></div>
      </div>

      <!-- Top-right: Language + Theme toggle -->
      <div class="auth-top-controls">
        <p-select [options]="languages" [ngModel]="currentLanguage"
          (ngModelChange)="onLanguageChange($event)"
          optionLabel="label" optionValue="value" class="lang-dropdown">
        </p-select>
        <button class="theme-toggle-btn" (click)="layoutService.toggleTheme()"
                [title]="isDark() ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
          <i [class]="isDark() ? 'pi pi-sun' : 'pi pi-moon'"></i>
        </button>
      </div>

      <div class="tenant-scroll">
        <div class="tenant-card">

          <!-- Logo -->
          <div class="logo-section">
            <div class="logo-icon-wrap"><i class="pi pi-building"></i></div>
            <h1>{{ 'AUTH.START_FREE_TRIAL' | translate }}</h1>
            <p class="subtitle">{{ 'AUTH.CREATE_WORKSPACE_SUBTITLE' | translate }}</p>
          </div>

          <!-- Form -->
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">

            <!-- Company Name -->
            <div class="form-field">
              <label for="companyName">{{ 'AUTH.COMPANY_NAME' | translate }}</label>
              <div class="input-wrap">
                <i class="pi pi-briefcase input-icon"></i>
                <input pInputText id="companyName" formControlName="companyName"
                  [placeholder]="'AUTH.COMPANY_NAME_PLACEHOLDER' | translate" class="w-full" />
              </div>
              @if (registerForm.get('companyName')?.touched && registerForm.get('companyName')?.errors?.['required']) {
                <small class="error-text">{{ 'VALIDATION.REQUIRED' | translate }}</small>
              }
            </div>

            <!-- Admin Email -->
            <div class="form-field">
              <label for="adminEmail">{{ 'AUTH.WORK_EMAIL' | translate }}</label>
              <div class="input-wrap">
                <i class="pi pi-envelope input-icon"></i>
                <input pInputText id="adminEmail" type="email" formControlName="adminEmail"
                  [placeholder]="'AUTH.WORK_EMAIL_PLACEHOLDER' | translate" class="w-full" />
              </div>
              @if (registerForm.get('adminEmail')?.touched && registerForm.get('adminEmail')?.errors?.['required']) {
                <small class="error-text">{{ 'VALIDATION.REQUIRED' | translate }}</small>
              }
              @if (registerForm.get('adminEmail')?.touched && registerForm.get('adminEmail')?.errors?.['email']) {
                <small class="error-text">{{ 'VALIDATION.INVALID_EMAIL' | translate }}</small>
              }
            </div>

            <!-- Password -->
            <div class="form-field">
              <label for="adminPassword">{{ 'AUTH.PASSWORD' | translate }}</label>
              <p-password id="adminPassword" formControlName="adminPassword"
                [placeholder]="'AUTH.PASSWORD_PLACEHOLDER' | translate"
                [toggleMask]="true" [feedback]="true"
                styleClass="w-full" inputStyleClass="w-full" />
              @if (registerForm.get('adminPassword')?.touched && registerForm.get('adminPassword')?.errors?.['required']) {
                <small class="error-text">{{ 'VALIDATION.REQUIRED' | translate }}</small>
              }
              @if (registerForm.get('adminPassword')?.touched && registerForm.get('adminPassword')?.errors?.['minlength']) {
                <small class="error-text">{{ 'VALIDATION.MIN_LENGTH' | translate: {min: 8} }}</small>
              }
            </div>

            <!-- Confirm Password -->
            <div class="form-field">
              <label for="confirmPassword">{{ 'AUTH.CONFIRM_PASSWORD' | translate }}</label>
              <p-password id="confirmPassword" formControlName="confirmPassword"
                [placeholder]="'AUTH.CONFIRM_PASSWORD_PLACEHOLDER' | translate"
                [toggleMask]="true" [feedback]="false"
                styleClass="w-full" inputStyleClass="w-full" />
              @if (registerForm.get('confirmPassword')?.touched && registerForm.errors?.['passwordMismatch']) {
                <small class="error-text">{{ 'VALIDATION.PASSWORD_MISMATCH' | translate }}</small>
              }
            </div>

            <p-button type="submit"
              [label]="'AUTH.CREATE_WORKSPACE' | translate"
              [loading]="isLoading"
              [disabled]="registerForm.invalid || isLoading"
              styleClass="w-full register-button" />
          </form>

          <p-divider align="center">
            <span class="divider-text">{{ 'AUTH.OR' | translate }}</span>
          </p-divider>

          <div class="auth-link">
            <span>{{ 'AUTH.ALREADY_HAVE_ACCOUNT' | translate }}</span>
            <a routerLink="/login">{{ 'AUTH.LOGIN' | translate }}</a>
          </div>

          <div class="auth-link register-link">
            <span>{{ 'AUTH.WANT_PERSONAL_ACCOUNT' | translate }}</span>
            <a routerLink="/register">{{ 'AUTH.REGISTER' | translate }}</a>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    .tenant-page {
      --tp-bg:         #f0f4ff;
      --tp-orb1:       rgba(34,197,94,0.18);
      --tp-orb2:       rgba(99,102,241,0.2);
      --tp-orb3:       rgba(59,130,246,0.15);
      --tp-card-bg:    rgba(255,255,255,0.9);
      --tp-card-bdr:   rgba(34,197,94,0.18);
      --tp-text:       #1e293b;
      --tp-text-sub:   #64748b;
      --tp-text-muted: #94a3b8;
      --tp-input-bg:   rgba(34,197,94,0.04);
      --tp-input-bdr:  #e2e8f0;
      --tp-divider:    #e2e8f0;
      --tp-accent:     #6366f1;
      --tp-accent2:    #22c55e;
      --tp-error:      #ef4444;
      --tp-ctrl-bg:    rgba(255,255,255,0.92);
      --tp-ctrl-bdr:   rgba(34,197,94,0.2);
      --tp-toggle-bg:  rgba(255,255,255,0.8);
      --tp-toggle-clr: #475569;
    }
    .tenant-page[data-theme="dark"] {
      --tp-bg:         #0a0a0f;
      --tp-orb1:       rgba(34,197,94,0.22);
      --tp-orb2:       rgba(99,102,241,0.35);
      --tp-orb3:       rgba(59,130,246,0.2);
      --tp-card-bg:    rgba(18,25,18,0.88);
      --tp-card-bdr:   rgba(255,255,255,0.08);
      --tp-text:       #f1f5f9;
      --tp-text-sub:   rgba(255,255,255,0.65);
      --tp-text-muted: rgba(255,255,255,0.4);
      --tp-input-bg:   rgba(255,255,255,0.05);
      --tp-input-bdr:  rgba(255,255,255,0.12);
      --tp-divider:    rgba(255,255,255,0.1);
      --tp-accent:     #818cf8;
      --tp-accent2:    #4ade80;
      --tp-error:      #f87171;
      --tp-ctrl-bg:    rgba(18,25,18,0.92);
      --tp-ctrl-bdr:   rgba(255,255,255,0.12);
      --tp-toggle-bg:  rgba(255,255,255,0.08);
      --tp-toggle-clr: rgba(255,255,255,0.7);
    }

    .tenant-page {
      min-height: 100vh; display: flex; flex-direction: column;
      background: var(--tp-bg); position: relative; overflow: hidden;
      transition: background-color 0.3s ease;
    }

    .background-effects { position: fixed; inset: 0; overflow: hidden; pointer-events: none; z-index: 0; }
    .gradient-orb { position: absolute; border-radius: 50%; filter: blur(80px); animation: float 20s ease-in-out infinite; }
    .orb-1 { width: 500px; height: 500px; background: radial-gradient(circle, var(--tp-orb1) 0%, transparent 70%); top: -100px; right: -100px; }
    .orb-2 { width: 500px; height: 500px; background: radial-gradient(circle, var(--tp-orb2) 0%, transparent 70%); bottom: -100px; left: -100px; animation-delay: -8s; }
    .orb-3 { width: 300px; height: 300px; background: radial-gradient(circle, var(--tp-orb3) 0%, transparent 70%); top: 50%; left: 50%; animation-delay: -15s; }
    @keyframes float {
      0%,100% { transform: translate(0,0) scale(1); }
      33%     { transform: translate(20px,-20px) scale(1.04); }
      66%     { transform: translate(-15px,15px) scale(0.97); }
    }

    .auth-top-controls {
      position: fixed; top: 1.25rem;
      inset-inline-end: 1.5rem;
      z-index: 200;
      display: flex; align-items: center; gap: 0.5rem;
      background: var(--tp-ctrl-bg); border: 1px solid var(--tp-ctrl-bdr);
      border-radius: 12px; padding: 0.35rem 0.5rem;
      backdrop-filter: blur(12px); box-shadow: 0 2px 12px rgba(0,0,0,0.1);
      transition: background 0.2s, border-color 0.2s;
    }

    .theme-toggle-btn {
      width: 2rem; height: 2rem; border: none;
      background: var(--tp-toggle-bg); border-radius: 8px; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      color: var(--tp-toggle-clr); font-size: 0.95rem;
      transition: background 0.15s, color 0.15s;
    }
    .theme-toggle-btn:hover { background: var(--tp-accent); color: #fff; }

    .tenant-scroll {
      position: relative; z-index: 1; flex: 1;
      display: flex; align-items: center; justify-content: center;
      padding: 5rem 1.5rem 2rem;
    }

    .tenant-card {
      width: 100%; max-width: 460px;
      background: var(--tp-card-bg); border: 1px solid var(--tp-card-bdr);
      border-radius: 20px; padding: 2.5rem;
      backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
      box-shadow: 0 20px 50px rgba(0,0,0,0.15);
      transition: background 0.3s, border-color 0.3s;
    }

    .logo-section { text-align: center; margin-bottom: 1.75rem; }
    .logo-icon-wrap {
      width: 64px; height: 64px; margin: 0 auto 1rem;
      background: linear-gradient(135deg, var(--tp-accent2), var(--tp-accent));
      border-radius: 16px; display: flex; align-items: center; justify-content: center;
      box-shadow: 0 8px 32px rgba(34,197,94,0.3);
    }
    .logo-icon-wrap i { font-size: 1.75rem; color: #fff; }
    .logo-section h1 { color: var(--tp-text); font-size: 1.5rem; font-weight: 700; margin: 0 0 0.25rem; transition: color 0.2s; }
    .subtitle { color: var(--tp-text-sub); font-size: 0.875rem; margin: 0; transition: color 0.2s; }

    .form-field { margin-bottom: 1.1rem; }
    .form-field label { display: block; margin-bottom: 0.4rem; font-size: 0.875rem; font-weight: 500; color: var(--tp-text-sub); }

    .input-wrap { position: relative; }
    .input-icon {
      position: absolute;
      inset-inline-start: 0.875rem;
      top: 50%; transform: translateY(-50%);
      color: var(--tp-text-muted); font-size: 0.9rem; pointer-events: none; z-index: 1;
    }

    :host ::ng-deep .p-inputtext {
      width: 100%;
      padding: 0.75rem 1rem;
      padding-inline-start: 2.5rem;
      background: var(--tp-input-bg) !important;
      border: 1px solid var(--tp-input-bdr) !important;
      color: var(--tp-text) !important; border-radius: 10px; font-size: 0.9rem;
      transition: border-color 0.2s, background 0.2s, color 0.2s;
    }
    :host ::ng-deep .p-inputtext::placeholder { color: var(--tp-text-muted) !important; }
    :host ::ng-deep .p-inputtext:hover { border-color: var(--tp-accent) !important; }
    :host ::ng-deep .p-inputtext:focus { border-color: var(--tp-accent) !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.15) !important; outline: none; }
    :host ::ng-deep .p-password { width: 100%; }
    :host ::ng-deep .p-password .p-inputtext { padding-inline-start: 1rem !important; }
    :host ::ng-deep .p-select {
      background: var(--tp-input-bg) !important;
      border: 1px solid var(--tp-input-bdr) !important;
    }
    :host ::ng-deep .p-select .p-select-label { color: var(--tp-text) !important; }

    .error-text { color: var(--tp-error); font-size: 0.78rem; margin-top: 0.25rem; display: block; }

    :host ::ng-deep .register-button {
      margin-top: 1.25rem; height: 48px; font-size: 1rem; font-weight: 600;
      background: linear-gradient(135deg, var(--tp-accent2), var(--tp-accent)) !important;
      border: none !important; border-radius: 10px;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    :host ::ng-deep .register-button:hover:not(:disabled) {
      transform: translateY(-2px); box-shadow: 0 8px 24px rgba(34,197,94,0.3) !important;
    }

    .divider-text { color: var(--tp-text-muted); font-size: 0.83rem; }
    :host ::ng-deep .p-divider .p-divider-content { background: transparent !important; }
    :host ::ng-deep .p-divider::before { border-color: var(--tp-divider) !important; }

    .auth-link { text-align: center; margin-top: 0.875rem; font-size: 0.875rem; color: var(--tp-text-sub); }
    .auth-link a { color: var(--tp-accent); text-decoration: none; font-weight: 500; margin-inline-start: 0.4rem; }
    .auth-link a:hover { text-decoration: underline; }
    .register-link { margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid var(--tp-divider); }

    :host ::ng-deep .lang-dropdown { font-size: 0.83rem; }
    :host ::ng-deep .lang-dropdown .p-select-label { font-size: 0.83rem; }

    @media (max-width: 480px) {
      .tenant-card { padding: 1.75rem 1.25rem; }
      .tenant-scroll { padding-top: 4.5rem; }
      .auth-top-controls { top: 0.75rem; inset-inline-end: 0.75rem; }
    }
  `]
})
export class RegisterTenantComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private translate = inject(TranslateService);
  private languageService = inject(LanguageService);
  readonly layoutService = inject(LayoutService);
  readonly isDark = computed(() => this.layoutService.isDarkTheme());

  isLoading = false;



  languages = [
    { label: 'English', value: 'en' },
    { label: 'العربية', value: 'ar' },
    { label: 'Français', value: 'fr' }
  ];

  get currentLanguage(): string { return this.languageService.currentLanguage(); }
  onLanguageChange(lang: string): void { this.languageService.switchLanguage(lang); }

  registerForm: FormGroup = this.fb.group({
    companyName: ['', [Validators.required, Validators.minLength(2)]],
    adminEmail: ['', [Validators.required, Validators.email]],
    adminPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const pw = control.get('adminPassword');
    const cpw = control.get('confirmPassword');
    return pw && cpw && pw.value !== cpw.value ? { passwordMismatch: true } : null;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) { this.registerForm.markAllAsTouched(); return; }
    this.isLoading = true;
    const { companyName, adminEmail, adminPassword } = this.registerForm.value;
    this.authService.registerTenant({ companyName, adminEmail, adminPassword }).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: this.translate.instant('AUTH.REGISTER_SUCCESS'), detail: this.translate.instant('AUTH.REGISTER_SUCCESS_DETAIL') });
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        this.isLoading = false;
        this.messageService.add({ severity: 'error', summary: this.translate.instant('AUTH.REGISTER_ERROR'), detail: err.error?.message || this.translate.instant('AUTH.REGISTER_ERROR_DETAIL') });
      }
    });
  }
}
