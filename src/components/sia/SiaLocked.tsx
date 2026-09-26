import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from '../Button';
import { radius, space, type, useTheme } from '../../theme';
import { SIA_DISCLAIMER } from './SiaChat';

export type SiaLockReason = 'guest' | 'nonsub' | 'expired';

type Props = {
  reason: SiaLockReason;
  // A renewal/refresh is in flight ("Check again").
  checking: boolean;
  hint: string | null;
  onSubscribe: () => void;
  onLogin: () => void;
  onRecheck: () => void;
  bottomInset: number;
};

// What each locked state offers. Mirrors the website widget's "Unlock Sia" screen, so the two read alike.
// Guests keep the Sia button (so they know it exists) and get a clear way to subscribe as well as to log in.
const COPY = {
  guest: {
    title: 'Sia is for BusinessDay subscribers',
    body: 'Subscribe to ask Sia about any story, get instant summaries, and explore the context behind the news.',
    primary: { label: 'Subscribe', action: 'subscribe' },
    secondary: { label: 'Already a subscriber? Log in', action: 'login' },
  },
  nonsub: {
    title: 'Unlock Sia with a subscription',
    body: "Your account doesn't have an active subscription yet. Subscribe to start chatting with Sia about the news that matters.",
    primary: { label: 'Subscribe to unlock Sia', action: 'subscribe' },
    secondary: { label: 'Just subscribed? Check again', action: 'recheck' },
  },
  expired: {
    title: 'Please log in again',
    body: 'Your session has expired. Log in to keep chatting with Sia.',
    primary: { label: 'Log in', action: 'login' },
    secondary: null,
  },
} as const;

export function SiaLocked({ reason, checking, hint, onSubscribe, onLogin, onRecheck, bottomInset }: Props) {
  const { theme } = useTheme();
  const copy = COPY[reason];
  const run = (action: 'subscribe' | 'login' | 'recheck') => (action === 'subscribe' ? onSubscribe() : action === 'login' ? onLogin() : onRecheck());

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.body}>
        <View style={[styles.badge, { backgroundColor: theme.accentTint }]}>
          <Text style={[type.mono, { color: theme.accentDeep, textTransform: 'uppercase' }]}>Subscriber perk</Text>
        </View>
        <Text accessibilityRole="header" style={[type.sectionHeadline, { color: theme.ink, textAlign: 'center' }]}>
          {copy.title}
        </Text>
        <Text style={[type.bodyUI, { color: theme.inkMuted, textAlign: 'center' }]}>{copy.body}</Text>

        <View style={styles.actions}>
          <Button label={copy.primary.label} onPress={() => run(copy.primary.action)} fullWidth />
          {copy.secondary && (
            <Pressable
              onPress={() => run(copy.secondary.action)}
              disabled={checking}
              accessibilityRole="button"
              accessibilityState={{ disabled: checking, busy: checking }}
              style={[styles.secondary, checking && { opacity: 0.5 }]}
            >
              <Text style={[type.label, { color: theme.accentDeep }]}>{copy.secondary.label}</Text>
            </Pressable>
          )}
          {!!hint && (
            <Text accessibilityLiveRegion="polite" style={[type.caption, { color: theme.inkMuted, textAlign: 'center' }]}>
              {hint}
            </Text>
          )}
        </View>
      </View>

      <Text style={[type.caption, styles.disclaimer, { color: theme.inkFaint, paddingBottom: Math.max(bottomInset, space.sm) }]}>
        {SIA_DISCLAIMER}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.md, paddingHorizontal: space.xl },
  badge: { paddingVertical: space.xs, paddingHorizontal: space.md, borderRadius: radius.pill },
  actions: { alignSelf: 'stretch', alignItems: 'center', gap: space.sm, marginTop: space.sm, maxWidth: 340, width: '100%' },
  secondary: { minHeight: 44, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.md },
  disclaimer: { textAlign: 'center', paddingHorizontal: space.lg },
});
