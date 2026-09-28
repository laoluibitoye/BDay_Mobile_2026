import React from 'react';
import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { Button } from '../../components/Button';
import { useAppState } from '../../state/AppState';
import { confirmCancelSubscription } from '../../lib/confirmCancelSubscription';
import { cancelSubscription } from '../../lib/api/auth';
import { space, type, useTheme } from '../../theme';

// Apple rejected 2.0.0 under Guideline 3.1.1: a plan/price list with a "Subscribe" button that
// opened the website read as an in-app purchase flow with no real In-App Purchase behind it —
// not something the "Reader" app exception (3.1.3(a)) permits, regardless of where the button
// actually sent the reader. This screen no longer fetches or shows plans or prices, or any
// "Subscribe" call to action. An already-subscribed reader still manages/cancels here (that's
// account management, not a purchase); a reader who isn't subscribed is only ever offered a
// sign-in path, for the case where they already subscribed on the website under this account.
export function SubscriptionPlansScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { authUser, isSubscribed, refreshSession } = useAppState();

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
            : "You're on the free plan."}
        </Text>

        {!isSubscribed && (
          <>
            {!authUser && (
              <View style={{ marginTop: space.xl }}>
                <Button label="Sign in" onPress={() => navigation.navigate('Auth', { mode: 'login' })} fullWidth />
              </View>
            )}
            <Text style={[type.caption, { color: theme.inkFaint, marginTop: space.lg, textAlign: 'center' }]}>
              Subscriptions are managed on businessday.ng. Already subscribed? Sign in with the same account.
            </Text>
          </>
        )}

        {isSubscribed && (
          <View style={{ marginTop: space.xl }}>
            <Button label="Cancel subscription" variant="secondary" onPress={cancel} fullWidth />
          </View>
        )}
      </View>
    </Screen>
  );
}
