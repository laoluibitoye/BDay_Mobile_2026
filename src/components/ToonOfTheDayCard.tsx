import React, { useEffect, useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/types';
import { SectionLabel } from './SectionLabel';
import { getToons, type ToonItem } from '../lib/api/toons';
import { layout, radius, space, type, useTheme } from '../theme';

// The real `cartoons` CPT's latest post — same "Toon of the Day" the website's homepage shows.
// Renders nothing if there's no cartoon published yet, same self-fetch/hide-on-empty pattern as
// MarketTickerStrip.tsx.
export function ToonOfTheDayCard() {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [toon, setToon] = useState<ToonItem | null | undefined>(undefined);

  useEffect(() => {
    getToons()
      .then((res) => setToon(res.items[0] ?? null))
      .catch(() => setToon(null));
  }, []);

  if (!toon) return null;

  return (
    <View style={{ marginBottom: layout.sectionGap }}>
      <SectionLabel label="Toon of the Day" actionLabel="See all →" onPressAction={() => navigation.navigate('ToonArchive')} />
      <Pressable
        onPress={() => navigation.navigate('ToonArchive')}
        accessibilityRole="button"
        accessibilityLabel={toon.title}
        style={{ borderRadius: radius.card, overflow: 'hidden', backgroundColor: theme.bgCard }}
      >
        {toon.imageUrl && <Image source={{ uri: toon.imageUrl }} style={{ width: '100%', aspectRatio: 4 / 3 }} resizeMode="cover" />}
        <Text style={[type.cardTitle, { color: theme.ink, padding: space.sm }]} numberOfLines={1}>
          {toon.title}
        </Text>
      </Pressable>
    </View>
  );
}
