import { useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { initPlanGiftCheckout, verifyPlanGiftCheckout } from '../lib/api/gift';
import { ApiError } from '../lib/api/client';
import type { GiftLink } from '../lib/api/gift';

type Result = { status: 'activated'; giftLink: GiftLink } | { status: 'unconfirmed' | 'unsupported' | 'error' };

// Same init -> open browser -> verify shape as useCheckout.ts, gifting a plan instead of buying
// one for the signed-in reader themself — verifyPlanGiftCheckout creates the real GiftLink (and
// sends the recipient their notification email) only once the charge is confirmed, same
// never-trust-the-client-redirect posture as every other checkout flow in this app.
export function useGiftSubscriptionCheckout() {
  const [loading, setLoading] = useState(false);
  const [lastErrorMessage, setLastErrorMessage] = useState<string | null>(null);

  const startGiftCheckout = async (planId: string, recipientEmail: string): Promise<Result> => {
    setLoading(true);
    setLastErrorMessage(null);
    try {
      const appReturnUrl = Linking.createURL('checkout-complete');
      const bounceUrl = `${process.env.EXPO_PUBLIC_API_BASE_URL}/api/v1/checkout/mobile-return`;
      const { checkout } = await initPlanGiftCheckout(planId, recipientEmail, bounceUrl);

      let reference: string;
      if (checkout.mode === 'redirect') {
        reference = checkout.reference;
        await WebBrowser.openAuthSessionAsync(checkout.url, appReturnUrl);
      } else if (checkout.mode === 'mock') {
        reference = checkout.reference;
      } else {
        return { status: 'unsupported' };
      }

      const result = await verifyPlanGiftCheckout(reference);
      if (result.activated) {
        return { status: 'activated', giftLink: result.giftLink };
      }
      return { status: 'unconfirmed' };
    } catch (err) {
      if (err instanceof ApiError) setLastErrorMessage(err.message);
      return { status: 'error' };
    } finally {
      setLoading(false);
    }
  };

  return { startGiftCheckout, loading, lastErrorMessage };
}
