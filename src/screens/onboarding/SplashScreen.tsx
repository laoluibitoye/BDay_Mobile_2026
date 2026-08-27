import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { useAppState } from '../../state/AppState';
import { hasSeenOnboarding } from '../../lib/onboardingSeen';
import { space, type, useTheme } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const MIN_SPLASH_MS = 900;

export function SplashScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { authUser, sessionRestored } = useAppState();

  // Route once both a minimum splash duration has elapsed (so it doesn't just flash on a fast
  // restore) and the mount-time session-restore attempt (AppState.tsx) has actually settled — a
  // stored token means a real, already-logged-in reader goes straight to Main, skipping
  // Onboarding/Auth entirely, on every cold launch or reboot, not just the first one. Only a
  // device that has never seen the value-prop carousel goes to Onboarding; every other
  // logged-out case goes straight to Auth.
  useEffect(() => {
    if (!sessionRestored) return;
    let cancelled = false;
    const elapsed = new Promise<void>((resolve) => setTimeout(resolve, MIN_SPLASH_MS));

    (async () => {
      await elapsed;
      if (cancelled) return;
      if (authUser) {
        navigation.replace('Main');
        return;
      }
      const seen = await hasSeenOnboarding();
      if (cancelled) return;
      if (seen) {
        navigation.replace('Auth', { mode: 'login' });
      } else {
        navigation.replace('Onboarding');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authUser, sessionRestored, navigation]);

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
