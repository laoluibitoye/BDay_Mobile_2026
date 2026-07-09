import React from 'react';
import { FlatList, Text, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { invoices } from '../../data/mock';
import { radius, space, type, useTheme } from '../../theme';

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
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: space.lg,
              borderRadius: radius.card,
              borderWidth: 1,
              borderColor: theme.rule,
              backgroundColor: theme.bgCard,
              marginBottom: space.md,
            }}
          >
            <View>
              <Text style={[type.label, { color: theme.ink }]}>{item.description}</Text>
              <Text style={[type.caption, { color: theme.inkMuted, marginTop: 2 }]}>{item.date}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[type.mono, { color: theme.ink }]}>{item.amount}</Text>
              <Text style={[type.caption, { color: theme.marketUp, marginTop: 2 }]}>{item.status}</Text>
            </View>
          </View>
        )}
      />
    </Screen>
  );
}
