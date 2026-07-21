import React from 'react';
import { Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { MenuRow } from '../../components/MenuRow';
import { Button } from '../../components/Button';
import { subscriptionPlans } from '../../data/mock';
import { useAppState } from '../../state/AppState';
import { confirmCancelSubscription } from '../../lib/confirmCancelSubscription';
import { radius, space, type, useTheme } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ManageSubscription'>;

export function ManageSubscriptionScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { isSubscribed, setSubscribed } = useAppState();
  const currentPlan = subscriptionPlans.find((p) => p.highlight) ?? subscriptionPlans[0];

  return (
    <Screen header={<AppHeader variant="compact" title="Manage subscription" showBack />}>
      <View style={{ padding: space.lg }}>
        {isSubscribed ? (
          <>
            <View
              style={{
                borderWidth: 1,
                borderColor: theme.accent,
                borderRadius: radius.card,
                padding: space.lg,
                backgroundColor: theme.accentTint,
              }}
            >
              <Text style={[type.mono, { color: theme.accentDeep }]}>CURRENT PLAN</Text>
              <Text style={[type.sectionHeadline, { color: theme.ink, marginTop: space.xs }]}>{currentPlan.name}</Text>
              <Text style={[type.bodyUI, { color: theme.inkMuted, marginTop: 2 }]}>
                {currentPlan.price} · renews automatically
              </Text>
            </View>

            <View style={{ marginTop: space.xl }}>
              <MenuRow icon="repeat" label="Change plan" onPress={() => navigation.navigate('SubscriptionPlans')} />
              <MenuRow icon="credit-card" label="Payment method" value="Coming soon" disabled />
              <MenuRow icon="file-text" label="Billing history" onPress={() => navigation.navigate('BillingHistory')} />
              <MenuRow icon="gift" label="Gift a subscription" value="Coming soon" disabled />
            </View>

            <View style={{ marginTop: space.xl }}>
              <Button
                label="Cancel subscription"
                variant="secondary"
                onPress={() => confirmCancelSubscription(() => setSubscribed(false))}
                fullWidth
              />
              <Text style={[type.caption, { color: theme.inkMuted, marginTop: space.sm, textAlign: 'center' }]}>
                You'll keep Premium access until the end of the current billing period.
              </Text>
            </View>
          </>
        ) : (
          <>
            <Text style={[type.bodyUI, { color: theme.inkMuted }]}>
              You're on the free plan. Subscribe to unlock unlimited reading, full market data, and offline downloads.
            </Text>
            <View style={{ marginTop: space.lg }}>
              <Button label="View plans" onPress={() => navigation.navigate('SubscriptionPlans')} fullWidth />
            </View>
            <View style={{ marginTop: space.xl }}>
              <MenuRow icon="file-text" label="Billing history" onPress={() => navigation.navigate('BillingHistory')} />
            </View>
          </>
        )}
      </View>
    </Screen>
  );
}
