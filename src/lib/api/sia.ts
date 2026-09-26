import { fetch } from 'expo/fetch';
import { getAccessToken, refreshAccessToken } from './client';
import { createAskSia } from '../sia/client';

// Sia's own service (sia.businessday.ng) — a third host, separate from both the WordPress site and
// subscription-service. Unset means the feature is off: SiaPanel renders nothing, so a build made without
// this variable simply has no Sia button rather than one that can't work. (Production builds opt in by
// setting it in their EAS environment.)
//
// Expo inlines EXPO_PUBLIC_* values when it bundles, and Metro's cache does not notice a changed value:
// after changing this locally, restart with `npx expo start --clear` (EAS builds start clean).
const SIA_BASE_URL = (process.env.EXPO_PUBLIC_SIA_BASE_URL ?? '').replace(/\/+$/, '');

export const isSiaConfigured = SIA_BASE_URL !== '';

// `expo/fetch` (not the global fetch) is what gives a streaming `response.body` on native. Auth is the same
// AeroPaywall access token every other call in the app uses, with the same shared silent refresh.
export const askSia = createAskSia({
  baseUrl: SIA_BASE_URL,
  fetch: (url, init) => fetch(url, init),
  getAccessToken,
  refreshAccessToken,
});

export { SiaHttpError, SiaAbortError, SiaTimeoutError } from '../sia/client';
