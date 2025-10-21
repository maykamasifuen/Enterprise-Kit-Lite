import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { vi } from 'vitest';

import { AuthService } from './auth.service';
import { TokenStorageService } from './token-storage.service';
import { environment } from '../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let tokenStorage: {
    saveToken: ReturnType<typeof vi.fn>;
    signOut: ReturnType<typeof vi.fn>;
    getToken: ReturnType<typeof vi.fn>;
    isTokenValid: ReturnType<typeof vi.fn>;
  };

  const baseUrl = `${environment.apiUrl}/auth`;

  // Minimal JWT with preferredLanguage claim (base64 encoded payload)
  const fakeToken = [
    'header',
    btoa(JSON.stringify({ sub: 'user@test.com', tenantId: 't1', roles: ['USER'], preferredLanguage: 'en', exp: 9999999999 })),
    'signature'
  ].join('.');

  beforeEach(() => {
    const spy = {
      saveToken: vi.fn(),
      signOut: vi.fn(),
      getToken: vi.fn(),
      isTokenValid: vi.fn()
    };
    spy.getToken.mockReturnValue(null);
    tokenStorage = spy;

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: TokenStorageService, useValue: spy }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login()', () => {
    it('should POST to /auth/login and save token', async () => {
      const promise = firstValueFrom(service.login({ username: 'user@test.com', password: 'pass' }));
      const req = httpMock.expectOne(`${baseUrl}/login`);
      expect(req.request.method).toBe('POST');
      req.flush({ token: fakeToken });
      await promise;
      expect(tokenStorage.saveToken).toHaveBeenCalledWith(fakeToken);
    });

    it('should return error on 401', async () => {
      const promise = firstValueFrom(service.login({ username: 'bad', password: 'bad' }));
      const req = httpMock.expectOne(`${baseUrl}/login`);
      req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
      await expect(promise).rejects.toMatchObject({ status: 401 });
    });
  });

  describe('logout()', () => {
    it('should call tokenStorage.signOut()', () => {
      service.logout();
      expect(tokenStorage.signOut).toHaveBeenCalled();
    });
  });

  describe('isLoggedIn()', () => {
    it('should return false when no token', () => {
      tokenStorage.getToken.mockReturnValue(null);
      expect(service.isLoggedIn()).toBe(false);
    });

    it('should return true when token exists', () => {
      tokenStorage.getToken.mockReturnValue(fakeToken);
      expect(service.isLoggedIn()).toBe(true);
    });
  });

  describe('isAdmin()', () => {
    it('should return true for ROLE_ADMIN', () => {
      const adminToken = [
        'h',
        btoa(JSON.stringify({ sub: 'admin', tenantId: 't1', roles: ['ROLE_ADMIN'], exp: 9999999999 })),
        's'
      ].join('.');
      tokenStorage.getToken.mockReturnValue(adminToken);
      expect(service.isAdmin()).toBe(true);
    });

    it('should return false for ROLE_USER', () => {
      const userToken = [
        'h',
        btoa(JSON.stringify({ sub: 'user', tenantId: 't1', roles: ['ROLE_USER'], exp: 9999999999 })),
        's'
      ].join('.');
      tokenStorage.getToken.mockReturnValue(userToken);
      expect(service.isAdmin()).toBe(false);
    });
  });

  describe('isSuperAdmin()', () => {
    it('should return true for ROLE_SUPER_ADMIN', () => {
      const saToken = [
        'h',
        btoa(JSON.stringify({ sub: 'sa', tenantId: 't1', roles: ['ROLE_SUPER_ADMIN'], exp: 9999999999 })),
        's'
      ].join('.');
      tokenStorage.getToken.mockReturnValue(saToken);
      expect(service.isSuperAdmin()).toBe(true);
    });
  });
});
