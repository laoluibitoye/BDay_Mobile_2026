import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { Button } from '../../components/Button';
import { GlassSheet } from '../../components/GlassSheet';
import { subscriptionPlans } from '../../data/mock';
import { useAppState } from '../../state/AppState';
import { radius, space, type, useTheme } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Paywall'>;

// design.md §6 "Paywall sheet" — glass surface, gentle not hostile: primary CTA + a visible "Maybe later" path.
export function PaywallScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { setSubscribed } = useAppState();
  const plan = subscriptionPlans.find((p) => p.highlight) ?? subscriptionPlans[0];

  const upgrade = () => {
    setSubscribed(true);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Pressable style={StyleSheet.absoluteFill} onPress={() => navigation.goBack()} />
      <GlassSheet style={styles.sheet}>
        <Text style={[type.articleHeadline, { color: theme.ink }]}>Upgrade to Premium</Text>
        <Text style={[type.bodyUI, { color: theme.inkMuted, marginTop: space.sm }]}>
          Unlock unlimited reading, anytime, on any device.
        </Text>

        <View style={[styles.planCard, { borderColor: theme.rule, backgroundColor: theme.bgCard }]}>
          <Text style={[type.label, { color: theme.ink }]}>{plan.name}</Text>
          <Text style={[type.sectionHeadline, { color: theme.accent, marginTop: space.xs }]}>{plan.price}</Text>
          {plan.features.map((f) => (
            <Text key={f} style={[type.bodyUI, { color: theme.inkMuted, marginTop: space.xs }]}>
              · {f}
            </Text>
          ))}
        </View>

        <View style={{ marginTop: space.xl, gap: space.md }}>
          <Button label="Upgrade Now" onPress={upgrade} fullWidth />
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
