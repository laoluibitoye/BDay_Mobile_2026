import { apiRequest } from './client';

// Verified against the real subscription-service + the web SDK's own gift-button implementation
// (aero-paywall/sdk/src/gift-button.ts, gift-button.spec.ts): a gift link is a one-time-use
// token that unlocks exactly one article for whoever holds the URL. The web SDK reads it from a
// `?aero_gift=<token>` query param on the article's own URL — reusing that exact param name here
// keeps a gifted link openable from either the app share sheet or a browser.
export type GiftLink = {
  id: string;
  postId: string;
  token: string;
  expiresAt: string;
  redeemedAt: string | null;
  createdAt: string;
};

export function createGiftLink(postId: string): Promise<GiftLink> {
  return apiRequest('/api/v1/me/gift-links', { method: 'POST', body: JSON.stringify({ postId }) });
}

export function listMyGiftLinks(): Promise<GiftLink[]> {
  return apiRequest('/api/v1/me/gift-links');
}

export function giftUrl(articleSourceUrl: string, token: string): string {
  const separator = articleSourceUrl.includes('?') ? '&' : '?';
  return `${articleSourceUrl}${separator}aero_gift=${encodeURIComponent(token)}`;
}
