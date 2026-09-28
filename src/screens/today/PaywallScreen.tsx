import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { Button } from '../../components/Button';
import { GlassSheet } from '../../components/GlassSheet';
import { useAppState } from '../../state/AppState';
import { useAppConfig } from '../../hooks/useAppConfig';
import { fontFamily, radius, space, type, useTheme } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Paywall'>;

const FALLBACK_COPY = {
  headline: 'This story is for subscribers',
  body: 'Already subscribe? Sign in to keep reading.',
  offerBadge: '',
};

// Apple rejected 2.0.0 under Guideline 3.1.1: showing a plan/price card with a "Subscribe" button
// that opened the website read as an in-app purchase flow with no In-App Purchase behind it — not
// something a "Reader" app (3.1.3(a)) is allowed to show, regardless of where the button actually
// sends the reader. A Reader app may let someone sign in to content they already subscribe to; it
// may not present anything that looks like a storefront. This screen no longer fetches or shows a
// plan, a price, or any "Subscribe"/"Upgrade" call to action — just why the story is locked and a
// sign-in path for a reader who already has a subscription from the website.
export function PaywallScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { authUser } = useAppState();
  const appConfig = useAppConfig();
  const copy = appConfig?.paywallCopy.paid_lock ?? FALLBACK_COPY;

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
          {authUser ? (
            <Text style={[type.bodyUI, { color: theme.inkMuted, textAlign: 'center' }]}>
              Not seeing your subscription? Make sure you're signed in with the same account you subscribed with.
            </Text>
          ) : (
            <Button label="Sign in" onPress={() => navigation.navigate('Auth', { mode: 'login' })} fullWidth />
          )}
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={[type.bodyUI, { color: theme.inkMuted, textAlign: 'center' }]}>Maybe later</Text>
          </Pressable>
        </View>
        <Text style={[type.mono, { color: theme.inkFaint, textAlign: 'center', marginTop: space.lg }]}>
          SUBSCRIPTIONS ARE MANAGED ON BUSINESSDAY.NG
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
