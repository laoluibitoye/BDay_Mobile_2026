import React from 'react';
import { Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { Button } from '../../components/Button';
import { openWebSubscribe } from '../../lib/webCheckout';
import { space, type, useTheme } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'UpgradeAccount'>;

// A company-account upgrade is a purchase like any other, so it now happens on the website too
// (see webCheckout.ts) — this screen no longer collects a plan/org name/seat count itself, since
// the website's own upgrade flow collects that as part of checkout.
export function UpgradeAccountScreen({}: Props) {
  const { theme } = useTheme();

  return (
    <Screen header={<AppHeader variant="compact" title="Upgrade Account" showBack />}>
      <View style={{ padding: space.lg }}>
        <Text style={[type.bodyUI, { color: theme.inkMuted }]}>
          Set up a company account from our website — one subscription covering your whole team, managed from one place.
        </Text>
        <View style={{ marginTop: space.xl }}>
          <Button label="Continue on businessday.ng" onPress={openWebSubscribe} fullWidth />
        </View>
      </View>
    </Screen>
  );
}
