import { apiRequest } from './client';
import type { SubscriptionHistoryRow } from './types';

// Billing History screen's real data source — replaces data/mock.ts's `invoices`.
export function getSubscriptionHistory(): Promise<SubscriptionHistoryRow[]> {
  return apiRequest('/api/v1/me/subscriptions');
}
