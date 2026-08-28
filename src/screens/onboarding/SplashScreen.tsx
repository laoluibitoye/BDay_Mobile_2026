import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { useAppState } from '../../state/AppState';
import { space, type, useTheme } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const MIN_SPLASH_MS = 900;

export function SplashScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { sessionRestored } = useAppState();

  // Route to Main once both a minimum splash duration has elapsed (so it doesn't just flash on a
  // fast restore) and the mount-time session-restore attempt (AppState.tsx) has settled. Matches
  // the website: anonymous browsing is the default, not a gate — there's no welcome carousel and
  // no forced sign-in before the app is usable, logged in or not. A stored token means Main
  // renders already signed in; no token still means Main, just as a guest. The
  // per-article/per-feature entitlement stage (register_prompt/profile_prompt/paid_lock — the
  // same device-metered rules the website enforces) is what prompts sign-in, reactively, exactly
  // where the website would, and personalization/interest-picking only ever comes up as part of
  // registering for the first time (see AuthScreen), never before.
  useEffect(() => {
    if (!sessionRestored) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      if (!cancelled) navigation.replace('Main');
    }, MIN_SPLASH_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [sessionRestored, navigation]);

  return (
    <View style={[styles.container, { backgroundColor: theme.ink }]}>
      <Text style={[type.displayHeadline, { color: theme.bg }]}>BusinessDay</Text>
      <Text style={[type.mono, { color: theme.accent, marginTop: space.sm }]}>
        AFRICA’S BUSINESS INTELLIGENCE
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
