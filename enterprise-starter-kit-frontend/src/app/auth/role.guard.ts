import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard that checks if user has required role(s)
 * Usage: canActivate: [roleGuard(['SUPER_ADMIN'])]
 */
export function roleGuard(allowedRoles: string[]): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const currentUser = authService.getCurrentUser();

    if (!currentUser) {
      router.navigate(['/login']);
      return false;
    }

    const userRoles = currentUser.roles || [];
    const hasRole = allowedRoles.some(role => userRoles.includes(role));

    if (!hasRole) {
      router.navigate(['/error/403']);
      return false;
    }

    return true;
  };
}

/**
 * Check if user is Super Admin
 */
export const superAdminGuard: CanActivateFn = roleGuard(['SUPER_ADMIN']);

/**
 * Check if user is Admin or Super Admin
 */
export const adminGuard: CanActivateFn = roleGuard(['ADMIN', 'SUPER_ADMIN']);

/**
 * Check if user has any valid role (authenticated)
 */
export const userGuard: CanActivateFn = roleGuard(['USER', 'ADMIN', 'SUPER_ADMIN']);
