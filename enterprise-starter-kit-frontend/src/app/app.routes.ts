import { Routes } from '@angular/router';

import { DashboardComponent } from './dashboard/dashboard.component';
import { InvoiceListComponent } from './invoices/invoice-list.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { RegisterTenantComponent } from './register-tenant/register-tenant.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ProfileComponent } from './profile/profile.component';
import { CustomerListComponent } from './customers/customer-list.component';
import { SettingsComponent } from './settings/settings.component';
import { CompaniesListComponent } from './admin/companies/companies-list.component';
import { UsersListComponent } from './admin/users/users-list.component';
import { NotFoundComponent } from './errors/not-found.component';
import { ServerErrorComponent } from './errors/server-error.component';
import { ForbiddenComponent } from './errors/forbidden.component';
import { authGuard } from './auth/auth.guard';
import { superAdminGuard, adminGuard } from './auth/role.guard';


// Shared lazy-load helper for UpgradePaywallComponent
const loadPaywall = () =>
  import('./shared/upgrade-paywall/upgrade-paywall.component').then(m => m.UpgradePaywallComponent);

export const routes: Routes = [
  // Public routes
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'register-tenant', component: RegisterTenantComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'portal/:token', loadComponent: loadPaywall, data: { moduleName: 'Secure Customer Portals & Magic Links' } },

  // Protected routes - All authenticated users
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  {
    path: 'dashboard-modern',
    loadComponent: () => import('./dashboard/dashboard-modern.component').then(m => m.DashboardModernComponent),
    canActivate: [authGuard]
  },
  { path: 'invoices', component: InvoiceListComponent, canActivate: [authGuard] },
  { path: 'customers', component: CustomerListComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'settings', component: SettingsComponent, canActivate: [authGuard] },

  // ── Premium Paywalled Routes ──────────────────────────────────────────
  { path: 'billing', loadComponent: loadPaywall, data: { moduleName: 'Billing & Stripe Integration' }, canActivate: [authGuard] },
  { path: 'billing/success', loadComponent: loadPaywall, data: { moduleName: 'Billing & Stripe Integration' }, canActivate: [authGuard] },
  { path: 'billing/cancel', loadComponent: loadPaywall, data: { moduleName: 'Billing & Stripe Integration' }, canActivate: [authGuard] },
  { path: 'audit-logs', loadComponent: loadPaywall, data: { moduleName: 'Audit Logs & Activity Tracking' }, canActivate: [authGuard, adminGuard] },
  { path: 'reports', loadComponent: loadPaywall, data: { moduleName: 'Reports & Analytics' }, canActivate: [authGuard] },
  { path: 'tax-reports', loadComponent: loadPaywall, data: { moduleName: 'Tax & VAT Reporting' }, canActivate: [authGuard] },
  { path: 'chatbot', loadComponent: loadPaywall, data: { moduleName: 'Neural AI Chatbot' }, canActivate: [authGuard] },
  { path: 'gdpr-export', loadComponent: loadPaywall, data: { moduleName: 'GDPR Data Export' }, canActivate: [authGuard] },
  { path: '2fa', loadComponent: loadPaywall, data: { moduleName: 'Advanced 2FA Security' }, canActivate: [authGuard] },
  { path: 'settings/api-keys', loadComponent: loadPaywall, data: { moduleName: 'API Key Management' }, canActivate: [authGuard] },

  // Admin routes - SUPER_ADMIN only
  {
    path: 'admin/super-dashboard',
    loadComponent: () => import('./admin/super-admin/super-admin-dashboard.component').then(m => m.SuperAdminDashboardComponent),
    canActivate: [authGuard, superAdminGuard]
  },
  {
    path: 'admin/companies',
    component: CompaniesListComponent,
    canActivate: [authGuard, superAdminGuard]
  },
  { path: 'admin/plans', loadComponent: loadPaywall, data: { moduleName: 'Subscription Plan Management' }, canActivate: [authGuard, superAdminGuard] },
  { path: 'admin/payments', loadComponent: loadPaywall, data: { moduleName: 'Payment History & Analytics' }, canActivate: [authGuard, superAdminGuard] },

  // Admin routes - ADMIN and SUPER_ADMIN
  {
    path: 'admin/dashboard',
    loadComponent: () => import('./admin/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [authGuard, adminGuard]
  },
  { path: 'admin/users', component: UsersListComponent, canActivate: [authGuard, adminGuard] },
  // E2E alias — tests navigate to /users
  { path: 'users', component: UsersListComponent, canActivate: [authGuard, adminGuard] },

  // Catalog - authenticated users
  {
    path: 'catalog',
    loadComponent: () => import('./catalog/catalog.component').then(m => m.CatalogComponent),
    canActivate: [authGuard]
  },
  // E2E alias — tests navigate to /catalog/products
  {
    path: 'catalog/products',
    loadComponent: () => import('./catalog/catalog.component').then(m => m.CatalogComponent),
    canActivate: [authGuard]
  },

  // ── Premium Paywalled Routes ──────────────────────────────────────────
  { path: 'expenses', loadComponent: loadPaywall, data: { moduleName: 'Expense Tracking & P&L Reports' }, canActivate: [authGuard] },

  // Error pages
  { path: 'error/403', component: ForbiddenComponent },
  { path: 'error/500', component: ServerErrorComponent },

  // Default redirect
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', component: NotFoundComponent }
];
