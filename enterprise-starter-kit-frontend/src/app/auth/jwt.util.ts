import { User } from './user.model';

interface JwtPayload {
  sub?: string;
  tenantId?: string;
  roles?: string[];
  preferredLanguage?: string;
  fullName?: string;
  exp?: number;
}

function safeBase64UrlDecode(input: string): string {
  const b64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = b64.padEnd(b64.length + ((4 - (b64.length % 4)) % 4), '=');
  return decodeURIComponent(
    atob(padded)
      .split('')
      .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
      .join('')
  );
}

export function decodeUserFromJwt(token: string): User | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;

    const payloadJson = safeBase64UrlDecode(parts[1]);
    const payload = JSON.parse(payloadJson) as JwtPayload;

    const username = payload.sub;
    const tenantId = payload.tenantId;

    if (!username || !tenantId) return null;

    return {
      username,
      tenantId,
      roles: Array.isArray(payload.roles) ? payload.roles.map(String) : undefined,
      preferredLanguage: payload.preferredLanguage,
      fullName: payload.fullName
    };
  } catch {
    return null;
  }
}

/**
 * Check if a JWT token is expired.
 * Returns true if expired or invalid, false if still valid.
 */
export function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return true;

    const payloadJson = safeBase64UrlDecode(parts[1]);
    const payload = JSON.parse(payloadJson) as JwtPayload;

    if (!payload.exp) return true;

    // exp is in seconds, Date.now() is in milliseconds
    // Add a small buffer (30 seconds) to account for clock skew
    const expirationMs = payload.exp * 1000;
    const nowMs = Date.now();
    const bufferMs = 30 * 1000;

    return nowMs >= (expirationMs - bufferMs);
  } catch {
    return true;
  }
}

