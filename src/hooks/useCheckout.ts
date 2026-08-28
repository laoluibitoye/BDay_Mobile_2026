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
      // returnUrl (businessday://checkout-complete, from app.json's "scheme") is what makes the
      // in-app browser close itself the instant Paystack's hosted checkout finishes, Netflix/
      // Spotify-style — Paystack redirects here as its callback_url, openAuthSessionAsync below
      // recognizes the app's own scheme and dismisses automatically, instead of leaving the
      // reader stranded on Paystack's success page needing to manually tap "Done".
      const returnUrl = Linking.createURL('checkout-complete');
      // channel: 'mobile' tells the server to skip Paystack's inline JS
      // widget (a browser-DOM-only primitive the app has no way to render)
      // and return a real hosted-checkout URL instead — see the
      // subscription-service gateway.interface.ts channel doc comment.
      const { checkout } = await checkoutInit({ planId, gateway: 'paystack', channel: 'mobile', returnUrl });

      let reference: string;
      if (checkout.mode === 'redirect') {
        reference = checkout.reference;
        await WebBrowser.openAuthSessionAsync(checkout.url, returnUrl);
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
