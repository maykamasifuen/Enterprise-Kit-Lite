import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
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
import { MultiSelectModule } from 'primeng/multiselect';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';

import { UserManagementService, ManagedUser } from '../../services/user-management.service';
import { AuthService } from '../../services/auth.service';
import { RoleBadgeComponent } from '../../components/role-badge/role-badge.component';

@Component({
  selector: 'app-users-list',
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
    MultiSelectModule,
    PasswordModule,
    CheckboxModule,
    TooltipModule,
    RoleBadgeComponent
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast />
    <p-confirmDialog />

    <div class="admin-container">
      <p-card>
        <ng-template pTemplate="header">
          <p-toolbar>
            <ng-template pTemplate="start">
              <h2>{{ 'ADMIN.USERS.TITLE' | translate }}</h2>
              @if (tenantFilter()) {
                <p-tag [value]="'Tenant: ' + tenantFilter()" severity="info" class="ml-2" />
              }
            </ng-template>
            <ng-template pTemplate="end">
              <p-button
                [label]="'ADMIN.USERS.ADD_USER' | translate"
                icon="pi pi-plus"
                (onClick)="openCreateDialog()" />
            </ng-template>
          </p-toolbar>
        </ng-template>

        <p-table
          [value]="users()"
          [paginator]="true"
          [rows]="10"
          [loading]="loading()"
          [rowsPerPageOptions]="[5, 10, 25]"
          styleClass="p-datatable-striped">
          <ng-template pTemplate="header">
            <tr>
              <th>{{ 'ADMIN.USERS.USERNAME' | translate }}</th>
              <th>{{ 'ADMIN.USERS.EMAIL' | translate }}</th>
              <th>{{ 'ADMIN.USERS.FULL_NAME' | translate }}</th>
              <th>{{ 'ADMIN.USERS.ROLES' | translate }}</th>
              @if (isSuperAdmin()) {
                <th>{{ 'ADMIN.USERS.TENANT' | translate }}</th>
              }
              <th>{{ 'ADMIN.USERS.STATUS' | translate }}</th>
              <th>{{ 'ADMIN.USERS.CREATED_AT' | translate }}</th>
              <th>{{ 'COMMON.ACTIONS' | translate }}</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-user>
            <tr>
              <td><strong>{{ user.username }}</strong></td>
              <td>{{ user.email }}</td>
              <td>{{ user.fullName || '-' }}</td>
              <td>
                @for (role of user.roles; track role) {
                  <app-role-badge [role]="role" class="mr-1" />
                }
              </td>
              @if (isSuperAdmin()) {
                <td><code>{{ user.tenantId }}</code></td>
              }
              <td>
                <p-tag
                  [value]="user.isEnabled ? ('ADMIN.USERS.ENABLED' | translate) : ('ADMIN.USERS.DISABLED' | translate)"
                  [severity]="user.isEnabled ? 'success' : 'danger'" />
              </td>
              <td>{{ user.createdAt | date:'short' }}</td>
              <td>
                <div class="action-buttons">
                  <p-button icon="pi pi-user-edit" [rounded]="true" [text]="true"
                    (onClick)="openEditDialog(user)" [pTooltip]="'ADMIN.USERS.EDIT_USER' | translate" />
                  <p-button icon="pi pi-id-card" [rounded]="true" [text]="true" severity="secondary"
                    (onClick)="openRolesDialog(user)" [pTooltip]="'ADMIN.USERS.ASSIGN_ROLES' | translate" />
                  <p-button icon="pi pi-key" [rounded]="true" [text]="true" severity="secondary"
                    (onClick)="openPasswordDialog(user)" [pTooltip]="'ADMIN.USERS.RESET_PASSWORD' | translate" />
                  <p-button
                    [icon]="user.isEnabled ? 'pi pi-lock' : 'pi pi-unlock'"
                    [rounded]="true" [text]="true"
                    [severity]="user.isEnabled ? 'warn' : 'success'"
                    (onClick)="confirmToggleStatus(user)"
                    [pTooltip]="user.isEnabled ? ('ADMIN.USERS.DEACTIVATE' | translate) : ('ADMIN.USERS.ACTIVATE' | translate)"
                    [disabled]="!canModify(user)" />
                  <p-button icon="pi pi-trash" [rounded]="true" [text]="true" severity="danger"
                    (onClick)="confirmDelete(user)" [pTooltip]="'COMMON.DELETE' | translate"
                    [disabled]="!canModify(user)" />
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td [attr.colspan]="isSuperAdmin() ? 8 : 7" class="text-center">{{ 'ADMIN.USERS.NO_USERS' | translate }}</td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>
    </div>

    <!-- Create User Dialog -->
    <p-dialog
      [header]="'ADMIN.USERS.ADD_USER' | translate"
      [(visible)]="createDialogVisible"
      [modal]="true"
      [style]="{ width: '500px' }">
      <form [formGroup]="userForm">
        <div class="form-stack">
          <div class="form-field">
            <label>{{ 'ADMIN.USERS.USERNAME' | translate }} *</label>
            <input pInputText formControlName="username" class="w-full" />
          </div>
          <div class="form-field">
            <label>{{ 'ADMIN.USERS.EMAIL' | translate }} *</label>
            <input pInputText formControlName="email" type="email" class="w-full" />
          </div>
          <div class="form-field">
            <label>{{ 'AUTH.PASSWORD' | translate }} *</label>
            <p-password formControlName="password" [toggleMask]="true" styleClass="w-full" />
          </div>
          <div class="form-field">
            <label>{{ 'ADMIN.USERS.FULL_NAME' | translate }}</label>
            <input pInputText formControlName="fullName" class="w-full" />
          </div>
          <div class="form-field">
            <label>{{ 'ADMIN.USERS.PHONE' | translate }}</label>
            <input pInputText formControlName="phoneNumber" class="w-full" />
          </div>
          <div class="form-field">
            <label>{{ 'ADMIN.USERS.ROLES' | translate }}</label>
            <p-multiSelect
              formControlName="roles"
              [options]="availableRoles()"
              optionLabel="label"
              optionValue="value"
              [placeholder]="'ADMIN.USERS.SELECT_ROLES' | translate"
              class="w-full" />
          </div>
        </div>
      </form>
      <ng-template pTemplate="footer">
        <p-button [label]="'COMMON.CANCEL' | translate" severity="secondary" (onClick)="createDialogVisible = false" />
        <p-button [label]="'COMMON.SAVE' | translate" (onClick)="createUser()" [disabled]="userForm.invalid" />
      </ng-template>
    </p-dialog>

    <!-- Edit User Dialog -->
    <p-dialog
      [header]="'ADMIN.USERS.EDIT_USER' | translate"
      [(visible)]="editDialogVisible"
      [modal]="true"
      [style]="{ width: '480px' }">
      <form [formGroup]="editForm">
        <div class="form-stack">
          <div class="form-field">
            <label>{{ 'ADMIN.USERS.FULL_NAME' | translate }}</label>
            <input pInputText formControlName="fullName" class="w-full" />
          </div>
          <div class="form-field">
            <label>{{ 'ADMIN.USERS.EMAIL' | translate }}</label>
            <input pInputText formControlName="email" type="email" class="w-full" />
          </div>
          <div class="form-field">
            <label>{{ 'ADMIN.USERS.PHONE' | translate }}</label>
            <input pInputText formControlName="phoneNumber" class="w-full" />
          </div>
          <div class="form-field form-field--row">
            <p-checkbox formControlName="isActive" [binary]="true" inputId="isActiveCheck"></p-checkbox>
            <label for="isActiveCheck" class="toggle-label">
              {{ 'ADMIN.USERS.STATUS' | translate }}: {{ editForm.get('isActive')?.value ? ('ADMIN.USERS.ENABLED' | translate) : ('ADMIN.USERS.DISABLED' | translate) }}
            </label>
          </div>
        </div>
      </form>
      <ng-template pTemplate="footer">
        <p-button [label]="'COMMON.CANCEL' | translate" severity="secondary" (onClick)="editDialogVisible = false" />
        <p-button [label]="'COMMON.SAVE' | translate" (onClick)="updateUser()" [disabled]="editForm.invalid" />
      </ng-template>
    </p-dialog>

    <!-- Edit Roles Dialog -->
    <p-dialog
      [header]="'ADMIN.USERS.ASSIGN_ROLES' | translate"
      [(visible)]="rolesDialogVisible"
      [modal]="true"
      [style]="{ width: '400px' }">
      <div class="form-field">
        <label>{{ 'ADMIN.USERS.ROLES' | translate }}</label>
        <p-multiSelect
          [(ngModel)]="selectedRoles"
          [options]="availableRoles()"
          optionLabel="label"
          optionValue="value"
          class="w-full" />
      </div>
      <ng-template pTemplate="footer">
        <p-button [label]="'COMMON.CANCEL' | translate" severity="secondary" (onClick)="rolesDialogVisible = false" />
        <p-button [label]="'COMMON.SAVE' | translate" (onClick)="updateRoles()" />
      </ng-template>
    </p-dialog>

    <!-- Reset Password Dialog -->
    <p-dialog
      [header]="'ADMIN.USERS.RESET_PASSWORD' | translate"
      [(visible)]="passwordDialogVisible"
      [modal]="true"
      [style]="{ width: '400px' }">
      <div class="form-field">
        <label>{{ 'AUTH.PASSWORD' | translate }} *</label>
        <p-password [(ngModel)]="newPassword" [toggleMask]="true" styleClass="w-full" />
      </div>
      <ng-template pTemplate="footer">
        <p-button [label]="'COMMON.CANCEL' | translate" severity="secondary" (onClick)="passwordDialogVisible = false" />
        <p-button [label]="'COMMON.SAVE' | translate" (onClick)="resetPassword()" [disabled]="!newPassword" />
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .admin-container { padding: 1.5rem; max-width: 1400px; margin: 0 auto; }
    .form-stack { display: flex; flex-direction: column; gap: 1rem; }
    .form-field { display: flex; flex-direction: column; gap: 0.5rem; }
    .form-field--row { flex-direction: row; align-items: center; gap: 0.75rem; }
    .toggle-label { font-size: .875rem; }
    .action-buttons { display: flex; gap: 0.25rem; flex-wrap: wrap; }
    code { background: rgba(255,255,255,0.1); padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.85rem; }
    .ml-2 { margin-left: 0.5rem; }
    .mr-1 { margin-right: 0.25rem; }
    .text-center { text-align: center; }
  `]
})
export class UsersListComponent implements OnInit {
  private userManagementService = inject(UserManagementService);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private translate = inject(TranslateService);

  users = signal<ManagedUser[]>([]);
  availableRoles = signal<{label: string; value: string}[]>([]);
  loading = signal(false);
  tenantFilter = signal<string | null>(null);

  createDialogVisible = false;
  editDialogVisible = false;
  rolesDialogVisible = false;
  passwordDialogVisible = false;

  selectedUser: ManagedUser | null = null;
  selectedRoles: string[] = [];
  newPassword = '';

  userForm: FormGroup = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    fullName: [''],
    phoneNumber: [''],
    roles: [[]]
  });

  editForm: FormGroup = this.fb.group({
    fullName: [''],
    email: ['', [Validators.email]],
    phoneNumber: [''],
    isActive: [true]
  });

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.tenantFilter.set(params['tenant'] || null);
      this.loadUsers();
    });
    this.loadRoles();
  }

  isSuperAdmin(): boolean {
    return this.authService.isSuperAdmin();
  }

  /** Determines if the current user can modify the target user */
  canModify(user: ManagedUser): boolean {
    if (this.isSuperAdmin()) return true;
    // ADMIN cannot modify other ADMINs or SUPER_ADMINs
    return !user.roles.some(r => r === 'ADMIN' || r === 'SUPER_ADMIN');
  }

  loadUsers(): void {
    this.loading.set(true);
    const tenant = this.tenantFilter();

    const request = tenant && this.isSuperAdmin()
      ? this.userManagementService.getUsersByTenant(tenant)
      : this.userManagementService.getUsers();

    request.subscribe({
      next: (response: ManagedUser[]) => {
        this.users.set(response ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load users' });
      }
    });
  }

  loadRoles(): void {
    const roleCall = this.isSuperAdmin()
      ? this.userManagementService.getAllRoles()
      : this.userManagementService.getAvailableRoles();

    roleCall.subscribe({
      next: (roles) => this.availableRoles.set(roles.map(r => ({ label: r, value: r })))
    });
  }

  openCreateDialog(): void {
    this.userForm.reset({ roles: [] });
    this.createDialogVisible = true;
  }

  createUser(): void {
    if (this.userForm.invalid) return;
    this.userManagementService.createUser(this.userForm.value).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: this.translate.instant('ADMIN.USERS.CREATE_SUCCESS') });
        this.createDialogVisible = false;
        this.loadUsers();
      },
      error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Failed to create user' })
    });
  }

  openEditDialog(user: ManagedUser): void {
    this.selectedUser = user;
    this.editForm.patchValue({
      fullName: user.fullName ?? '',
      email: user.email,
      phoneNumber: user.phoneNumber ?? '',
      isActive: user.isEnabled
    });
    this.editDialogVisible = true;
  }

  updateUser(): void {
    if (!this.selectedUser || this.editForm.invalid) return;
    this.userManagementService.updateUser(this.selectedUser.id, this.editForm.value).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: this.translate.instant('ADMIN.USERS.UPDATE_SUCCESS') });
        this.editDialogVisible = false;
        this.loadUsers();
      },
      error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Failed to update user' })
    });
  }

  openRolesDialog(user: ManagedUser): void {
    this.selectedUser = user;
    this.selectedRoles = [...user.roles];
    this.rolesDialogVisible = true;
  }

  updateRoles(): void {
    if (!this.selectedUser) return;
    this.userManagementService.updateUserRoles(this.selectedUser.id, this.selectedRoles).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: this.translate.instant('ADMIN.USERS.UPDATE_SUCCESS') });
        this.rolesDialogVisible = false;
        this.loadUsers();
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update roles' })
    });
  }

  openPasswordDialog(user: ManagedUser): void {
    this.selectedUser = user;
    this.newPassword = '';
    this.passwordDialogVisible = true;
  }

  resetPassword(): void {
    if (!this.selectedUser || !this.newPassword) return;
    this.userManagementService.resetUserPassword(this.selectedUser.id, this.newPassword).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: this.translate.instant('ADMIN.USERS.PASSWORD_RESET_SUCCESS') });
        this.passwordDialogVisible = false;
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to reset password' })
    });
  }

  confirmToggleStatus(user: ManagedUser): void {
    const action = user.isEnabled ? 'ADMIN.USERS.DEACTIVATE' : 'ADMIN.USERS.ACTIVATE';
    this.confirmationService.confirm({
      message: `${this.translate.instant(action)} ${user.username}?`,
      accept: () => {
        this.userManagementService.toggleStatus(user.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: this.translate.instant('ADMIN.USERS.UPDATE_SUCCESS') });
            this.loadUsers();
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to toggle status' })
        });
      }
    });
  }

  confirmDelete(user: ManagedUser): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${user.username}?`,
      accept: () => {
        this.userManagementService.deleteUser(user.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: this.translate.instant('ADMIN.USERS.DELETE_SUCCESS') });
            this.loadUsers();
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete user' })
        });
      }
    });
  }
}
