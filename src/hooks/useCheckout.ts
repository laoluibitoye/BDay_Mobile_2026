import { useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { checkoutInit, checkoutVerify } from '../lib/api/checkout';
import { useAppState } from '../state/AppState';

type Result = 'activated' | 'unconfirmed' | 'unsupported' | 'error';

// Shared checkout flow for PaywallScreen and SubscriptionPlansScreen — branches on the server's
// `checkout.mode` (never assumes one regardless of which gateway was requested, per the verified
// subscription-service contract), and re-syncs the session on activation since verification
// re-signs a fresh access token carrying the new subscriptionStatus.
export function useCheckout() {
  const { refreshSession } = useAppState();
  const [loading, setLoading] = useState(false);

  const startCheckout = async (planId: string): Promise<Result> => {
    setLoading(true);
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

      const result = await checkoutVerify({ reference });
      if (result.activated) {
        await refreshSession();
        return 'activated';
      }
      return 'unconfirmed';
    } catch {
      return 'error';
    } finally {
      setLoading(false);
    }
  };

  return { startCheckout, loading };
}
