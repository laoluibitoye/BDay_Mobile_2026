import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { Button } from '../../components/Button';
import { GlassSheet } from '../../components/GlassSheet';
import { useAppState } from '../../state/AppState';
import { useAppConfig } from '../../hooks/useAppConfig';
import { openWebSubscribe } from '../../lib/webCheckout';
import { fontFamily, radius, space, type, useTheme } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Paywall'>;

// iOS: Apple rejected 2.0.0 under Guideline 3.1.1 for a plan/price card with a "Subscribe" button
// that opened the website — a Reader app (3.1.3(a)) may let someone sign in to content they
// already subscribe to, but may not present anything that looks like a storefront, even one that
// links out. Android has no such restriction, so it keeps the Subscribe button that opens
// businessday.ng directly (see webCheckout.ts).
const IOS_FALLBACK_COPY = {
  headline: 'This story is for subscribers',
  body: 'Already subscribe? Sign in to keep reading.',
  offerBadge: '',
};
const ANDROID_FALLBACK_COPY = {
  headline: 'Subscribe to keep reading',
  body: 'This story is for subscribers. Unlock unlimited access to BusinessDay.',
  offerBadge: '',
};

export function PaywallScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { authUser } = useAppState();
  const appConfig = useAppConfig();
  const isIOS = Platform.OS === 'ios';
  const copy = appConfig?.paywallCopy.paid_lock ?? (isIOS ? IOS_FALLBACK_COPY : ANDROID_FALLBACK_COPY);

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
          {isIOS ? (
            authUser ? (
              <Text style={[type.bodyUI, { color: theme.inkMuted, textAlign: 'center' }]}>
                Not seeing your subscription? Make sure you're signed in with the same account you subscribed with.
              </Text>
            ) : (
              <Button label="Sign in" onPress={() => navigation.navigate('Auth', { mode: 'login' })} fullWidth />
            )
          ) : (
            <Button label={authUser ? 'Subscribe' : 'Sign in'} onPress={subscribe} fullWidth />
          )}
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={[type.bodyUI, { color: theme.inkMuted, textAlign: 'center' }]}>Maybe later</Text>
          </Pressable>
        </View>
        <Text style={[type.mono, { color: theme.inkFaint, textAlign: 'center', marginTop: space.lg }]}>
          {isIOS ? 'SUBSCRIPTIONS ARE MANAGED ON BUSINESSDAY.NG' : 'CONTINUES ON OUR WEBSITE · CANCEL ANYTIME'}
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
