import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { Button } from '../../components/Button';
import { FeedEmptyState } from '../../components/FeedEmptyState';
import { useAppState } from '../../state/AppState';
import { useCheckout } from '../../hooks/useCheckout';
import { confirmCancelSubscription } from '../../lib/confirmCancelSubscription';
import { getPlans } from '../../lib/api/checkout';
import { cancelSubscription } from '../../lib/api/auth';
import type { Plan } from '../../lib/api/types';
import { radius, space, type, useTheme } from '../../theme';

export function SubscriptionPlansScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { authUser, isSubscribed, refreshSession } = useAppState();
  const { startCheckout, loading } = useCheckout();
  const [plans, setPlans] = useState<Plan[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPlans = () => {
    setLoadFailed(false);
    getPlans()
      .then(setPlans)
      .catch(() => setLoadFailed(true));
  };

  useEffect(loadPlans, []);

  const subscribe = async (planId: string) => {
    if (!authUser) {
      navigation.navigate('Auth', { mode: 'signup' });
      return;
    }
    setError(null);
    const result = await startCheckout(planId);
    if (result === 'unconfirmed') setError('Payment not confirmed yet. If you completed checkout, try again in a moment.');
    else if (result === 'unsupported') setError('This payment method needs an app update to complete.');
    else if (result === 'error') setError('Something went wrong starting checkout. Try again.');
  };

  const cancel = () => {
    confirmCancelSubscription(async () => {
      const subscriptionId = authUser?.subscription?.id;
      if (!subscriptionId) return;
      try {
        await cancelSubscription(subscriptionId);
      } finally {
        await refreshSession();
      }
    });
  };

  return (
    <Screen header={<AppHeader variant="compact" title="Subscription" showBack />}>
      <View style={{ padding: space.lg }}>
        <Text style={[type.bodyUI, { color: theme.inkMuted }]}>
          {isSubscribed
            ? `You're on ${authUser?.subscription?.planName}. Manage or cancel below.`
            : 'Choose a plan to unlock unlimited reading and full market data.'}
        </Text>

        <View style={{ marginTop: space.xl, gap: space.md }}>
          {loadFailed ? (
            <FeedEmptyState title="Couldn't load plans" message="Check your connection and try again." onRetry={loadPlans} />
          ) : plans !== null && plans.length === 0 ? (
            <FeedEmptyState title="No plans available" message="Check back shortly." />
          ) : (
            (plans ?? []).map((plan, i) => (
              <View
                key={plan.id}
                style={{
                  borderWidth: i === 0 ? 2 : 1,
                  borderColor: i === 0 ? theme.accent : theme.rule,
                  borderRadius: radius.card,
                  padding: space.lg,
                  backgroundColor: theme.bgCard,
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={[type.label, { color: theme.ink }]}>{plan.name}</Text>
                  {i === 0 && <Text style={[type.mono, { color: theme.accentDeep }]}>BEST VALUE</Text>}
                </View>
                <Text style={[type.sectionHeadline, { color: theme.accent, marginTop: space.xs }]}>
                  ₦{Number(plan.priceNgn).toLocaleString()}
                </Text>
                {plan.featureBullets.map((f) => (
                  <Text key={f} style={[type.bodyUI, { color: theme.inkMuted, marginTop: space.xs }]}>
                    · {f}
                  </Text>
                ))}
                {!isSubscribed && (
                  <View style={{ marginTop: space.md }}>
                    <Button label="Subscribe" onPress={() => subscribe(plan.id)} loading={loading} fullWidth />
                  </View>
                )}
              </View>
            ))
          )}
        </View>

        {error && <Text style={[type.bodyUI, { color: theme.marketDown, marginTop: space.md }]}>{error}</Text>}

        {isSubscribed && (
          <View style={{ marginTop: space.xl }}>
            <Button label="Cancel subscription" variant="secondary" onPress={cancel} fullWidth />
          </View>
        )}
      </View>
    </Screen>
  );
}
