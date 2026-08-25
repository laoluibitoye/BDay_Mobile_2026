import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, Share, Text, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { ListRow } from '../../components/ListRow';
import { getMyReferralCode, getMyReferrals, type ReferralCode, type ReferralRedemption } from '../../lib/api/referrals';
import { radius, space, type, useTheme } from '../../theme';

const WP_BASE_URL = process.env.EXPO_PUBLIC_WP_BASE_URL ?? '';

// The backend only ever returns the bare code — the shareable URL is built client-side, same as
// the web SDK does with its own origin.
function referralUrl(code: string): string {
  return `${WP_BASE_URL}?ref=${encodeURIComponent(code)}`;
}

export function ReferralsScreen() {
  const { theme } = useTheme();
  const [referralCode, setReferralCode] = useState<ReferralCode | null>(null);
  const [redemptions, setRedemptions] = useState<ReferralRedemption[] | null>(null);

  useEffect(() => {
    getMyReferralCode()
      .then(setReferralCode)
      .catch(() => setReferralCode(null));
    getMyReferrals()
      .then(setRedemptions)
      .catch(() => setRedemptions([]));
  }, []);

  const share = () => {
    if (!referralCode) return;
    Share.share({
      message: `Read BusinessDay with me — sign up with my link and we both get a discount: ${referralUrl(referralCode.code)}`,
    });
  };

  return (
    <Screen scroll={false} header={<AppHeader variant="compact" title="Refer a friend" showBack />}>
      <View style={{ padding: space.lg }}>
        <View
          style={{
            borderWidth: 1,
            borderColor: theme.rule,
            borderRadius: radius.card,
            padding: space.lg,
            backgroundColor: theme.bgCard,
          }}
        >
          <Text style={[type.bodyUI, { color: theme.inkMuted }]}>
            Share your code — when a friend subscribes, you both get a discount.
          </Text>
          <Text style={[type.mono, { color: theme.accentDeep, marginTop: space.md, fontSize: 20 }]}>
            {referralCode ? referralCode.code : '···'}
          </Text>
          <Pressable
            onPress={share}
            disabled={!referralCode}
            accessibilityRole="button"
            style={{
              marginTop: space.lg,
              paddingVertical: space.md,
              borderRadius: radius.card,
              alignItems: 'center',
              backgroundColor: referralCode ? theme.accent : theme.rule,
            }}
          >
            <Text style={[type.label, { color: '#fff' }]}>Share my code</Text>
          </Pressable>
        </View>
      </View>

      <Text style={[type.mono, { color: theme.inkFaint, paddingHorizontal: space.lg }]}>
        PEOPLE YOU'VE REFERRED
      </Text>
      <FlatList
        style={{ flex: 1 }}
        data={redemptions ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: space.lg, paddingBottom: 140 }}
        ListEmptyComponent={
          <Text style={[type.bodyUI, { color: theme.inkMuted, marginTop: space.md }]}>
            {redemptions === null ? 'Loading…' : 'No referrals yet — share your code to get started.'}
          </Text>
        }
        renderItem={({ item }) => (
          <ListRow
            title="A reader joined with your code"
            meta={new Date(item.createdAt).toLocaleDateString()}
            rightElement={<Text style={[type.mono, { color: theme.marketUp }]}>{item.rewardCouponCode}</Text>}
          />
        )}
      />
    </Screen>
  );
}
