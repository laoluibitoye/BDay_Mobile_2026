import { apiRequest } from './client';
import type { CheckoutResult } from './types';

// Verified against the real subscription-service + the web SDK's own gift-button implementation
// (aero-paywall/sdk/src/gift-button.ts, gift-button.spec.ts): a gift link is a one-time-use
// token that unlocks exactly one article for whoever holds the URL. The web SDK reads it from a
// `?aero_gift=<token>` query param on the article's own URL — reusing that exact param name here
// keeps a gifted link openable from either the app share sheet or a browser.
export type GiftLink = {
  id: string;
  type: 'article' | 'plan';
  postId: string | null;
  planId: string | null;
  token: string;
  expiresAt: string;
  redeemedAt: string | null;
  createdAt: string;
  // Plan gifts only.
  plan?: { name: string } | null;
  subscription?: { status: string; startsAt: string; expiresAt: string } | null;
};

export function createGiftLink(postId: string): Promise<GiftLink> {
  return apiRequest('/api/v1/me/gift-links', { method: 'POST', body: JSON.stringify({ postId }) });
}

export function listMyGiftLinks(): Promise<GiftLink[]> {
  return apiRequest('/api/v1/me/gift-links');
}

// ---- Gift a subscription plan (recipient-email-bound, requires the gifter to already be an
// active subscriber, per gift-links.controller.ts) ----

export type InitPlanGiftCheckoutResponse = {
  checkout: CheckoutResult;
  pricing: { basePrice: number; finalPrice: number };
};

export function initPlanGiftCheckout(
  planId: string,
  recipientEmail: string,
  returnUrl?: string
): Promise<InitPlanGiftCheckoutResponse> {
  return apiRequest('/api/v1/me/gift-links/plan-checkout/init', {
    method: 'POST',
    body: JSON.stringify({ planId, gateway: 'paystack', recipientEmail, returnUrl, channel: 'mobile' }),
  });
}

export type VerifyPlanGiftCheckoutResponse = { activated: false } | { activated: true; giftLink: GiftLink };

export function verifyPlanGiftCheckout(reference: string): Promise<VerifyPlanGiftCheckoutResponse> {
  return apiRequest('/api/v1/me/gift-links/plan-checkout/verify', {
    method: 'POST',
    body: JSON.stringify({ reference }),
  });
}

export function giftUrl(articleSourceUrl: string, token: string): string {
  const separator = articleSourceUrl.includes('?') ? '&' : '?';
  return `${articleSourceUrl}${separator}aero_gift=${encodeURIComponent(token)}`;
}
