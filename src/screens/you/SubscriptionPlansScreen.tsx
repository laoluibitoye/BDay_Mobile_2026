import React from 'react';
import { Text, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { Button } from '../../components/Button';
import { subscriptionPlans } from '../../data/mock';
import { useAppState } from '../../state/AppState';
import { confirmCancelSubscription } from '../../lib/confirmCancelSubscription';
import { radius, space, type, useTheme } from '../../theme';

export function SubscriptionPlansScreen() {
  const { theme } = useTheme();
  const { isSubscribed, setSubscribed } = useAppState();

  return (
    <Screen header={<AppHeader variant="compact" title="Subscription" showBack />}>
      <View style={{ padding: space.lg }}>
        <Text style={[type.bodyUI, { color: theme.inkMuted }]}>
          {isSubscribed
            ? 'You’re on Premium Annual. Manage or cancel below.'
            : 'Choose a plan to unlock unlimited reading and full market data.'}
        </Text>

        <View style={{ marginTop: space.xl, gap: space.md }}>
          {subscriptionPlans.map((plan) => (
            <View
              key={plan.id}
              style={{
                borderWidth: plan.highlight ? 2 : 1,
                borderColor: plan.highlight ? theme.accent : theme.rule,
                borderRadius: radius.card,
                padding: space.lg,
                backgroundColor: theme.bgCard,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={[type.label, { color: theme.ink }]}>{plan.name}</Text>
                {plan.highlight && (
                  <Text style={[type.mono, { color: theme.accentDeep }]}>BEST VALUE</Text>
                )}
              </View>
              <Text style={[type.sectionHeadline, { color: theme.accent, marginTop: space.xs }]}>
                {plan.price}
              </Text>
              {plan.features.map((f) => (
                <Text key={f} style={[type.bodyUI, { color: theme.inkMuted, marginTop: space.xs }]}>
                  · {f}
                </Text>
              ))}
            </View>
          ))}
        </View>

        <View style={{ marginTop: space.xl }}>
          {isSubscribed ? (
            <Button
              label="Cancel subscription"
              variant="secondary"
              onPress={() => confirmCancelSubscription(() => setSubscribed(false))}
              fullWidth
            />
          ) : (
            <Button label="Subscribe" onPress={() => setSubscribed(true)} fullWidth />
          )}
        </View>
      </View>
    </Screen>
  );
}
