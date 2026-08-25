import { useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
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
      const { checkout } = await checkoutInit({ planId, gateway: 'paystack' });

      let reference: string;
      if (checkout.mode === 'redirect') {
        reference = checkout.reference;
        await WebBrowser.openBrowserAsync(checkout.url);
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
