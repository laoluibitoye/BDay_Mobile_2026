import { apiRequest } from './client';

export type CaptchaConfig = { provider: 'recaptcha' | 'turnstile'; siteKey: string };

// Unauthenticated — mirrors what the WordPress-embedded SDK reads (sdk/src/captcha.ts) from the
// same subscription-service endpoint. `null` whenever neither RECAPTCHA_SECRET_KEY nor
// TURNSTILE_SECRET_KEY is configured server-side (true for local dev today), so callers get
// today's no-captcha behavior automatically rather than needing their own environment check.
export async function getCaptchaConfig(): Promise<CaptchaConfig | null> {
  const config = await apiRequest<{ captcha: CaptchaConfig | null }>('/api/v1/public/paywall-config');
  return config.captcha;
}
