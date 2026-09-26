import React from 'react';
import { Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { Button } from '../../components/Button';
import { openWebSubscribe } from '../../lib/webCheckout';
import { space, type, useTheme } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'GiftSubscription'>;

// Gifting a plan is a purchase like any other, so it now happens on the website too (see
// webCheckout.ts) — this screen no longer collects a plan/recipient email itself, since the
// website's own gift flow collects that as part of checkout.
export function GiftSubscriptionScreen({}: Props) {
  const { theme } = useTheme();

  return (
    <Screen header={<AppHeader variant="compact" title="Gift a subscription" showBack />}>
      <View style={{ padding: space.lg }}>
        <Text style={[type.bodyUI, { color: theme.inkMuted }]}>
          Buy someone else a BusinessDay subscription from our website — they'll get an email with a link to redeem it.
        </Text>
        <View style={{ marginTop: space.xl }}>
          <Button label="Continue on businessday.ng" onPress={openWebSubscribe} fullWidth />
        </View>
      </View>
    </Screen>
  );
}
