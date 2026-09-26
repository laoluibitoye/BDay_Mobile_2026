import { apiRequest } from './client';

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

// Gifting a subscription plan (as opposed to a single article, above) now happens entirely on
// the website — see webCheckout.ts — so the plan-gift checkout init/verify calls that used to
// live here were removed along with the in-app checkout flow that called them.

export function giftUrl(articleSourceUrl: string, token: string): string {
  const separator = articleSourceUrl.includes('?') ? '&' : '?';
  return `${articleSourceUrl}${separator}aero_gift=${encodeURIComponent(token)}`;
}
