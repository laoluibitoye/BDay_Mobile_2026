import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Text, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { ListRow } from '../../components/ListRow';
import { getSubscriptionHistory } from '../../lib/api/subscriptions';
import type { PaymentRow, SubscriptionHistoryRow } from '../../lib/api/types';
import { space, type, useTheme } from '../../theme';

type PaymentRowWithPlan = PaymentRow & { planName: string };

function statusColor(status: string, theme: ReturnType<typeof useTheme>['theme']) {
  if (status === 'success') return theme.marketUp;
  if (status === 'failed') return theme.marketDown;
  return theme.inkMuted; // pending — neutral, not a failure
}

// Flattens every subscription's payment ledger into one reverse-chronological list — the reader
// thinks of this as "my billing history," not "my subscriptions, each with its own payments."
function flattenPayments(history: SubscriptionHistoryRow[]): PaymentRowWithPlan[] {
  return history
    .flatMap((sub) => sub.payments.map((p) => ({ ...p, planName: sub.planName })))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function BillingHistoryScreen() {
  const { theme } = useTheme();
  const [payments, setPayments] = useState<PaymentRowWithPlan[] | null>(null);

  useEffect(() => {
    getSubscriptionHistory()
      .then((history) => setPayments(flattenPayments(history)))
      .catch(() => setPayments([]));
  }, []);

  return (
    <Screen scroll={false} header={<AppHeader variant="compact" title="Billing history" showBack />}>
      <FlatList
        style={{ flex: 1 }}
        data={payments ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: space.lg, paddingBottom: 140 }}
        ListEmptyComponent={
          <Text style={[type.bodyUI, { color: theme.inkMuted }]}>
            {payments === null ? 'Loading…' : 'No invoices yet.'}
          </Text>
        }
        renderItem={({ item }) => {
          const date = new Date(item.createdAt).toLocaleDateString();
          const amount = `${item.currency} ${item.amount.toLocaleString()}`;
          return (
            <ListRow
              title={item.planName}
              meta={date}
              onPress={() =>
                Alert.alert(
                  item.planName,
                  `${date}\n${amount} · ${item.status} · ${item.gateway}\n\nReceipt download isn't available in this preview build yet.`
                )
              }
              accessibilityLabel={`${item.planName}, ${date}, ${amount}, ${item.status}`}
              rightElement={
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[type.mono, { color: theme.ink }]}>{amount}</Text>
                  <Text style={[type.caption, { color: statusColor(item.status, theme), marginTop: 2 }]}>
                    {item.status}
                  </Text>
                </View>
              }
            />
          );
        }}
      />
    </Screen>
  );
}
