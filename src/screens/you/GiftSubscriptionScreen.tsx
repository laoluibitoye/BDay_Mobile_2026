import React, { useEffect, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { Button } from '../../components/Button';
import { FeedEmptyState } from '../../components/FeedEmptyState';
import { useGiftSubscriptionCheckout } from '../../hooks/useGiftSubscriptionCheckout';
import { getPlans } from '../../lib/api/checkout';
import type { Plan } from '../../lib/api/types';
import { radius, space, type, useTheme } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'GiftSubscription'>;

// Web parity: gifting a subscription plan (as opposed to an article, which ArticleReaderScreen's
// gift icon already does). Requires the gifter to already have an active subscription — same
// gate gift-links.controller.ts enforces server-side — B2B plans aren't offered here since the
// backend rejects gifting a corporate plan outright (gift.service.ts).
export function GiftSubscriptionScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { startGiftCheckout, loading, lastErrorMessage } = useGiftSubscriptionCheckout();
  const [plans, setPlans] = useState<Plan[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const loadPlans = () => {
    setLoadFailed(false);
    getPlans()
      .then((res) => {
        const giftablePlans = res.filter((p) => !p.isB2b && p.active);
        setPlans(giftablePlans);
        setSelectedPlanId((prev) => prev ?? giftablePlans[0]?.id ?? null);
      })
      .catch(() => setLoadFailed(true));
  };

  useEffect(loadPlans, []);

  const submit = async () => {
    setError(null);
    if (!selectedPlanId) return;
    if (!recipientEmail.trim()) {
      setError("Enter the recipient's email address.");
      return;
    }
    const result = await startGiftCheckout(selectedPlanId, recipientEmail.trim());
    if (result.status === 'activated') {
      setSent(true);
    } else if (result.status === 'unconfirmed') {
      setError('Payment not confirmed yet. If you completed checkout, try again in a moment.');
    } else if (result.status === 'unsupported') {
      setError('This payment method needs an app update to complete.');
    } else if (result.status === 'error') {
      setError(lastErrorMessage ?? 'Something went wrong starting checkout. Try again.');
    }
  };

  if (sent) {
    return (
      <Screen header={<AppHeader variant="compact" title="Gift a subscription" showBack />}>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <FeedEmptyState
            title="Gift sent"
            message={`We've emailed ${recipientEmail.trim()} with instructions to redeem their subscription.`}
          />
          <View style={{ marginTop: space.lg, alignItems: 'center' }}>
            <Button label="Done" onPress={() => navigation.goBack()} />
          </View>
        </View>
      </Screen>
    );
  }

  return (
    <Screen header={<AppHeader variant="compact" title="Gift a subscription" showBack />}>
      <View style={{ padding: space.lg }}>
        <Text style={[type.bodyUI, { color: theme.inkMuted }]}>
          Buy someone else a BusinessDay subscription — they'll get an email with a link to redeem it.
        </Text>

        {loadFailed ? (
          <View style={{ marginTop: space.xl }}>
            <FeedEmptyState title="Couldn't load plans" message="Check your connection and try again." onRetry={loadPlans} />
          </View>
        ) : plans !== null && plans.length === 0 ? (
          <View style={{ marginTop: space.xl }}>
            <FeedEmptyState title="No plans available to gift" message="Check back shortly." />
          </View>
        ) : (
          <>
            <View style={{ marginTop: space.xl, gap: space.md }}>
              {(plans ?? []).map((plan) => (
                <Button
                  key={plan.id}
                  label={plan.name}
                  variant={plan.id === selectedPlanId ? 'primary' : 'secondary'}
                  onPress={() => setSelectedPlanId(plan.id)}
                  fullWidth
                />
              ))}
            </View>

            <View style={{ marginTop: space.xl }}>
              <Text style={[type.caption, { color: theme.inkMuted, marginBottom: space.xs }]}>Recipient's email</Text>
              <TextInput
                value={recipientEmail}
                onChangeText={setRecipientEmail}
                placeholder="name@example.com"
                placeholderTextColor={theme.inkFaint}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                style={[
                  type.bodyUI,
                  { color: theme.ink, borderWidth: 1, borderColor: theme.rule, borderRadius: radius.button, paddingHorizontal: space.md, paddingVertical: space.sm },
                ]}
              />
            </View>

            {error && <Text style={[type.bodyUI, { color: theme.marketDown, marginTop: space.md }]}>{error}</Text>}

            <View style={{ marginTop: space.xl }}>
              <Button label="Continue to payment" onPress={submit} loading={loading} disabled={!selectedPlanId} fullWidth />
            </View>
          </>
        )}
      </View>
    </Screen>
  );
}
