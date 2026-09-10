import { useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { checkoutInit, upgradeToB2b } from '../lib/api/checkout';
import { ApiError } from '../lib/api/client';
import { useAppState } from '../state/AppState';
import type { Organization } from '../lib/api/types';

type Result = { status: 'activated'; organization: Organization } | { status: 'unconfirmed' | 'unsupported' | 'error' };

// Same shape as useCheckout.ts, with one real difference: the final step isn't checkoutVerify,
// it's upgradeToB2b — a payment against a B2B plan doesn't activate a subscription on its own,
// it only becomes a real organization once paired with an org name (see checkout.service.ts's
// upgradeToB2b(), which calls verify() internally as part of that same call).
export function useB2bCheckout() {
  const { refreshSession } = useAppState();
  const [loading, setLoading] = useState(false);
  const [lastErrorMessage, setLastErrorMessage] = useState<string | null>(null);

  const startUpgrade = async (planId: string, orgName: string, seats?: number): Promise<Result> => {
    setLoading(true);
    setLastErrorMessage(null);
    try {
      const appReturnUrl = Linking.createURL('checkout-complete');
      const bounceUrl = `${process.env.EXPO_PUBLIC_API_BASE_URL}/api/v1/checkout/mobile-return`;
      const { checkout } = await checkoutInit({
        planId,
        gateway: 'paystack',
        channel: 'mobile',
        returnUrl: bounceUrl,
        seats,
      });

      let reference: string;
      if (checkout.mode === 'redirect') {
        reference = checkout.reference;
        await WebBrowser.openAuthSessionAsync(checkout.url, appReturnUrl);
      } else if (checkout.mode === 'mock') {
        reference = checkout.reference;
      } else {
        return { status: 'unsupported' };
      }

      const result = await upgradeToB2b({ reference, orgName });
      if (result.activated) {
        await refreshSession();
        return { status: 'activated', organization: result.organization };
      }
      return { status: 'unconfirmed' };
    } catch (err) {
      if (err instanceof ApiError) setLastErrorMessage(err.message);
      return { status: 'error' };
    } finally {
      setLoading(false);
    }
  };

  return { startUpgrade, loading, lastErrorMessage };
}
