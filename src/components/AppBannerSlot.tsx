import React from 'react';
import { Linking, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useAppConfig } from '../hooks/useAppConfig';
import { bannersForPlacement, type AppBanner } from '../lib/api/appConfig';
import { radius, space } from '../theme';

type Props = { placement: AppBanner['placement'] };

// Editorially-managed promo banners (wp-admin → BusinessDay App → Banners), one cached fetch per
// app session via useAppConfig. Renders nothing until config loads and nothing if this placement
// has no active banner — never a layout gap or a loading spinner for what's a purely optional,
// non-critical surface.
export function AppBannerSlot({ placement }: Props) {
  const config = useAppConfig();
  if (!config) return null;

  const banners = bannersForPlacement(config, placement);
  if (banners.length === 0) return null;

  const banner = banners[0];

  const open = () => {
    if (banner.linkUrl) void Linking.openURL(banner.linkUrl);
  };

  return (
    <Pressable
      onPress={open}
      disabled={!banner.linkUrl}
      accessibilityRole={banner.linkUrl ? 'button' : undefined}
      accessibilityLabel={banner.title}
      style={styles.wrap}
    >
      <Image source={{ uri: banner.imageUrl }} style={styles.image} contentFit="cover" cachePolicy="memory-disk" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: space.lg,
    marginVertical: space.md,
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  image: { width: '100%', height: 90 },
});
