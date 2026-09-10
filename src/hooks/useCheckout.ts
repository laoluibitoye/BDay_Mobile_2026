import { useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { checkoutInit, checkoutVerify } from '../lib/api/checkout';
import { ApiError } from '../lib/api/client';
import { useAppState } from '../state/AppState';

type Result = 'activated' | 'unconfirmed' | 'unsupported' | 'error';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Bug found live: the in-app browser closing (success, cancel, or dismiss — its result was never
// inspected either way) doesn't guarantee the gateway's webhook has reached the server yet. A
// single verify call right after close could lose that race and report "unconfirmed" on a
// checkout that actually succeeded a moment later. A few short, bounded retries closes that
// window without turning a genuinely abandoned checkout into an indefinite poll.
const VERIFY_RETRY_DELAYS_MS = [1200, 1800, 2500];

// Shared checkout flow for PaywallScreen and SubscriptionPlansScreen — branches on the server's
// `checkout.mode` (never assumes one regardless of which gateway was requested, per the verified
// subscription-service contract), and re-syncs the session on activation since verification
// re-signs a fresh access token carrying the new subscriptionStatus.
export function useCheckout() {
  const { refreshSession } = useAppState();
  const [loading, setLoading] = useState(false);
  // Surfaces the backend's real message on failure (e.g. "Invalid or expired coupon") instead of
  // a generic "something went wrong" — the coupon field otherwise gives a reader no way to tell
  // a typo'd code from an actual outage.
  const [lastErrorMessage, setLastErrorMessage] = useState<string | null>(null);

  const startCheckout = async (planId: string, couponCode?: string): Promise<Result> => {
    setLoading(true);
    setLastErrorMessage(null);
    try {
      // appReturnUrl (businessday://checkout-complete, from app.json's "scheme") is the actual
      // deep link openAuthSessionAsync watches for — the instant navigation reaches it, the
      // in-app browser closes itself, Netflix/Spotify-style, instead of leaving the reader
      // stranded on Paystack's success page. But Paystack's callback_url (confirmed live) will
      // not navigate to a custom app scheme directly — it needs a real http(s) URL. So the
      // *server* gets a tiny HTTPS bounce page instead (mobile-checkout-return.controller.ts),
      // whose only job is to hand off to appReturnUrl client-side the instant Paystack loads it.
      const appReturnUrl = Linking.createURL('checkout-complete');
      const bounceUrl = `${process.env.EXPO_PUBLIC_API_BASE_URL}/api/v1/checkout/mobile-return`;
      // channel: 'mobile' tells the server to skip Paystack's inline JS
      // widget (a browser-DOM-only primitive the app has no way to render)
      // and return a real hosted-checkout URL instead — see the
      // subscription-service gateway.interface.ts channel doc comment.
      const { checkout } = await checkoutInit({
        planId,
        gateway: 'paystack',
        channel: 'mobile',
        returnUrl: bounceUrl,
        // Validated/applied server-side by the existing /checkout/init couponCode handling —
        // same "let the backend own validation" approach the web SDK's Subscribe tab uses, no
        // separate pre-validation call needed.
        couponCode,
      });

      let reference: string;
      if (checkout.mode === 'redirect') {
        reference = checkout.reference;
        await WebBrowser.openAuthSessionAsync(checkout.url, appReturnUrl);
      } else if (checkout.mode === 'mock') {
        reference = checkout.reference;
      } else {
        return 'unsupported';
      }

      let result = await checkoutVerify({ reference });
      for (const delay of VERIFY_RETRY_DELAYS_MS) {
        if (result.activated) break;
        await sleep(delay);
        result = await checkoutVerify({ reference });
      }
      if (result.activated) {
        await refreshSession();
        return 'activated';
      }
      return 'unconfirmed';
    } catch (err) {
      if (err instanceof ApiError) setLastErrorMessage(err.message);
      return 'error';
    } finally {
      setLoading(false);
    }
  };

  return { startCheckout, loading, lastErrorMessage };
}
