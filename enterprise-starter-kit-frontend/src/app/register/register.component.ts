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
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule, RouterLink, TranslateModule,
    CardModule, InputTextModule, PasswordModule, ButtonModule, CheckboxModule,
    ToastModule, DividerModule, SelectModule, TooltipModule
  ],
  providers: [MessageService],
  template: `
    <p-toast />

    <div class="register-page" [attr.data-theme]="isDark() ? 'dark' : 'light'">

      <!-- Background orbs -->
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

      <div class="register-scroll">
        <div class="register-card">

          <!-- Logo -->
          <div class="logo-section">
            <div class="logo-icon-wrap"><i class="pi pi-building"></i></div>
            <h1>{{ 'AUTH.CREATE_ACCOUNT' | translate }}</h1>
            <p class="subtitle">{{ 'AUTH.REGISTER_SUBTITLE' | translate }}</p>
          </div>

          <!-- Form -->
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">

            <!-- Full Name -->
            <div class="form-field">
              <label for="fullName">{{ 'AUTH.FULL_NAME' | translate }}</label>
              <div class="input-wrap">
                <i class="pi pi-user input-icon"></i>
                <input pInputText id="fullName" formControlName="fullName"
                  [placeholder]="'AUTH.FULL_NAME_PLACEHOLDER' | translate" class="w-full" />
              </div>
              @if (registerForm.get('fullName')?.touched && registerForm.get('fullName')?.errors?.['required']) {
                <small class="error-text">{{ 'VALIDATION.REQUIRED' | translate }}</small>
              }
            </div>

            <!-- Username -->
            <div class="form-field">
              <label for="username">{{ 'AUTH.USERNAME' | translate }}</label>
              <div class="input-wrap">
                <i class="pi pi-at input-icon"></i>
                <input pInputText id="username" formControlName="username"
                  [placeholder]="'AUTH.USERNAME_PLACEHOLDER' | translate" class="w-full" />
              </div>
              @if (registerForm.get('username')?.touched && registerForm.get('username')?.errors?.['required']) {
                <small class="error-text">{{ 'VALIDATION.REQUIRED' | translate }}</small>
              }
              @if (registerForm.get('username')?.touched && registerForm.get('username')?.errors?.['minlength']) {
                <small class="error-text">{{ 'VALIDATION.MIN_LENGTH' | translate: {min: 3} }}</small>
              }
            </div>

            <!-- Email -->
            <div class="form-field">
              <label for="email">{{ 'AUTH.EMAIL' | translate }}</label>
              <div class="input-wrap">
                <i class="pi pi-envelope input-icon"></i>
                <input pInputText id="email" type="email" formControlName="email"
                  [placeholder]="'AUTH.EMAIL_PLACEHOLDER' | translate" class="w-full" />
              </div>
              @if (registerForm.get('email')?.touched && registerForm.get('email')?.errors?.['required']) {
                <small class="error-text">{{ 'VALIDATION.REQUIRED' | translate }}</small>
              }
              @if (registerForm.get('email')?.touched && registerForm.get('email')?.errors?.['email']) {
                <small class="error-text">{{ 'VALIDATION.INVALID_EMAIL' | translate }}</small>
              }
            </div>

            <!-- Password -->
            <div class="form-field">
              <label for="password">{{ 'AUTH.PASSWORD' | translate }}</label>
              <p-password id="password" formControlName="password"
                [placeholder]="'AUTH.PASSWORD_PLACEHOLDER' | translate"
                [toggleMask]="true" [feedback]="true"
                styleClass="w-full" inputStyleClass="w-full"
                [promptLabel]="'AUTH.PASSWORD_PROMPT' | translate"
                [weakLabel]="'AUTH.PASSWORD_WEAK' | translate"
                [mediumLabel]="'AUTH.PASSWORD_MEDIUM' | translate"
                [strongLabel]="'AUTH.PASSWORD_STRONG' | translate" />
              @if (registerForm.get('password')?.touched && registerForm.get('password')?.errors?.['required']) {
                <small class="error-text">{{ 'VALIDATION.REQUIRED' | translate }}</small>
              }
              @if (registerForm.get('password')?.touched && registerForm.get('password')?.errors?.['minlength']) {
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
              @if (registerForm.get('confirmPassword')?.touched && registerForm.get('confirmPassword')?.errors?.['required']) {
                <small class="error-text">{{ 'VALIDATION.REQUIRED' | translate }}</small>
              }
              @if (registerForm.get('confirmPassword')?.touched && registerForm.errors?.['passwordMismatch']) {
                <small class="error-text">{{ 'VALIDATION.PASSWORD_MISMATCH' | translate }}</small>
              }
            </div>

            <!-- Terms -->
            <div class="form-field terms-field">
              <p-checkbox formControlName="acceptTerms" [binary]="true" inputId="acceptTerms" />
              <label for="acceptTerms" class="terms-label">
                {{ 'AUTH.ACCEPT_TERMS_PREFIX' | translate }}
                <a href="/terms" target="_blank">{{ 'AUTH.TERMS_CONDITIONS' | translate }}</a>
                {{ 'AUTH.AND' | translate }}
                <a href="/privacy" target="_blank">{{ 'AUTH.PRIVACY_POLICY' | translate }}</a>
              </label>
            </div>
            @if (registerForm.get('acceptTerms')?.touched && registerForm.get('acceptTerms')?.errors?.['requiredTrue']) {
              <small class="error-text">{{ 'VALIDATION.ACCEPT_TERMS' | translate }}</small>
            }

            <p-button type="submit"
              [label]="'AUTH.CREATE_ACCOUNT' | translate"
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

          <div class="auth-link company-link">
            <span>{{ 'AUTH.WANT_TO_REGISTER_COMPANY' | translate }}</span>
            <a routerLink="/register-tenant">{{ 'AUTH.REGISTER_COMPANY' | translate }}</a>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    /* ── Theme tokens ── */
    .register-page {
      --rp-bg:         #f0f4ff;
      --rp-orb1:       rgba(99,102,241,0.22);
      --rp-orb2:       rgba(139,92,246,0.18);
      --rp-orb3:       rgba(59,130,246,0.15);
      --rp-card-bg:    rgba(255,255,255,0.9);
      --rp-card-bdr:   rgba(99,102,241,0.15);
      --rp-text:       #1e293b;
      --rp-text-sub:   #64748b;
      --rp-text-muted: #94a3b8;
      --rp-input-bg:   rgba(99,102,241,0.04);
      --rp-input-bdr:  #e2e8f0;
      --rp-divider:    #e2e8f0;
      --rp-accent:     #6366f1;
      --rp-accent2:    #8b5cf6;
      --rp-error:      #ef4444;
      --rp-ctrl-bg:    rgba(255,255,255,0.92);
      --rp-ctrl-bdr:   rgba(99,102,241,0.2);
      --rp-toggle-bg:  rgba(255,255,255,0.8);
      --rp-toggle-clr: #475569;
    }

    .register-page[data-theme="dark"] {
      --rp-bg:         #0a0a0f;
      --rp-orb1:       rgba(99,102,241,0.38);
      --rp-orb2:       rgba(139,92,246,0.28);
      --rp-orb3:       rgba(59,130,246,0.22);
      --rp-card-bg:    rgba(22,22,35,0.88);
      --rp-card-bdr:   rgba(255,255,255,0.08);
      --rp-text:       #f1f5f9;
      --rp-text-sub:   rgba(255,255,255,0.65);
      --rp-text-muted: rgba(255,255,255,0.4);
      --rp-input-bg:   rgba(255,255,255,0.05);
      --rp-input-bdr:  rgba(255,255,255,0.12);
      --rp-divider:    rgba(255,255,255,0.1);
      --rp-accent:     #818cf8;
      --rp-accent2:    #a78bfa;
      --rp-error:      #f87171;
      --rp-ctrl-bg:    rgba(22,22,40,0.92);
      --rp-ctrl-bdr:   rgba(255,255,255,0.12);
      --rp-toggle-bg:  rgba(255,255,255,0.08);
      --rp-toggle-clr: rgba(255,255,255,0.7);
    }

    /* ── Shell ── */
    .register-page {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: var(--rp-bg);
      position: relative;
      overflow: hidden;
      transition: background-color 0.3s ease;
    }

    /* ── Orbs ── */
    .background-effects {
      position: fixed; inset: 0;
      overflow: hidden; pointer-events: none; z-index: 0;
    }
    .gradient-orb { position: absolute; border-radius: 50%; filter: blur(80px); animation: float 20s ease-in-out infinite; }
    .orb-1 { width: 600px; height: 600px; background: radial-gradient(circle, var(--rp-orb1) 0%, transparent 70%); top: -150px; left: -150px; }
    .orb-2 { width: 500px; height: 500px; background: radial-gradient(circle, var(--rp-orb2) 0%, transparent 70%); bottom: -100px; right: -100px; animation-delay: -7s; }
    .orb-3 { width: 350px; height: 350px; background: radial-gradient(circle, var(--rp-orb3) 0%, transparent 70%); top: 40%; left: 60%; animation-delay: -14s; }
    @keyframes float {
      0%,100% { transform: translate(0,0) scale(1); }
      33%     { transform: translate(20px,-20px) scale(1.04); }
      66%     { transform: translate(-15px,15px) scale(0.97); }
    }

    /* ── Top controls ── */
    .auth-top-controls {
      position: fixed; top: 1.25rem;
      inset-inline-end: 1.5rem;
      z-index: 200;
      display: flex; align-items: center; gap: 0.5rem;
      background: var(--rp-ctrl-bg); border: 1px solid var(--rp-ctrl-bdr);
      border-radius: 12px; padding: 0.35rem 0.5rem;
      backdrop-filter: blur(12px); box-shadow: 0 2px 12px rgba(0,0,0,0.1);
      transition: background 0.2s, border-color 0.2s;
    }

    .theme-toggle-btn {
      width: 2rem; height: 2rem; border: none;
      background: var(--rp-toggle-bg); border-radius: 8px; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      color: var(--rp-toggle-clr); font-size: 0.95rem;
      transition: background 0.15s, color 0.15s;
    }
    .theme-toggle-btn:hover { background: var(--rp-accent); color: #fff; }

    /* ── Scroll wrapper + card ── */
    .register-scroll {
      position: relative; z-index: 1;
      flex: 1; display: flex; align-items: center; justify-content: center;
      padding: 5rem 1.5rem 2rem;
    }

    .register-card {
      width: 100%; max-width: 460px;
      background: var(--rp-card-bg);
      border: 1px solid var(--rp-card-bdr);
      border-radius: 20px; padding: 2.5rem;
      backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
      box-shadow: 0 20px 50px rgba(0,0,0,0.15);
      transition: background 0.3s, border-color 0.3s;
    }

    /* ── Logo ── */
    .logo-section { text-align: center; margin-bottom: 1.75rem; }
    .logo-icon-wrap {
      width: 64px; height: 64px; margin: 0 auto 1rem;
      background: linear-gradient(135deg, var(--rp-accent), var(--rp-accent2));
      border-radius: 16px; display: flex; align-items: center; justify-content: center;
      box-shadow: 0 8px 32px rgba(99,102,241,0.3);
    }
    .logo-icon-wrap i { font-size: 1.75rem; color: #fff; }
    .logo-section h1 { color: var(--rp-text); font-size: 1.5rem; font-weight: 700; margin: 0 0 0.25rem; transition: color 0.2s; }
    .subtitle { color: var(--rp-text-sub); font-size: 0.875rem; margin: 0; transition: color 0.2s; }

    /* ── Form fields ── */
    .form-field { margin-bottom: 1.1rem; }
    .form-field label {
      display: block; margin-bottom: 0.4rem;
      font-size: 0.875rem; font-weight: 500;
      color: var(--rp-text-sub); transition: color 0.2s;
    }

    .input-wrap { position: relative; }
    .input-icon {
      position: absolute;
      inset-inline-start: 0.875rem;
      top: 50%; transform: translateY(-50%);
      color: var(--rp-text-muted); font-size: 0.9rem; pointer-events: none; z-index: 1;
    }

    :host ::ng-deep .p-inputtext {
      width: 100%;
      padding: 0.75rem 1rem;
      padding-inline-start: 2.5rem;
      background: var(--rp-input-bg) !important;
      border: 1px solid var(--rp-input-bdr) !important;
      color: var(--rp-text) !important;
      border-radius: 10px; font-size: 0.9rem;
      transition: border-color 0.2s, background 0.2s, color 0.2s;
    }
    :host ::ng-deep .p-inputtext::placeholder { color: var(--rp-text-muted) !important; }
    :host ::ng-deep .p-inputtext:hover { border-color: var(--rp-accent) !important; }
    :host ::ng-deep .p-inputtext:focus { border-color: var(--rp-accent) !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.15) !important; outline: none; }

    :host ::ng-deep .p-password { width: 100%; }
    :host ::ng-deep .p-password .p-inputtext { padding-inline-start: 1rem !important; }
    :host ::ng-deep .p-password-meter-container { background: var(--rp-input-bg) !important; }

    :host ::ng-deep .p-checkbox .p-checkbox-box {
      background: var(--rp-input-bg); border-color: var(--rp-input-bdr); border-radius: 5px;
    }
    :host ::ng-deep .p-checkbox .p-checkbox-box.p-highlight { background: var(--rp-accent); border-color: var(--rp-accent); }

    .error-text { color: var(--rp-error); font-size: 0.78rem; margin-top: 0.25rem; display: block; }

    .terms-field { display: flex; align-items: flex-start; gap: 0.75rem; }
    .terms-label { font-size: 0.83rem; color: var(--rp-text-sub); line-height: 1.5; }
    .terms-label a { color: var(--rp-accent); text-decoration: none; }
    .terms-label a:hover { text-decoration: underline; }

    :host ::ng-deep .register-button {
      margin-top: 1.25rem; height: 48px;
      font-size: 1rem; font-weight: 600;
      background: linear-gradient(135deg, var(--rp-accent), var(--rp-accent2)) !important;
      border: none !important; border-radius: 10px;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    :host ::ng-deep .register-button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(99,102,241,0.35) !important;
    }

    /* ── Divider ── */
    .divider-text { color: var(--rp-text-muted); font-size: 0.83rem; }
    :host ::ng-deep .p-divider .p-divider-content { background: transparent !important; }
    :host ::ng-deep .p-divider::before { border-color: var(--rp-divider) !important; }

    /* ── Auth links ── */
    .auth-link {
      text-align: center; margin-top: 0.875rem;
      font-size: 0.875rem; color: var(--rp-text-sub);
    }
    .auth-link a {
      color: var(--rp-accent); text-decoration: none;
      font-weight: 500; margin-inline-start: 0.4rem;
    }
    .auth-link a:hover { text-decoration: underline; }

    .company-link {
      margin-top: 0.75rem; padding-top: 0.75rem;
      border-top: 1px solid var(--rp-divider);
    }

    /* ── Language dropdown style ── */
    :host ::ng-deep .lang-dropdown { font-size: 0.83rem; }
    :host ::ng-deep .lang-dropdown .p-select-label { font-size: 0.83rem; }

    /* ── Responsive ── */
    @media (max-width: 480px) {
      .register-card { padding: 1.75rem 1.25rem; }
      .register-scroll { padding-top: 4.5rem; }
      .auth-top-controls { top: 0.75rem; inset-inline-end: 0.75rem; }
    }
  `]
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private translate = inject(TranslateService);
  private languageService = inject(LanguageService);
  readonly layoutService = inject(LayoutService);
  readonly isDark = computed(() => this.layoutService.isDarkTheme());

  isLoading = false;

  registerForm: FormGroup = this.fb.group({
    fullName: ['', [Validators.required]],
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
    acceptTerms: [false, [Validators.requiredTrue]]
  }, { validators: this.passwordMatchValidator });

  languages = [
    { label: 'English', value: 'en' },
    { label: 'العربية', value: 'ar' },
    { label: 'Français', value: 'fr' }
  ];

  get currentLanguage(): string { return this.languageService.currentLanguage(); }
  onLanguageChange(lang: string): void { this.languageService.switchLanguage(lang); }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const pw = control.get('password');
    const cpw = control.get('confirmPassword');
    return pw && cpw && pw.value !== cpw.value ? { passwordMismatch: true } : null;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) { this.registerForm.markAllAsTouched(); return; }
    this.isLoading = true;
    const { fullName, username, email, password } = this.registerForm.value;
    this.authService.register({ fullName, username, email, password }).subscribe({
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
