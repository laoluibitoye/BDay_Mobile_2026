import React from 'react';
import { Platform, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { Button } from '../../components/Button';
import { useAppState } from '../../state/AppState';
import { confirmCancelSubscription } from '../../lib/confirmCancelSubscription';
import { openWebSubscribe } from '../../lib/webCheckout';
import { cancelSubscription } from '../../lib/api/auth';
import { space, type, useTheme } from '../../theme';

// iOS: no plan/price list — Apple's Reader-app exception (3.1.3(a)) doesn't cover an in-app
// storefront, even one that only links out. Android keeps the Subscribe button that opens the
// website directly (see webCheckout.ts). An already-subscribed reader manages/cancels here on
// both platforms — that's not a purchase.
export function SubscriptionPlansScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { authUser, isSubscribed, refreshSession } = useAppState();
  const isIOS = Platform.OS === 'ios';

  const subscribe = () => {
    if (!authUser) {
      navigation.navigate('Auth', { mode: 'signup' });
      return;
    }
    openWebSubscribe();
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
            : "You're on the free plan."}
        </Text>

        {!isSubscribed && isIOS && (
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

        {!isSubscribed && !isIOS && (
          <>
            <View style={{ marginTop: space.xl }}>
              <Button label={authUser ? 'Subscribe' : 'Sign in'} onPress={subscribe} fullWidth />
            </View>
            <Text style={[type.caption, { color: theme.inkFaint, marginTop: space.lg, textAlign: 'center' }]}>
              Subscribing continues on businessday.ng. Already subscribed? Sign in with the same account.
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
