import { apiRequest, setAccessTokenOnly } from './client';
import type {
  CheckoutInitRequest,
  CheckoutInitResponse,
  CheckoutVerifyRequest,
  CheckoutVerifyResponse,
  CouponValidateRequest,
  Organization,
  Plan,
} from './types';

export function getPlans(): Promise<Plan[]> {
  return apiRequest('/api/v1/plans');
}

export function checkoutInit(payload: CheckoutInitRequest): Promise<CheckoutInitResponse> {
  return apiRequest('/api/v1/checkout/init', { method: 'POST', body: JSON.stringify(payload) });
}

// On activation the server re-signs a fresh access token carrying the new subscriptionStatus —
// this must overwrite the stored access token immediately, or the app keeps reading a stale,
// pre-payment `stage`/`isSubscriber` on the next request.
export async function checkoutVerify(payload: CheckoutVerifyRequest): Promise<CheckoutVerifyResponse> {
  const res = await apiRequest<CheckoutVerifyResponse>('/api/v1/checkout/verify', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (res.activated) {
    await setAccessTokenOnly(res.accessToken);
  }
  return res;
}

export function validateCoupon(payload: CouponValidateRequest): Promise<Record<string, unknown>> {
  return apiRequest('/api/v1/coupons/validate', { method: 'POST', body: JSON.stringify(payload) });
}

export type UpgradeToB2bRequest = { reference: string; orgName: string; domains?: string[] };
export type UpgradeToB2bResponse =
  | { activated: false }
  | { activated: true; organization: Organization; accessToken: string };

// Not a standalone action — takes the reference from a checkout already run against a B2B plan
// (checkoutInit, same flow as any other purchase) and, on that payment verifying, creates the
// organization and attaches it in one step. Same access-token re-sign requirement as
// checkoutVerify: the new token carries org membership, so it must overwrite the stored one
// immediately or the app keeps reading a stale, org-less session.
export async function upgradeToB2b(payload: UpgradeToB2bRequest): Promise<UpgradeToB2bResponse> {
  const res = await apiRequest<UpgradeToB2bResponse>('/api/v1/checkout/upgrade-to-b2b', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (res.activated) {
    await setAccessTokenOnly(res.accessToken);
  }
  return res;
}
