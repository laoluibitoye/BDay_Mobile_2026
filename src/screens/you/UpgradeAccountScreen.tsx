import React, { useEffect, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { Button } from '../../components/Button';
import { FeedEmptyState } from '../../components/FeedEmptyState';
import { useB2bCheckout } from '../../hooks/useB2bCheckout';
import { getPlans } from '../../lib/api/checkout';
import type { Plan } from '../../lib/api/types';
import { radius, space, type, useTheme } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'UpgradeAccount'>;

// Web parity: my-account.ts's "Upgrade Account" tab. A B2B plan purchase doesn't activate on its
// own (see useB2bCheckout.ts) — it only becomes a real organization once paired with an org name
// here, so this screen collects that name up front rather than asking for it after payment.
export function UpgradeAccountScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { startUpgrade, loading, lastErrorMessage } = useB2bCheckout();
  const [plans, setPlans] = useState<Plan[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [orgName, setOrgName] = useState('');
  const [seats, setSeats] = useState('5');
  const [error, setError] = useState<string | null>(null);

  const loadPlans = () => {
    setLoadFailed(false);
    getPlans()
      .then((res) => {
        const b2bPlans = res.filter((p) => p.isB2b && p.active);
        setPlans(b2bPlans);
        setSelectedPlanId((prev) => prev ?? b2bPlans[0]?.id ?? null);
      })
      .catch(() => setLoadFailed(true));
  };

  useEffect(loadPlans, []);

  const selectedPlan = plans?.find((p) => p.id === selectedPlanId) ?? null;
  const seatCount = Math.max(1, parseInt(seats, 10) || 0);
  const belowMinimum = !!selectedPlan?.seatMin && seatCount < selectedPlan.seatMin;

  const submit = async () => {
    setError(null);
    if (!selectedPlanId) return;
    if (!orgName.trim()) {
      setError('Enter your organization name.');
      return;
    }
    if (belowMinimum) {
      setError(`This plan needs at least ${selectedPlan?.seatMin} seats.`);
      return;
    }
    const result = await startUpgrade(selectedPlanId, orgName.trim(), seatCount);
    if (result.status === 'activated') {
      navigation.replace('Team');
    } else if (result.status === 'unconfirmed') {
      setError('Payment not confirmed yet. If you completed checkout, try again in a moment.');
    } else if (result.status === 'unsupported') {
      setError('This payment method needs an app update to complete.');
    } else if (result.status === 'error') {
      setError(lastErrorMessage ?? 'Something went wrong starting checkout. Try again.');
    }
  };

  return (
    <Screen header={<AppHeader variant="compact" title="Upgrade Account" showBack />}>
      <View style={{ padding: space.lg }}>
        <Text style={[type.bodyUI, { color: theme.inkMuted }]}>
          Set up a company account — one subscription covering your whole team, managed from one place.
        </Text>

        {loadFailed ? (
          <View style={{ marginTop: space.xl }}>
            <FeedEmptyState title="Couldn't load plans" message="Check your connection and try again." onRetry={loadPlans} />
          </View>
        ) : plans !== null && plans.length === 0 ? (
          <View style={{ marginTop: space.xl }}>
            <FeedEmptyState title="No company plans available" message="Check back shortly." />
          </View>
        ) : (
          <>
            <View style={{ marginTop: space.xl, gap: space.md }}>
              {(plans ?? []).map((plan) => {
                const active = plan.id === selectedPlanId;
                return (
                  <Button
                    key={plan.id}
                    label={`${plan.name}${plan.seatMin ? ` (min ${plan.seatMin} seats)` : ''}`}
                    variant={active ? 'primary' : 'secondary'}
                    onPress={() => setSelectedPlanId(plan.id)}
                    fullWidth
                  />
                );
              })}
            </View>

            <View style={{ marginTop: space.xl }}>
              <Text style={[type.caption, { color: theme.inkMuted, marginBottom: space.xs }]}>Organization name</Text>
              <TextInput
                value={orgName}
                onChangeText={setOrgName}
                placeholder="e.g. BusinessDay Media Ltd"
                placeholderTextColor={theme.inkFaint}
                style={[
                  type.bodyUI,
                  { color: theme.ink, borderWidth: 1, borderColor: theme.rule, borderRadius: radius.button, paddingHorizontal: space.md, paddingVertical: space.sm },
                ]}
              />
            </View>

            <View style={{ marginTop: space.lg }}>
              <Text style={[type.caption, { color: theme.inkMuted, marginBottom: space.xs }]}>Seats</Text>
              <TextInput
                value={seats}
                onChangeText={setSeats}
                keyboardType="number-pad"
                style={[
                  type.bodyUI,
                  { color: theme.ink, borderWidth: 1, borderColor: theme.rule, borderRadius: radius.button, paddingHorizontal: space.md, paddingVertical: space.sm, width: 100 },
                ]}
              />
            </View>

            {error && <Text style={[type.bodyUI, { color: theme.marketDown, marginTop: space.md }]}>{error}</Text>}

            <View style={{ marginTop: space.xl }}>
              <Button label="Subscribe and create organization" onPress={submit} loading={loading} disabled={!selectedPlanId} fullWidth />
            </View>
          </>
        )}
      </View>
    </Screen>
  );
}
