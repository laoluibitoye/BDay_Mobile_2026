import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { Button } from '../../components/Button';
import { GlassSheet } from '../../components/GlassSheet';
import { FeedEmptyState } from '../../components/FeedEmptyState';
import { useAppState } from '../../state/AppState';
import { useAppConfig } from '../../hooks/useAppConfig';
import { openWebSubscribe } from '../../lib/webCheckout';
import { getPlans } from '../../lib/api/checkout';
import type { Plan } from '../../lib/api/types';
import { fontFamily, radius, space, type, useTheme } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Paywall'>;

// Bug found live: this screen's copy was fully hardcoded and never read wp-admin → BusinessDay
// App → Paywall Copy's `paid_lock` entry, even though ArticleReaderScreen's in-article lock card
// (the screen that navigates here) already reads that same config correctly one tap earlier —
// an editor updating the prompt copy there saw it change on the lock card but not here.
const FALLBACK_COPY = {
  headline: 'Upgrade to Premium',
  body: 'Unlock unlimited reading, anytime, on any device.',
  buttonLabel: 'Upgrade Now',
  offerBadge: '',
};

// design.md §6 "Paywall sheet" — glass surface, gentle not hostile: primary CTA + a visible "Maybe later" path.
export function PaywallScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { authUser } = useAppState();
  const appConfig = useAppConfig();
  const copy = appConfig?.paywallCopy.paid_lock ?? FALLBACK_COPY;

  const [plan, setPlan] = useState<Plan | null>(null);
  const [plansLoaded, setPlansLoaded] = useState(false);

  useEffect(() => {
    getPlans()
      .then((plans) => setPlan(plans[0] ?? null))
      .catch(() => setPlan(null))
      .finally(() => setPlansLoaded(true));
  }, []);

  // Purchasing happens on the website now (see webCheckout.ts) — signing up is still fine
  // in-app (it's account creation, not a purchase), so a signed-out reader is prompted for that
  // first, then handed straight to the website to actually subscribe.
  const upgrade = () => {
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

        {plan ? (
          <View style={[styles.planCard, { borderColor: theme.rule, backgroundColor: theme.bgCard }]}>
            <Text style={[type.label, { color: theme.ink }]}>{plan.name}</Text>
            <Text style={[type.sectionHeadline, { color: theme.accent, marginTop: space.xs }]}>
              ₦{Number(plan.priceNgn).toLocaleString()}
            </Text>
            {plan.featureBullets.map((f) => (
              <Text key={f} style={[type.bodyUI, { color: theme.inkMuted, marginTop: space.xs }]}>
                · {f}
              </Text>
            ))}
          </View>
        ) : plansLoaded ? (
          <FeedEmptyState title="Plans unavailable" message="Subscriptions aren't available right now. Try again shortly." />
        ) : null}

        <View style={{ marginTop: space.xl, gap: space.md }}>
          <Button label={copy.buttonLabel} onPress={upgrade} fullWidth />
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
  planCard: { borderWidth: 1, borderRadius: radius.card, padding: space.lg, marginTop: space.xl },
  offerBadge: { borderRadius: radius.button, paddingVertical: space.xs, paddingHorizontal: space.md, alignSelf: 'flex-start' },
});
