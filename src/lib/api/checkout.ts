import { apiRequest, setAccessTokenOnly } from './client';
import type {
  CheckoutInitRequest,
  CheckoutInitResponse,
  CheckoutVerifyRequest,
  CheckoutVerifyResponse,
  CouponValidateRequest,
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
