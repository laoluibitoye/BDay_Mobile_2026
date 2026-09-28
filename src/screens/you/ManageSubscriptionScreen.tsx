import React from 'react';
import { Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { MenuRow } from '../../components/MenuRow';
import { Button } from '../../components/Button';
import { useAppState } from '../../state/AppState';
import { confirmCancelSubscription } from '../../lib/confirmCancelSubscription';
import { cancelSubscription } from '../../lib/api/auth';
import { radius, space, type, useTheme } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ManageSubscription'>;

export function ManageSubscriptionScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { authUser, isSubscribed, refreshSession } = useAppState();
  // isSubscribed is derived from authUser.subscription?.status === 'active', so
  // authUser.subscription is guaranteed non-null whenever this branch renders below.
  const subscription = authUser?.subscription ?? null;

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
              <Text style={[type.sectionHeadline, { color: theme.ink, marginTop: space.xs }]}>{subscription?.planName}</Text>
              <Text style={[type.bodyUI, { color: theme.inkMuted, marginTop: 2 }]}>
                {subscription?.autoRenew ? 'Renews' : 'Expires'}{' '}
                {subscription ? new Date(subscription.expiresAt).toLocaleDateString() : ''}
              </Text>
              {subscription && !subscription.autoRenew && (
                <Text style={[type.caption, { color: theme.marketDown, marginTop: 2 }]}>Auto-renew is off</Text>
              )}
            </View>

            <View style={{ marginTop: space.xl }}>
              <MenuRow icon="repeat" label="Change plan" onPress={() => navigation.navigate('SubscriptionPlans')} />
              <MenuRow icon="file-text" label="Billing history" onPress={() => navigation.navigate('BillingHistory')} />
              {/* Gifting and company-account upgrades are both purchase-initiation flows with no
                  "already purchased" angle, so Apple's Reader-app exception (3.1.3(a), see the
                  2.0.0 rejection under Guideline 3.1.1) doesn't cover them the way it covers a
                  plain sign-in path. Hidden pending either real In-App Purchase or Apple's
                  External Purchase Link entitlement — GiftSubscriptionScreen/UpgradeAccountScreen
                  still exist, just unreachable from here for now. */}
              {authUser?.org && <MenuRow icon="briefcase" label="Team" onPress={() => navigation.navigate('Team')} />}
            </View>

            <View style={{ marginTop: space.xl }}>
              <Button label="Cancel subscription" variant="secondary" onPress={cancel} fullWidth />
              <Text style={[type.caption, { color: theme.inkMuted, marginTop: space.sm, textAlign: 'center' }]}>
                You'll keep Premium access until the end of the current billing period.
              </Text>
            </View>
          </>
        ) : (
          <>
            <Text style={[type.bodyUI, { color: theme.inkMuted }]}>
              You're on the free plan. Subscriptions are managed on businessday.ng — already subscribed? Make sure
              you're signed in with the same account.
            </Text>
            <View style={{ marginTop: space.xl }}>
              <MenuRow icon="file-text" label="Billing history" onPress={() => navigation.navigate('BillingHistory')} />
              {authUser?.org && <MenuRow icon="briefcase" label="Team" onPress={() => navigation.navigate('Team')} />}
            </View>
          </>
        )}
      </View>
    </Screen>
  );
}
