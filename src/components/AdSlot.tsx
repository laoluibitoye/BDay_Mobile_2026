import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useAppConfig } from '../hooks/useAppConfig';
import { adSlot as findAdSlot, type AdSlot as AdSlotConfig } from '../lib/api/appConfig';
import { radius, space, type, useTheme } from '../theme';

type Props = { placement: AdSlotConfig['placement'] };

// No ad-network SDK (AdMob/etc) is wired into the app yet — that's a separate integration this
// component deliberately doesn't do. What it does do: render the house-ad fallback an editor
// configures in wp-admin → BusinessDay App → Ads, so the slot is never empty just because a
// network isn't hooked up yet. When `adUnitId` is set but no SDK renders it, that's the signal a
// real ad-network integration is the next step here — this component won't fake one.
export function AdSlot({ placement }: Props) {
  const { theme } = useTheme();
  const config = useAppConfig();
  if (!config) return null;

  const slot = findAdSlot(config, placement);
  if (!slot || !slot.enabled) return null;

  if (slot.houseAdImageUrl) {
    const open = () => {
      if (slot.houseAdLinkUrl) void Linking.openURL(slot.houseAdLinkUrl);
    };
    return (
      <Pressable onPress={open} disabled={!slot.houseAdLinkUrl} style={styles.imageWrap}>
        <Image source={{ uri: slot.houseAdImageUrl }} style={styles.image} contentFit="cover" cachePolicy="memory-disk" />
      </Pressable>
    );
  }

  if (slot.adUnitId) {
    return (
      <View style={[styles.placeholder, { borderColor: theme.rule, backgroundColor: theme.bgCard }]}>
        <Text style={[type.caption, { color: theme.inkFaint }]}>Ad</Text>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  imageWrap: { marginHorizontal: space.lg, marginVertical: space.md, borderRadius: radius.card, overflow: 'hidden' },
  image: { width: '100%', height: 90 },
  placeholder: {
    marginHorizontal: space.lg,
    marginVertical: space.md,
    borderRadius: radius.card,
    borderWidth: 1,
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
