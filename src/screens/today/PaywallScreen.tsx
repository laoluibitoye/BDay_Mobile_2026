import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { Button } from '../../components/Button';
import { GlassSheet } from '../../components/GlassSheet';
import { useAppState } from '../../state/AppState';
import { useAppConfig } from '../../hooks/useAppConfig';
import { openWebSubscribe } from '../../lib/webCheckout';
import { fontFamily, radius, space, type, useTheme } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Paywall'>;

const FALLBACK_COPY = {
  headline: 'Subscribe to keep reading',
  body: 'This story is for subscribers. Unlock unlimited access to BusinessDay.',
  offerBadge: '',
};

// No plan/price card here — the app doesn't show pricing in-app (Apple's Reader-app exception,
// 3.1.3(a), doesn't cover an in-app storefront). The Subscribe button below opens the website
// directly instead (see webCheckout.ts): create an account first if signed out, then subscribe.
export function PaywallScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { authUser } = useAppState();
  const appConfig = useAppConfig();
  const copy = appConfig?.paywallCopy.paid_lock ?? FALLBACK_COPY;

  const subscribe = () => {
    if (!authUser) {
      navigation.navigate('Auth', { mode: 'signup' });
      return;
    }
    openWebSubscribe();
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={() => navigation.goBack()}
        accessibilityRole="button"
        accessibilityLabel="Dismiss"
      />
      <GlassSheet style={styles.sheet}>
        {!!copy.offerBadge && (
          <View style={[styles.offerBadge, { backgroundColor: theme.accentTint }]}>
            <Text style={[type.caption, { color: theme.accentDeep, fontFamily: fontFamily.uiBold }]}>{copy.offerBadge}</Text>
          </View>
        )}
        <Text style={[type.articleHeadline, { color: theme.ink, marginTop: copy.offerBadge ? space.sm : 0 }]}>{copy.headline}</Text>
        <Text style={[type.bodyUI, { color: theme.inkMuted, marginTop: space.sm }]}>{copy.body}</Text>

        <View style={{ marginTop: space.xl, gap: space.md }}>
          <Button label={authUser ? 'Subscribe' : 'Sign in'} onPress={subscribe} fullWidth />
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={[type.bodyUI, { color: theme.inkMuted, textAlign: 'center' }]}>Maybe later</Text>
          </Pressable>
        </View>
        <Text style={[type.mono, { color: theme.inkFaint, textAlign: 'center', marginTop: space.lg }]}>
          CONTINUES ON OUR WEBSITE · CANCEL ANYTIME
        </Text>
      </GlassSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(17,17,17,0.45)' },
  sheet: { padding: space.xl, paddingBottom: space.xxxl },
  offerBadge: { borderRadius: radius.button, paddingVertical: space.xs, paddingHorizontal: space.md, alignSelf: 'flex-start' },
});
