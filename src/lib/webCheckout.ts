import { Linking } from 'react-native';

// App Store compliance: Apple's Guideline 3.1.1 requires native In-App Purchase for any digital
// subscription sold from within the app, unless the app never initiates a purchase in-app at all
// (the "Reader" app exception, 3.1.3(a)) — which is what BusinessDay actually is. Every purchase
// flow that used to open Paystack in an in-app browser tab (subscribing, gifting a subscription,
// upgrading to a company account) now sends the reader to the website in their own browser
// instead; they complete payment there, then come back and log in (or pull-to-refresh) to pick up
// the new entitlement. `openURL` (not expo-web-browser's in-app tab) is deliberate — this needs to
// read as leaving the app, not as a checkout screen the app itself is presenting.
export const WEBSITE_SUBSCRIBE_URL = 'https://businessday.ng/subscribe/';

export function openWebSubscribe(): void {
  Linking.openURL(WEBSITE_SUBSCRIBE_URL).catch(() => undefined);
}
