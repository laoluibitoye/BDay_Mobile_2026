import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { Button } from '../../components/Button';
import { GlassSheet } from '../../components/GlassSheet';
import { FeedEmptyState } from '../../components/FeedEmptyState';
import { useAppState } from '../../state/AppState';
import { useCheckout } from '../../hooks/useCheckout';
import { getPlans } from '../../lib/api/checkout';
import type { Plan } from '../../lib/api/types';
import { radius, space, type, useTheme } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Paywall'>;

// design.md §6 "Paywall sheet" — glass surface, gentle not hostile: primary CTA + a visible "Maybe later" path.
export function PaywallScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { authUser } = useAppState();
  const { startCheckout, loading } = useCheckout();

  const [plan, setPlan] = useState<Plan | null>(null);
  const [plansLoaded, setPlansLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPlans()
      .then((plans) => setPlan(plans[0] ?? null))
      .catch(() => setPlan(null))
      .finally(() => setPlansLoaded(true));
  }, []);

  const upgrade = async () => {
    if (!authUser) {
      navigation.navigate('Auth', { mode: 'signup' });
      return;
    }
    if (!plan) {
      // No reachable subscription-service — nothing real to check out against.
      setError('Subscriptions aren’t available right now. Try again shortly.');
      return;
    }

    setError(null);
    const result = await startCheckout(plan.id);
    if (result === 'activated') {
      navigation.goBack();
    } else if (result === 'unconfirmed') {
      setError('Payment not confirmed yet. If you completed checkout, try again in a moment.');
    } else if (result === 'unsupported') {
      setError('This payment method needs an app update to complete.');
    } else {
      setError('Something went wrong starting checkout. Try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Pressable style={StyleSheet.absoluteFill} onPress={() => navigation.goBack()} />
      <GlassSheet style={styles.sheet}>
        <Text style={[type.articleHeadline, { color: theme.ink }]}>Upgrade to Premium</Text>
        <Text style={[type.bodyUI, { color: theme.inkMuted, marginTop: space.sm }]}>
          Unlock unlimited reading, anytime, on any device.
        </Text>

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

        {error && <Text style={[type.bodyUI, { color: theme.marketDown, marginTop: space.md }]}>{error}</Text>}

        <View style={{ marginTop: space.xl, gap: space.md }}>
          <Button label="Upgrade Now" onPress={upgrade} loading={loading} fullWidth />
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={[type.bodyUI, { color: theme.inkMuted, textAlign: 'center' }]}>Maybe later</Text>
          </Pressable>
        </View>
        <Text style={[type.mono, { color: theme.inkFaint, textAlign: 'center', marginTop: space.lg }]}>
          SECURED PAYMENT · CANCEL ANYTIME
        </Text>
      </GlassSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(17,17,17,0.45)' },
  sheet: { padding: space.xl, paddingBottom: space.xxxl },
  planCard: { borderWidth: 1, borderRadius: radius.card, padding: space.lg, marginTop: space.xl },
});
