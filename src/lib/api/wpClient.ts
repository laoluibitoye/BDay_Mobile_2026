import { getAccessToken } from './client';
import { getDeviceId } from '../deviceId';

// The WordPress site itself — AeroPaywall's connector-plugin (entitlement) and our own
// businessday-app-connector plugin (cached feeds/app-config) both live here, under different
// REST namespaces. Distinct host from subscription-service (api/client.ts) — see
// IMPLEMENTATION_PLAN.md §17.
const WP_BASE_URL = process.env.EXPO_PUBLIC_WP_BASE_URL ?? '';

export class WpApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function wpFetch<T>(path: string, headers: Record<string, string> = {}): Promise<T> {
  const res = await fetch(`${WP_BASE_URL}${path}`, { headers });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new WpApiError(res.status, body || res.statusText);
  }
  return (await res.json()) as T;
}

// Public, cached, non-personalized reads (feeds, app-config) — deliberately no Authorization or
// X-Device-Id header, so a CDN in front of WordPress can cache these identically for everyone
// instead of Vary-ing per reader.
export function wpPublicGet<T>(path: string): Promise<T> {
  return wpFetch<T>(path);
}

// Live, per-reader entitlement reads (AeroPaywall's own endpoint) — never cached client-side
// beyond the short in-memory dedup in api/entitlement.ts, since this is the actual paywall
// security boundary.
export async function wpEntitledGet<T>(path: string, giftToken?: string): Promise<T> {
  const [deviceId, accessToken] = await Promise.all([getDeviceId(), getAccessToken()]);
  const headers: Record<string, string> = { 'X-Device-Id': deviceId };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  if (giftToken) headers['X-Gift-Token'] = giftToken;
  return wpFetch<T>(path, headers);
}
