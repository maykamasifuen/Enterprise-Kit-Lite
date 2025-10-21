import { Component, OnInit, signal, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { MessageService } from 'primeng/api';
import { ToolbarModule } from 'primeng/toolbar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { TranslateModule } from '@ngx-translate/core';

import { ProfileService, UserProfile, ProfileUpdateRequest, ChangePasswordRequest } from '../services/profile.service';
import { AuthService } from '../services/auth.service';
import { LanguageService } from '../services/language.service';

interface LanguageOption {
  label: string;
  value: string;
  flag: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    PasswordModule,
    ToolbarModule,
    ProgressSpinnerModule,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    SelectModule,
    TagModule,
    TranslateModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit, OnDestroy {
  @ViewChild('avatarInput') avatarInput!: ElementRef<HTMLInputElement>;

  private readonly destroy$ = new Subject<void>();

  readonly loading = signal<boolean>(true);
  readonly savingProfile = signal<boolean>(false);
  readonly changingPassword = signal<boolean>(false);

  activeTabIndex = 0;
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  currentProfile: UserProfile | null = null;
  avatarUrl: string | null = null;
  selectedAvatarFile: File | null = null;

  languageOptions: LanguageOption[] = [
    { label: 'English', value: 'en', flag: '🇺🇸' },
    { label: 'Français (French)', value: 'fr', flag: '🇫🇷' }
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly profileService: ProfileService,
    private readonly authService: AuthService,
    private readonly languageService: LanguageService,
    private readonly messageService: MessageService
  ) {
    this.initForms();
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize reactive forms with validators
   */
  private initForms(): void {
    // Profile form
    this.profileForm = this.fb.group({
      username: [{ value: '', disabled: true }],
      email: [{ value: '', disabled: true }],
      fullName: [''],
      phoneNumber: [''],
      preferredLanguage: ['en', Validators.required]
    });

    // Password form with custom validator
    this.passwordForm = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  /**
   * Custom validator for password matching
   */
  private passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  /**
   * Load user profile from backend
   */
  loadProfile(): void {
    this.loading.set(true);

    // First try to get from AuthService (already loaded user)
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      // Map auth user to profile (partial data)
      this.profileForm.patchValue({
        username: currentUser.username,
        preferredLanguage: this.languageService.currentLanguage()
      });
    }

    // Then fetch full profile from ProfileService
    this.profileService.getProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profile) => {
          this.currentProfile = profile;
          this.profileForm.patchValue({
            username: profile.username,
            email: profile.email,
            fullName: profile.fullName || '',
            phoneNumber: profile.phoneNumber || '',
            preferredLanguage: profile.preferredLanguage || this.languageService.currentLanguage()
          });
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Failed to load profile:', error);
          this.messageService.add({
            severity: 'error',
            summary: this.languageService.instant('COMMON.ERROR'),
            detail: this.languageService.instant('PROFILE.LOAD_FAILED'),
            life: 5000
          });
          this.loading.set(false);
        }
      });
  }

  /**
   * Trigger avatar file input click
   */
  triggerAvatarUpload(): void {
    this.avatarInput.nativeElement.click();
  }

  /**
   * Handle avatar file selection
   */
  onAvatarSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.messageService.add({
          severity: 'error',
          summary: this.languageService.instant('COMMON.ERROR'),
          detail: this.languageService.instant('PROFILE.INVALID_IMAGE'),
          life: 3000
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.messageService.add({
          severity: 'error',
          summary: this.languageService.instant('COMMON.ERROR'),
          detail: this.languageService.instant('PROFILE.IMAGE_TOO_LARGE'),
          life: 3000
        });
        return;
      }

      this.selectedAvatarFile = file;

      // Preview the image
      const reader = new FileReader();
      reader.onload = () => {
        this.avatarUrl = reader.result as string;
      };
      reader.readAsDataURL(file);

      // Mark form as dirty
      this.profileForm.markAsDirty();
    }
  }

  /**
   * Handle language change - immediately update app language
   */
  onLanguageChange(event: { value: string }): void {
    const newLang = event.value;

    // Immediately switch the app language
    this.languageService.switchLanguage(newLang);

    // Show feedback
    this.messageService.add({
      severity: 'info',
      summary: this.languageService.instant('COMMON.INFO'),
      detail: this.languageService.instant('PROFILE.LANGUAGE_CHANGED'),
      life: 2000
    });
  }

  /**
   * Check if a password field is invalid
   */
  isPasswordFieldInvalid(fieldName: string): boolean {
    const field = this.passwordForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  /**
   * Update user profile
   */
  updateProfile(): void {
    if (this.profileForm.invalid) return;

    this.savingProfile.set(true);
    const request: ProfileUpdateRequest = {
      fullName: this.profileForm.get('fullName')?.value || undefined,
      phoneNumber: this.profileForm.get('phoneNumber')?.value || undefined,
      preferredLanguage: this.profileForm.get('preferredLanguage')?.value
    };

    this.profileService.updateProfile(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profile) => {
          this.currentProfile = profile;
          this.profileForm.markAsPristine();
          this.messageService.add({
            severity: 'success',
            summary: this.languageService.instant('COMMON.SUCCESS'),
            detail: this.languageService.instant('PROFILE.PROFILE_UPDATED'),
            life: 3000
          });
          this.savingProfile.set(false);
        },
        error: (error) => {
          console.error('Failed to update profile:', error);
          this.messageService.add({
            severity: 'error',
            summary: this.languageService.instant('COMMON.ERROR'),
            detail: error.error?.message || this.languageService.instant('PROFILE.UPDATE_FAILED'),
            life: 5000
          });
          this.savingProfile.set(false);
        }
      });
  }

  /**
   * Change user password
   */
  changePassword(): void {
    if (this.passwordForm.invalid) return;

    this.changingPassword.set(true);
    const request: ChangePasswordRequest = {
      oldPassword: this.passwordForm.get('oldPassword')?.value,
      newPassword: this.passwordForm.get('newPassword')?.value
    };

    this.profileService.changePassword(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: this.languageService.instant('COMMON.SUCCESS'),
            detail: this.languageService.instant('PROFILE.PASSWORD_CHANGED'),
            life: 3000
          });
          this.resetPasswordForm();
          this.changingPassword.set(false);
        },
        error: (error) => {
          console.error('Failed to change password:', error);
          this.messageService.add({
            severity: 'error',
            summary: this.languageService.instant('COMMON.ERROR'),
            detail: error.error?.message || this.languageService.instant('PROFILE.PASSWORD_CHANGE_FAILED'),
            life: 5000
          });
          this.changingPassword.set(false);
        }
      });
  }

  /**
   * Reset profile form to original values
   */
  resetProfileForm(): void {
    if (this.currentProfile) {
      this.profileForm.patchValue({
        fullName: this.currentProfile.fullName || '',
        phoneNumber: this.currentProfile.phoneNumber || '',
        preferredLanguage: this.currentProfile.preferredLanguage || 'en'
      });
      this.profileForm.markAsPristine();
    }
    this.selectedAvatarFile = null;
    // Reset avatar preview if needed
  }

  /**
   * Reset password form
   */
  resetPasswordForm(): void {
    this.passwordForm.reset();
  }
}
