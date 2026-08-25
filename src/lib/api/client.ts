import * as SecureStore from 'expo-secure-store';
import type { AuthTokens } from './types';

const ACCESS_TOKEN_KEY = 'bd_access_token';
const REFRESH_TOKEN_KEY = 'bd_refresh_token';

// AeroPaywall's subscription-service — auth, profile, billing, plans. Confirmed base path is
// `/api/v1` (global prefix `api` + URI versioning defaulting to `1`), so every call site passes
// a path starting with `/api/v1/...`. Separate from the WordPress site's base URL — see
// api/wpClient.ts for the content/entitlement side, which is a different host.
const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? '';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function setTokens(tokens: AuthTokens): Promise<void> {
  await Promise.all([
    SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokens.accessToken),
    SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refreshToken),
  ]);
}

// checkout/verify re-signs only a fresh access token (no new refresh token) — this updates it in
// place without disturbing the existing refresh token/session.
export async function setAccessTokenOnly(accessToken: string): Promise<void> {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
}

export async function clearTokens(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
  ]);
}

// Concurrent 401s must not each fire their own refresh call — §9.2 flags this explicitly
// ("guard against parallel refresh calls") since refresh tokens are single-use/rotating.
let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    if (!refreshToken) return null;

    try {
      const res = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      const body = (await res.json().catch(() => null)) as { success: true; data: AuthTokens } | { success: false } | null;
      if (!res.ok || !body || body.success === false) {
        await clearTokens();
        return null;
      }
      await setTokens(body.data);
      return body.data.accessToken;
    } catch {
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

type RequestOptions = Omit<RequestInit, 'headers'> & {
  headers?: Record<string, string>;
  skipAuthRetry?: boolean;
};

// Every subscription-service response — confirmed against the real running server, not just
// docs — is wrapped in a global envelope: `{ success: true, data: T }` on 2xx, or
// `{ success: false, statusCode, path, timestamp, message }` on error (a global NestJS exception
// filter). `message` is sometimes a string, sometimes a nested `{ message, error, statusCode }`
// object (class-validator errors) — normalize both to a single string.
type Envelope<T> = { success: true; data: T } | { success: false; message: unknown };

function extractErrorMessage(message: unknown): string {
  if (typeof message === 'string') return message;
  if (message && typeof message === 'object' && 'message' in message) {
    const inner = (message as { message: unknown }).message;
    if (typeof inner === 'string') return inner;
    if (Array.isArray(inner)) return inner.join(', ');
  }
  return 'Something went wrong.';
}

// Thin fetch wrapper for subscription-service — attaches `Authorization: Bearer` when a session
// exists (subscription-service does not read `X-Device-Id`; that's a WordPress-side concept, see
// api/wpClient.ts). On a 401 it attempts one deduped refresh-and-retry before giving up.
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const accessToken = await getAccessToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401 && accessToken && !options.skipAuthRetry) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return apiRequest<T>(path, { ...options, skipAuthRetry: true });
    }
  }

  if (res.status === 204) return undefined as T;

  const body = (await res.json().catch(() => null)) as Envelope<T> | null;

  if (!res.ok || !body || body.success === false) {
    const message = body && body.success === false ? extractErrorMessage(body.message) : res.statusText;
    throw new ApiError(res.status, message);
  }

  return body.data;
}
