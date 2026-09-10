import React, { useEffect, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
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
  const { startCheckout, loading, lastErrorMessage } = useCheckout();
  const [plans, setPlans] = useState<Plan[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Web parity: the SDK's Subscribe tab has a plain optional "Coupon code" field that's passed
  // straight into checkout/init and validated server-side — no separate preview/validate step.
  const [couponCode, setCouponCode] = useState('');

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
    const result = await startCheckout(planId, couponCode.trim() || undefined);
    if (result === 'unconfirmed') setError('Payment not confirmed yet. If you completed checkout, try again in a moment.');
    else if (result === 'unsupported') setError('This payment method needs an app update to complete.');
    else if (result === 'error') setError(lastErrorMessage ?? 'Something went wrong starting checkout. Try again.');
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
                  // A selectable option card, not a story card — radius.card was flattened to 0
                  // app-wide for the flat editorial redesign, which left this pricing table
                  // looking like literal square spreadsheet cells. radius.button (still a real,
                  // deliberate corner) reads as a chosen control again without reviving the old
                  // story-card shadow/radius look the rest of the app moved away from.
                  borderRadius: radius.button,
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

        {!isSubscribed && (
          <View style={{ marginTop: space.lg }}>
            <Text style={[type.caption, { color: theme.inkMuted, marginBottom: space.xs }]}>Coupon code (optional)</Text>
            <TextInput
              value={couponCode}
              onChangeText={setCouponCode}
              placeholder="Enter a code"
              placeholderTextColor={theme.inkFaint}
              autoCapitalize="characters"
              autoCorrect={false}
              style={[
                type.bodyUI,
                {
                  color: theme.ink,
                  borderWidth: 1,
                  borderColor: theme.rule,
                  borderRadius: radius.button,
                  paddingHorizontal: space.md,
                  paddingVertical: space.sm,
                },
              ]}
            />
          </View>
        )}

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
