import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { TranslateModule } from '@ngx-translate/core';

import { AuthService, LoginRequest } from '../services/auth.service';
import { LanguageService } from '../services/language.service';
import { LayoutService } from '../services/layout.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    CardModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    CheckboxModule,
    TranslateModule,
    SelectModule,
    TooltipModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  readonly layoutService = inject(LayoutService);
  get isDark(): boolean { return this.layoutService.isDarkTheme(); }

  loginForm!: FormGroup;
  loading = false;
  rememberMe = false;

  languages = [
    { label: 'English', value: 'en' },
    { label: 'العربية', value: 'ar' },
    { label: 'Français', value: 'fr' }
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly messageService: MessageService,
    private readonly languageService: LanguageService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadRememberedCredentials();
  }

  /**
   * Initialize the login form with validators
   */
  private initForm(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(1)]]
    });
  }

  /**
   * Load remembered credentials from localStorage
   */
  private loadRememberedCredentials(): void {
    const rememberedUsername = localStorage.getItem('remembered_username');
    if (rememberedUsername) {
      this.loginForm.patchValue({ username: rememberedUsername });
      this.rememberMe = true;
    }
  }

  /**
   * Check if a form field is invalid and touched/dirty
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  /**
   * Get current language
   */
  get currentLanguage(): string {
    return this.languageService.currentLanguage();
  }

  /**
   * Handle language change from dropdown
   */
  onLanguageChange(lang: string): void {
    this.languageService.switchLanguage(lang);
  }

  /**
   * Show info toast for social login buttons (not available in Lite)
   */
  showProToast(): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Not Available',
      detail: 'Social Login is not available in this edition.',
      life: 5000
    });
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    // Mark all fields as touched to show validation errors
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });

    if (this.loginForm.invalid || this.loading) {
      return;
    }

    this.loading = true;
    const credentials: LoginRequest = this.loginForm.getRawValue();

    // Handle remember me
    if (this.rememberMe) {
      localStorage.setItem('remembered_username', credentials.username);
    } else {
      localStorage.removeItem('remembered_username');
    }

    this.authService.login(credentials).subscribe({
      next: async () => {
        await this.handleLoginSuccess();
      },
      error: () => {
        this.loading = false;

        // Show error message
        this.messageService.add({
          severity: 'error',
          summary: this.languageService.instant('LOGIN.LOGIN_FAILED'),
          detail: this.languageService.instant('LOGIN.INVALID_CREDENTIALS'),
          life: 5000
        });

        // Clear password field on error
        this.loginForm.get('password')?.reset();
      }
    });
  }

  private async handleLoginSuccess(): Promise<void> {
    this.loading = false;

    // Switch to user's preferred language after login
    const preferredLang = this.authService.getPreferredLanguage();
    const currentLang = this.languageService.currentLanguage();
    console.log('[Login] User preferred language:', preferredLang);
    console.log('[Login] Current app language:', currentLang);

    if (preferredLang && preferredLang !== currentLang) {
      console.log('[Login] Switching language to:', preferredLang);
      this.languageService.switchLanguage(preferredLang);
    }

    // Show success message (use setTimeout to ensure language is applied)
    setTimeout(() => {
      this.messageService.add({
        severity: 'success',
        summary: this.languageService.instant('LOGIN.LOGIN_SUCCESS'),
        detail: this.languageService.instant('LOGIN.WELCOME_BACK'),
        life: 3000
      });
    }, 100);

    // Navigate to return URL or dashboard
    const returnUrl = this.router.parseUrl(this.router.url).queryParams?.['returnUrl'] ?? '/dashboard';
    await this.router.navigateByUrl(returnUrl);
  }
}
