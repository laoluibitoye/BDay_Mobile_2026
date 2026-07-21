import React from 'react';
import { Alert, FlatList, Text, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { ListRow } from '../../components/ListRow';
import { invoices } from '../../data/mock';
import { Invoice } from '../../data/types';
import { space, type, useTheme } from '../../theme';

function statusColor(status: Invoice['status'], theme: ReturnType<typeof useTheme>['theme']) {
  if (status === 'Paid') return theme.marketUp;
  if (status === 'Failed') return theme.marketDown;
  return theme.inkMuted; // Refunded — neutral, not a failure
}

export function BillingHistoryScreen() {
  const { theme } = useTheme();

  return (
    <Screen scroll={false} header={<AppHeader variant="compact" title="Billing history" showBack />}>
      <FlatList
        style={{ flex: 1 }}
        data={invoices}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: space.lg, paddingBottom: 140 }}
        ListEmptyComponent={
          <Text style={[type.bodyUI, { color: theme.inkMuted }]}>No invoices yet.</Text>
        }
        renderItem={({ item }) => (
          <ListRow
            title={item.description}
            meta={item.date}
            onPress={() =>
              Alert.alert(
                item.description,
                `${item.date}\n${item.amount} · ${item.status}\n\nReceipt download isn't available in this preview build yet.`
              )
            }
            accessibilityLabel={`${item.description}, ${item.date}, ${item.amount}, ${item.status}`}
            rightElement={
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[type.mono, { color: theme.ink }]}>{item.amount}</Text>
                <Text style={[type.caption, { color: statusColor(item.status, theme), marginTop: 2 }]}>
                  {item.status}
                </Text>
              </View>
            }
          />
        )}
      />
    </Screen>
  );
}
