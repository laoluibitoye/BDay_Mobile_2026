import { apiRequest, setTokens } from './client';
import type {
  AuthResponse,
  CancelReason,
  ChangePasswordRequest,
  ConfirmPasswordResetRequest,
  LoginRequest,
  MeResponse,
  RegisterRequest,
  RequestPasswordResetRequest,
  UpdateProfileRequest,
} from './types';

export async function register(payload: RegisterRequest): Promise<AuthResponse> {
  // Cloudflare Turnstile can't complete inside this app's embedded WebView (confirmed on both
  // simulator and a real device — its bot-detection heuristics reject in-app browsers outright
  // regardless of a genuine same-domain page load), so the mobile app identifies itself and
  // subscription-service skips the captcha requirement web still enforces (see
  // AuthController.isMobileClient in subscription-service).
  const res = await apiRequest<AuthResponse>('/api/v1/auth/register', {
    method: 'POST',
    headers: { 'X-Client-Platform': 'mobile-app' },
    body: JSON.stringify(payload),
  });
  await setTokens(res);
  return res;
}

export async function login(payload: LoginRequest): Promise<AuthResponse> {
  const res = await apiRequest<AuthResponse>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  await setTokens(res);
  return res;
}

// Always returns `{ requested: true }` regardless of whether the email exists — deliberate
// anti-enumeration design on the server, don't build UI that implies otherwise.
export async function requestPasswordReset(payload: RequestPasswordResetRequest): Promise<{ requested: true }> {
  return apiRequest('/api/v1/auth/password-reset/request', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function confirmPasswordReset(payload: ConfirmPasswordResetRequest): Promise<{ reset: true }> {
  return apiRequest('/api/v1/auth/password-reset/confirm', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getMe(): Promise<MeResponse> {
  return apiRequest('/api/v1/me');
}

export function updateProfile(payload: UpdateProfileRequest): Promise<MeResponse> {
  return apiRequest('/api/v1/me', { method: 'PATCH', body: JSON.stringify(payload) });
}

// Re-issues a fresh token pair and revokes every *other* session.
export async function changePassword(payload: ChangePasswordRequest): Promise<AuthResponse> {
  const res = await apiRequest<AuthResponse>('/api/v1/me/password', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  await setTokens(res);
  return res;
}

export function cancelSubscription(subscriptionId: string, reason?: CancelReason): Promise<void> {
  return apiRequest(`/api/v1/me/subscriptions/${subscriptionId}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

// There is no server-side logout endpoint for reader auth (verified — only the separate
// cookie-based staff/admin session has one). "Logout" is purely local: discard stored tokens.
export { clearTokens as logoutLocal } from './client';
